<?php
declare(strict_types=1);
namespace Supseven\Supi\Rendering;

use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;
use TYPO3\CMS\Extbase\Object\ObjectManager;
use TYPO3\CMS\Fluid\View\StandaloneView;

/**
 * Banner renderer
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class BannerRenderer
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
     * BannerRenderer constructor.
     * @param array|null $configuration
     * @param StandaloneView $view
     */
    public function __construct(?array $configuration =  null, ?StandaloneView $view = null) {
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
        $this->view = $view ?? GeneralUtility::makeInstance(ObjectManager::class)->get(StandaloneView::class);
    }

    public function overrideSettings(array $settings): void
    {
        $this->configuration['settings'] = array_replace_recursive($this->configuration['settings'], $settings);
    }

    public function render(): string
    {
        $template = GeneralUtility::makeInstance($this->configuration['view']['template']);

        $this->view->getRequest()->setControllerExtensionName('Supi');
        $this->view->setTemplatePathAndFilename($template);
        $this->view->setLayoutRootPaths($this->configuration['view']['layoutRootPaths']);
        $this->view->setPartialRootPaths($this->configuration['view']['partialRootPaths']);
        $this->view->assign('settings', $this->configuration['settings']);
        $this->view->assign('config', json_encode($this->configuration['settings']['elements']));

        return $this->view->render();
    }

    public function userFunc($content, $conf): string
    {
        if (is_array($conf) && !empty($conf)) {
            $overrides = (new TypoScriptService())->convertTypoScriptArrayToPlainArray($conf);
            $this->overrideSettings($overrides);
        }

        return $this->render();
    }
}
