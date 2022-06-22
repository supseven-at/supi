<?php

declare(strict_types=1);

namespace Supseven\Supi\Rendering;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use TYPO3\CMS\Fluid\View\StandaloneView;
use TYPO3\CMS\Frontend\ContentObject\ContentDataProcessor;
use TYPO3\CMS\Frontend\Plugin\AbstractPlugin;

/**
 * Banner renderer
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class BannerRenderer extends AbstractPlugin
{
    /**
     * @var StandaloneView
     */
    private $view;

    /**
     * @var array
     */
    private $configuration;

    /**
     * @var \TYPO3\CMS\Extbase\Service\TypoScriptService|\TYPO3\CMS\Core\TypoScript\TypoScriptService
     */
    private $typoscriptService;

    /**
     * @var \TYPO3\CMS\Core\Localization\LanguageService|\TYPO3\CMS\Lang\LanguageService
     */
    private $languageService;

    /**
     * @var ContentDataProcessor
     */
    private $dataProcessor;

    /**
     * @var array|mixed
     */
    private $dataProcessing;

    /**
     * @codeCoverageIgnore
     * BannerRenderer constructor.
     * @param array|null $configuration
     * @param StandaloneView|null $view
     * @param \TYPO3\CMS\Extbase\Service\TypoScriptService|\TYPO3\CMS\Core\TypoScript\TypoScriptService|null $typoscriptService
     * @param \TYPO3\CMS\Core\Localization\LanguageService|\TYPO3\CMS\Lang\LanguageService|null $languageService
     */
    public function __construct(array $configuration = null, StandaloneView $view = null, $typoscriptService = null, $languageService = null, $dataProcessor = null)
    {
        if (empty($configuration)) {
            if (class_exists(ObjectManager::class)) {
                $configurationManager = GeneralUtility::makeInstance(ObjectManager::class)->get(ConfigurationManagerInterface::class);
            } else {
                $configurationManager = GeneralUtility::makeInstance(ConfigurationManagerInterface::class);
            }
            $configuration = $configurationManager->getConfiguration(
                ConfigurationManagerInterface::CONFIGURATION_TYPE_FRAMEWORK,
                'Supi',
                'Pi1'
            );
        }

        $this->configuration = $configuration;
        $this->view = $view ?: GeneralUtility::makeInstance(StandaloneView::class);

        if (!$languageService) {
            if (class_exists(\TYPO3\CMS\Lang\LanguageService::class)) {
                $languageService = GeneralUtility::makeInstance(\TYPO3\CMS\Lang\LanguageService::class);
            } else {
                $languageService = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageService::class);
            }

            if (method_exists($languageService, 'init')) {
                if (!empty($GLOBALS['TYPO3_REQUEST'])) {
                    $languageService->init($GLOBALS['TYPO3_REQUEST']->getAttribute('language')->getTypo3Language());
                } else {
                    $languageService->init($GLOBALS['TSFE']->sys_language_isocode);
                }
            }
        }

        if (!$typoscriptService) {
            if (class_exists(\TYPO3\CMS\Extbase\Service\TypoScriptService::class)) {
                $typoscriptService = GeneralUtility::makeInstance(\TYPO3\CMS\Extbase\Service\TypoScriptService::class);
            } else {
                $typoscriptService = GeneralUtility::makeInstance(\TYPO3\CMS\Core\TypoScript\TypoScriptService::class);
            }
        }

        $this->languageService = $languageService;
        $this->typoscriptService = $typoscriptService;
        $this->dataProcessor = $dataProcessor ?: GeneralUtility::makeInstance(ContentDataProcessor::class);
    }

    public function overrideSettings(array $settings)
    {
        $this->configuration = array_replace_recursive($this->configuration, $settings);
    }

    public function render(): string
    {
        if ($this->cObj && $this->dataProcessing) {
            $conf = ['dataProcessing.' => $this->dataProcessing];
            $out = $this->dataProcessor->process($this->cObj, $conf, $this->configuration);
            $this->configuration['settings'] = $out['settings'];
            $this->configuration['data'] = $out['data'];
        }

        $this->view->getRequest()->setControllerExtensionName($this->configuration['extbase']['controllerExtensionName']);
        $this->view->setTemplateRootPaths($this->configuration['templateRootPaths']);
        $this->view->setLayoutRootPaths($this->configuration['layoutRootPaths']);
        $this->view->setPartialRootPaths($this->configuration['partialRootPaths']);
        $this->view->setTemplate($this->configuration['templateName']);
        $this->view->assignMultiple([
            'settings' => $this->configuration['settings'],
            'data'     => $this->configuration['data'] ?? null,
            'config'   => json_encode($this->compileClientConfig($this->configuration['settings'])),
        ]);

        return $this->view->render();
    }

    public function userFunc($content, $conf): string
    {
        if (is_array($conf) && !empty($conf)) {
            $this->dataProcessing = $conf['dataProcessing.'] ?? [];
            unset($conf['dataProcessing.']);
            $overrides = $this->typoscriptService->convertTypoScriptArrayToPlainArray($conf);
            $this->overrideSettings($overrides);
        }

        if ($this->cObj && $this->cObj->data) {
            $this->configuration['data'] = $this->cObj->data;
        }

        return $this->render();
    }

    private function compileClientConfig(array $elements): array
    {
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

                if (is_string($value) && strpos($value, 'LLL:') === 0) {
                    $translated = $this->languageService->sL($value);
                    $value = null;

                    if ($translated && $translated !== $value) {
                        $value = $translated;
                    }
                }

                if (is_array($value)) {
                    $value = $this->compileClientConfig($value);
                }

                if (($value !== null && $value !== '') || (is_array($value) && count($value) > 0)) {
                    $new[$key] = $value;
                }
            }
        }

        unset(
            $new['button'],
            $new['content'],
            $new['detail'],
            $new['gdpr'],
            $new['overview']
        );

        return $new;
    }
}
