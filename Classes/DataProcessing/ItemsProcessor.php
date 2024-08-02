<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ItemsProcessor implements DataProcessorInterface
{
    public function __construct(
        protected readonly LanguageServiceFactory $languageServiceFactory,
    ) {
    }

    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        // Generate URLs for policy pages
        foreach ($processedData['settings']['elements'] ?? [] as $i => $element) {
            foreach ($element['items'] ?? [] as $j => $item) {
                $policy = (string)($item['table']['policy'] ?? '');

                if ($policy) {
                    if (MathUtility::canBeInterpretedAsInteger($policy)) {
                        $policy = $cObj->typoLink_URL(['parameter' => $policy, 'forceAbsoluteUrl' => true]);
                    } elseif (str_starts_with($policy, 'LLL:')) {
                        $siteLanguage = $cObj->getRequest()->getAttribute('language');
                        $languageService = $this->languageServiceFactory->createFromSiteLanguage($siteLanguage);
                        $policy = $languageService->sL($policy);
                    }
                }

                $processedData['settings']['elements'][$i]['items'][$j]['table']['policyUrl'] = $policy;
            }
        }

        // Generate JSON for service tag attributes
        foreach ($processedData['settings']['services'] ?? [] as $i => $service) {
            if (!empty($service['attr'])) {
                $processedData['settings']['services'][$i]['attrJson'] = json_encode($service['attr'], JSON_FORCE_OBJECT);
            }
        }

        return $processedData;
    }
}
