<?php

declare(strict_types=1);

namespace Supseven\Supi\Rendering;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Mvc\Request;
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
        $this->languageService = $languageService ?? null;

        if (!$this->languageService) {
            if (class_exists(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class) && !empty($GLOBALS['TYPO3_REQUEST'])) {
                $this->languageService = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageServiceFactory::class)->createFromSiteLanguage($GLOBALS['TYPO3_REQUEST']->getAttribute('language'));
            } else {
                if (class_exists(\TYPO3\CMS\Lang\LanguageService::class)) {
                    $this->languageService = GeneralUtility::makeInstance(\TYPO3\CMS\Lang\LanguageService::class);
                } else {
                    $this->languageService = GeneralUtility::makeInstance(\TYPO3\CMS\Core\Localization\LanguageService::class);
                }

                if (method_exists($this->languageService, 'init')) {
                    if (!empty($GLOBALS['TYPO3_REQUEST'])) {
                        $this->languageService->init($GLOBALS['TYPO3_REQUEST']->getAttribute('language')->getTypo3Language());
                    } elseif (!empty($GLOBALS['TSFE'])) {
                        $this->languageService->init($GLOBALS['TSFE']->sys_language_isocode);
                    } else {
                        $this->languageService->init('default');
                    }
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
            $data = $this->configuration;

            if (empty($data['data'])) {
                $data['data'] = $this->cObj->data;
            }

            $out = $this->dataProcessor->process($this->cObj, $conf, $data);
            $this->configuration['settings'] = $out['settings'];
            $this->configuration['data'] = $out['data'];
        }

        if (method_exists($this->view, 'getRenderingContext')) {
            $request = $this->view->getRenderingContext();

            if (!empty($GLOBALS['TYPO3_REQUEST']) && method_exists($request, 'setRequest')) {
                $request->setRequest((new Request())->withControllerExtensionName('Theme'));
            }
        }

        if (method_exists($this->view, 'getRequest')
            && $this->view->getRequest()
            && method_exists($this->view->getRequest(), 'setControllerExtensionName')
            && !empty($this->configuration['extbase']['controllerExtensionName'])) {
            $this->view->getRequest()->setControllerExtensionName($this->configuration['extbase']['controllerExtensionName']);
        }

        $this->view->setTemplateRootPaths($this->configuration['templateRootPaths']);
        $this->view->setLayoutRootPaths($this->configuration['layoutRootPaths']);
        $this->view->setPartialRootPaths($this->configuration['partialRootPaths']);
        $this->view->setTemplate($this->configuration['templateName']);
        $this->view->assignMultiple([
            'settings' => $this->configuration['settings'],
            'data'     => $this->configuration['data'] ?? null,
            'config'   => json_encode($this->compileClientConfig($this->configuration['settings'], true)),
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

    private function compileClientConfig(array $elements, bool $isRoot): array
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

                if (is_string($value) && strpos($value, 'LLL:') === 0) {
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
