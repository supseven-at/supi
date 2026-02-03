<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
#[AutoconfigureTag('data.processor', ['identifier' => 'supi-services'])]
class ServicesProcessor implements DataProcessorInterface
{
    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        foreach ($processedData['settings']['services'] ?? [] as $key => $data) {
            if (!empty($data['attr'])) {
                $processedData['settings']['services'][$key]['attrJson'] = json_encode($data['attr']);
            }
        }

        return $processedData;
    }
}
