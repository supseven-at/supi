<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

#[AutoconfigureTag('data.processor', ['identifier' => 'supi-meta'])]
class MetaProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $posts = preg_split('/\\R/', $cObj->data['bodytext']);

        $filteredUrls = array_values(array_filter($posts, static function (string $url): bool {
            static $allowedUrls = [
                'https://www.instagram.com/p/',
                'https://www.instagram.com/reel/',
            ];

            foreach ($allowedUrls as $allowed) {
                if (str_starts_with($url, $allowed)) {
                    return true;
                }
            }

            return false;
        }));

        if (count($filteredUrls) <= 0) {
            return $processedData;
        }

        $as = $processorConfiguration['as'] ?? 'metaAttr';
        $vals = $processedData['settings']['meta']['iframeAttr'] ?? [];
        $vals['src'] = 'https://www.instagram.com/embed.js';
        $vals['posts'] = $filteredUrls;
        $processedData[$as] = $vals;

        return $processedData;
    }
}
