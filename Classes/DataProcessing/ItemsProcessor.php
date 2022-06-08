<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ItemsProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData)
    {
        $elements = $processedData['settings']['elements'] ?? [];

        foreach ($elements as $i => $element) {
            foreach ($element['items'] ?? [] as $j => $item) {
                $policy = $item['table']['policy'] ?? '';

                if ($policy && MathUtility::canBeInterpretedAsInteger($policy)) {
                    $policy = $cObj->typoLink_URL(['parameter' => $policy, 'forceAbsoluteUrl' => true]);
                }

                $processedData['settings']['elements'][$i]['items'][$j]['table']['policyUrl'] = $policy;
            }
        }

        return $processedData;
    }
}
