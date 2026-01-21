<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

class MetaProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $allowedUrls = [
            'https://www.instagram.com/p/',
            'https://www.instagram.com/reel/',
        ];

        $posts = preg_split('/\\R/', $cObj->data['bodytext']);

        $filteredUrls = array_values(array_filter($posts, function (string $url) use ($allowedUrls): bool {
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
        $vals['src'] = '//www.instagram.com/embed.js';
        $vals['posts'] = $filteredUrls;
        $processedData[$as] = $vals;

        return $processedData;
    }
}
