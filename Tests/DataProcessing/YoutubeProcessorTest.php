<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use org\bovigo\vfs\vfsStream;
use PHPUnit\Framework\TestCase;
use Supseven\Supi\DataProcessing\YoutubeProcessor;
use TYPO3\CMS\Core\Core\ApplicationContext;
use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Resource\FileReference;
use TYPO3\CMS\Core\Resource\FileRepository;
use TYPO3\CMS\Core\Resource\ResourceStorage;
use TYPO3\CMS\Core\Resource\StorageRepository;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class YoutubeProcessorTest extends TestCase
{
    public function testFileReferences(): void
    {
        [$id, $root, $previewUrl, $storage, $cObj, $embedUrl, $preview] = $this->createShared();

        $fileRepo = new readonly class () extends FileRepository {
            public function __construct()
            {
            }
        };

        $ref1 = $this->createMock(FileReference::class);
        $ref1->expects(static::any())->method('getContents')->willReturn($id);
        $ref1->expects(static::any())->method('getMimeType')->willReturn('video/youtube');

        $ref2 = $this->createMock(FileReference::class);
        $ref2->expects(static::never())->method('getContents');
        $ref2->expects(static::any())->method('getMimeType')->willReturn('image/png');

        $refencesField = 'assets';
        $config['referencesField'] = $refencesField;
        $processedData = [$refencesField => [$ref1, $ref2]];

        Environment::initialize(
            new ApplicationContext('Testing'),
            false,
            true,
            '/project',
            $root->url(),
            '/var',
            '/config',
            '/project/typo3',
            'Linux'
        );

        $subject = new YoutubeProcessor($storage, $fileRepo);
        $subject->downloadUrl = $previewUrl;
        $subject->embedUrl = $embedUrl . '{id}';
        $actual = $subject->process($cObj, [], $config, $processedData);

        $expected = array_merge($processedData, [
            'videos' => [
                [
                    'reference' => $ref1,
                    'preview'   => $preview,
                    'id'        => $id,
                    'url'       => $embedUrl . $id,
                ],
            ],
        ]);

        static::assertTrue($root->hasChild('fileadmin/user_upload/youtube_' . md5($id) . '.jpg'));
        static::assertEquals($expected, $actual);
    }

    public function testId(): void
    {
        [$id, $root, $previewUrl, $storage, $cObj, $embedUrl, $preview] = $this->createShared();

        $fileRepo = new readonly class () extends FileRepository {
            public function __construct()
            {
            }
        };
        $ref = $this->createMock(FileReference::class);
        $ref->expects(static::any())->method('getContents')->willReturn($id);
        $idsField = 'yt_ids';
        $config['idsField'] = $idsField;
        $cObj->data[$idsField] = $id;

        Environment::initialize(
            new ApplicationContext('Testing'),
            false,
            true,
            '/project',
            $root->url(),
            '/var',
            '/config',
            '/project/typo3',
            'Linux'
        );

        $subject = new YoutubeProcessor($storage, $fileRepo);
        $subject->downloadUrl = $previewUrl;
        $subject->embedUrl = $embedUrl . '{id}';
        $actual = $subject->process($cObj, [], $config, []);

        $expected = [
            'videos' => [
                [
                    'reference' => null,
                    'preview'   => $preview,
                    'id'        => $id,
                    'url'       => $embedUrl . $id,
                ],
            ],
        ];

        static::assertTrue($root->hasChild('fileadmin/user_upload/youtube_' . md5($id) . '.jpg'));
        static::assertEquals($expected, $actual);
    }

    public function testUrl(): void
    {
        [$id, $root, $previewUrl, $storage, $cObj, $embedUrl, $preview] = $this->createShared();

        $fileRepo = new readonly class () extends FileRepository {
            public function __construct()
            {
            }
        };
        $ref = $this->createMock(FileReference::class);
        $ref->expects(static::any())->method('getContents')->willReturn($id);
        $urlsField = 'yt_urls';
        $config['urlsField'] = $urlsField;
        $cObj->data[$urlsField] = 'https://www.youtube.com/embed/' . $id;

        Environment::initialize(
            new ApplicationContext('Testing'),
            false,
            true,
            '/project',
            $root->url(),
            '/var',
            '/config',
            '/project/typo3',
            'Linux'
        );

        $subject = new YoutubeProcessor($storage, $fileRepo);
        $subject->downloadUrl = $previewUrl;
        $subject->embedUrl = $embedUrl . '{id}';

        $actual = $subject->process($cObj, [], $config, []);

        $expected = [
            'videos' => [
                [
                    'reference' => null,
                    'preview'   => $preview,
                    'id'        => $id,
                    'url'       => $embedUrl . $id,
                ],
            ],
        ];

        static::assertTrue($root->hasChild('fileadmin/user_upload/youtube_' . md5($id) . '.jpg'));
        static::assertEquals($expected, $actual);
    }

    /**
     * @return array
     */
    protected function createShared()
    {
        $id = '123456789ab';
        $root = vfsStream::setup('supi', null, [
            'fileadmin' => [
                'user_upload' => [],
            ],
            'youtube' => [
                'preview_' . $id . '_0.jpg' => 'Preview Image',
            ],
        ]);
        $previewUrl = $root->getChild('youtube')->url() . '/preview_{id}_{file}';
        $storage = $this->createMock(ResourceStorage::class);

        $cObj = (new \ReflectionClass(ContentObjectRenderer::class))->newInstanceWithoutConstructor();
        $fileId = '/user_upload/youtube_' . md5($id) . '.jpg';
        $embedUrl = 'youtube.com/';

        $preview = (new \ReflectionClass(FileReference::class))->newInstanceWithoutConstructor();
        $storage->expects(static::any())->method('getFile')->with(static::equalTo($fileId))->willReturn($preview);

        $storageRepository = $this->createMock(StorageRepository::class);
        $storageRepository->method('getDefaultStorage')->willReturn($storage);

        return [$id, $root, $previewUrl, $storageRepository, $cObj, $embedUrl, $preview];
    }
}
