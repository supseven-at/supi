<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
#[AutoconfigureTag('data.processor', ['identifier' => 'supi-settings'])]
class SettingsProcessor implements DataProcessorInterface
{
    protected LanguageService $languageService;

    public function __construct(
        protected readonly TypoScriptService $typoScriptService,
        protected readonly LanguageServiceFactory $languageServiceFactory,
    ) {
    }

    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData): array
    {
        $this->languageService = $this->languageServiceFactory->createFromSiteLanguage($cObj->getRequest()->getAttribute('language'));

        $settings = $cObj->getRequest()->getAttribute('frontend.typoscript')->getSetupArray()['plugin.']['tx_supi.']['settings.'];
        $settings = $this->typoScriptService->convertTypoScriptArrayToPlainArray($settings);

        $processedData['settings'] = $settings;
        $processedData['config'] = json_encode($this->compileClientConfig($settings, true));

        return $processedData;
    }

    protected function compileClientConfig(array $elements, bool $isRoot): array
    {
        if ($isRoot) {
            unset(
                $elements['content'],
                $elements['overview'],
                $elements['switch'],
                $elements['detail'],
                $elements['gdpr'],
                $elements['spotify'],
                $elements['youtube'],
                $elements['button']
            );
        }

        $new = [];
        $booleans = [
            'detailed',
            'essentialIncludesYoutube',
            'essentialIncludesMaps',
            'required',
            'showOnLoad',
            'hideAutoEssential',
            'hideOverlayOnButtonCe',
            'perItemDetail',
            'perItemSelect',
            'showBigSwitch',
        ];

        foreach ($elements as $key => $value) {
            if ($key !== 'label' && $key !== 'text' && $key !== 'table') {
                if (in_array($key, $booleans, true)) {
                    $value = ((int)$value !== 0);
                }

                if (is_string($value) && str_starts_with($value, 'LLL:')) {
                    $translated = $this->languageService->sL($value);
                    $value = null;

                    if ($translated && $translated !== $value) {
                        $value = $translated;
                    }
                }

                if (is_array($value)) {
                    $value = $this->compileClientConfig($value, false);
                }

                if (($value !== null && $value !== '') || (is_array($value) && count($value) > 0)) {
                    $new[$key] = $value;
                }
            }
        }

        return $new;
    }
}
