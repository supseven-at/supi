<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SpotifyProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $id = $cObj->data['bodytext'];
        $as = $processorConfiguration['as'] ?? 'spotifyAttr';
        $vals = $processedData['settings']['spotify']['playerAttr'] ?? [];
        $url = ($processedData['settings']['spotify']['url'] ?? '') ?: 'https://open.spotify.com/embed/playlist/{id}';
        $vals['src'] = str_replace('{id}', $id, $url);
        $processedData[$as] = json_encode($vals, JSON_FORCE_OBJECT);

        return $processedData;
    }
}
