<?php
declare(strict_types=1);
namespace Supseven\Supi\Rendering;

use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use TYPO3\CMS\Fluid\View\StandaloneView;
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
     * @var \TYPO3\CMS\Core\TypoScript\TypoScriptService
     */
    private $typoscriptService;

    /**
     * @codeCoverageIgnore
     * BannerRenderer constructor.
     * @param array|null $configuration
     * @param StandaloneView $view
     * @param \TYPO3\CMS\Core\TypoScript\TypoScriptService|\TYPO3\CMS\Extbase\Service\TypoScriptService $typoscriptService
     */
    public function __construct(array $configuration = null, StandaloneView $view = null, $typoscriptService = null)
    {
        if (empty($configuration)) {
            $configuration = GeneralUtility::makeInstance(ObjectManager::class)
                ->get(ConfigurationManagerInterface::class)
                ->getConfiguration(
                    ConfigurationManagerInterface::CONFIGURATION_TYPE_FRAMEWORK,
                    'Supi',
                    'Pi1'
                );
        }

        $this->configuration = $configuration;
        $this->view = $view ?: GeneralUtility::makeInstance(ObjectManager::class)->get(StandaloneView::class);

        if ($typoscriptService) {
            $this->typoscriptService = $typoscriptService;
        } else {
            if (class_exists(\TYPO3\CMS\Core\TypoScript\TypoScriptService::class)) {
                $this->typoscriptService = GeneralUtility::makeInstance(\TYPO3\CMS\Core\TypoScript\TypoScriptService::class);
            } else {
                $this->typoscriptService = GeneralUtility::makeInstance(\TYPO3\CMS\Extbase\Service\TypoScriptService::class);
            }
        }
    }

    public function overrideSettings(array $settings)
    {
        $this->configuration = array_replace_recursive($this->configuration, $settings);
    }

    public function render(): string
    {
        $this->view->getRequest()->setControllerExtensionName($this->configuration['extbase']['controllerExtensionName']);
        $this->view->setTemplateRootPaths($this->configuration['templateRootPaths']);
        $this->view->setLayoutRootPaths($this->configuration['layoutRootPaths']);
        $this->view->setPartialRootPaths($this->configuration['partialRootPaths']);
        $this->view->setTemplate($this->configuration['templateName']);
        $this->view->assignMultiple([
            'settings' => $this->configuration['settings'],
            'data'     => $this->configuration['data'] ?? null,
            'config'   => json_encode($this->compileClientConfig($this->configuration['settings']['elements'])),
        ]);

        return $this->view->render();
    }

    public function userFunc($content, $conf): string
    {
        if (is_array($conf) && !empty($conf)) {
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

        foreach ($elements as $key => $value) {
            if ($key !== 'label' && $key !== 'text') {
                if (is_array($value)) {
                    $value = $this->compileClientConfig($value);
                }

                if (!empty($value)) {
                    $new[$key] = $value;
                }
            }
        }

        return $new;
    }
}
