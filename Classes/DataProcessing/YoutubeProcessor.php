<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3\CMS\Core\Resource\FileRepository;
use TYPO3\CMS\Core\Resource\StorageRepository;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * Load Youtube preview images and passes them as FAL objects
 * as well as the target embed URL
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class YoutubeProcessor implements DataProcessorInterface
{
    /**
     * @var string
     */
    public string $downloadUrl = 'https://img.youtube.com/vi/{id}/{file}';

    /**
     * @var string
     */
    public string $embedUrl = 'https://www.youtube-nocookie.com/embed/{id}';

    public function __construct(
        private readonly StorageRepository $storageRepository,
        private readonly FileRepository $fileRepository,
    ) {
    }

    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $videos = [];
        $referencesField = $processorConfiguration['referencesField'] ?? 'files';

        foreach ($processedData[$referencesField] ?? [] as $reference) {
            $videoId = $reference->getContents();
            $video = $this->getVideo($videoId, $reference);

            if ($video) {
                $videos[] = $video;
            }
        }

        foreach (GeneralUtility::trimExplode("\n", $cObj->data[$processorConfiguration['idsField'] ?? 'tx_supi_youtube_ids'] ?? '', true) as $videoId) {
            $video = $this->getVideo($videoId);

            if ($video) {
                $videos[] = $video;
            }
        }

        foreach (GeneralUtility::trimExplode("\n", $cObj->data[$processorConfiguration['urlsField'] ?? 'tx_supi_youtube_urls'] ?? '', true) as $url) {
            preg_match('%(?:youtube(?:-nocookie)?\.com/(?:[^/]+/.+/|(?:v|e(?:mbed)?)/|.*[?&]v=)|youtu\.be/)([^"&?/ ]{11})%i', $url, $match);

            if (is_array($match) && !empty($match[1])) {
                $videoId = $match[1];
                $video = $this->getVideo($videoId);

                if ($video) {
                    $videos[] = $video;
                }
            }
        }

        if ($videos) {
            $processedData[$processorConfiguration['as'] ?? 'videos'] = $videos;
        }

        return $processedData;
    }

    /**
     * @param $videoId
     * @return array|null
     */
    protected function getVideo($videoId, ?FileReference $reference = null): ?array
    {
        $fileId = '/user_upload/youtube_' . md5($videoId) . '.jpg';
        $fileName = Environment::getPublicPath() . '/fileadmin' . $fileId;
        $file = null;
        $fileObjects = null;

        if ($reference && $reference->getProperty('tx_supi_video_cover') > 0) {
            $fileObjects = $this->fileRepository->findByRelation('sys_file_reference', 'tx_supi_video_cover', $reference->getUid())[0] ?? null;
        }

        if (!$fileObjects) {
            if (!file_exists($fileName)) {
                $tryNames = ['maxresdefault.jpg', 'mqdefault.jpg', '0.jpg'];

                foreach ($tryNames as $tryName) {
                    $previewUrl = str_replace(
                        ['{id}', '{file}'],
                        [$videoId, $tryName],
                        $this->downloadUrl
                    );
                    $previewImage = GeneralUtility::getUrl($previewUrl);

                    if ($previewImage) {
                        GeneralUtility::mkdir_deep(dirname($fileName));
                        GeneralUtility::writeFile($fileName, $previewImage, true);
                        break;
                    }
                }
            }

            if (file_exists($fileName)) {
                $file = $this->storageRepository->getDefaultStorage()->getFile($fileId);
            }
        }

        return [
            'reference' => $reference,
            'preview'   => $fileObjects ?? $file,
            'id'        => $videoId,
            'url'       => str_replace('{id}', $videoId, $this->embedUrl),
        ];
    }
}
