<?php

declare(strict_types=1);

namespace Supseven\Supi\TCA;

use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Extbase\Configuration\ConfigurationManagerInterface;

class SelectOptions
{
    /**
     * @var LanguageService
     */
    private readonly LanguageService $languageService;

    public function __construct(
        private readonly LanguageServiceFactory $languageServiceFactory,
        private readonly ConfigurationManagerInterface $configurationManager,
    ) {
        $this->languageService = $this->languageServiceFactory->createFromUserPreferences($GLOBALS['BE_USER']);
    }

    public function addServices(array &$configuration): void
    {
        if (!is_array($configuration['items'] ?? null)) {
            $configuration['items'] = [];
        }

        $setup = $this->configurationManager->getConfiguration(ConfigurationManagerInterface::CONFIGURATION_TYPE_FULL_TYPOSCRIPT);
        $services = $setup['plugin.']['tx_supi.']['settings.']['services.'] ?? [];

        foreach ($services as $id => $service) {
            if ((int)($service['internal'] ?? 0) !== 1) {
                $label = $service['label'];

                if (strncasecmp($label, 'LLL:', 4) === 0) {
                    $label = $this->languageService->sL($label);
                }

                $configuration['items'][] = [
                    'label' => $label,
                    'value' => trim($id, '.'),
                ];
            }
        }
    }
}
