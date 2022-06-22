<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * Process a natural language adress text into a format that is URL friendly
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class AddressProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData)
    {
        $address = $cObj->data[$processorConfiguration['field'] ?? 'bodytext'] ?? '';

        if (strpos($address, ',') !== false) {
            $address = GeneralUtility::trimExplode(",", $address, true);
        } else {
            $address = GeneralUtility::trimExplode("\n", $address, true);
        }

        $processedData[$processorConfiguration['as'] ?? 'address'] = implode(',', $address);

        return $processedData;
    }
}
