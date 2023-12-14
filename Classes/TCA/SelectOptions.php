<?php

declare(strict_types=1);

namespace Supseven\Supi\TCA;

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\Localization\LanguageServiceFactory;
use TYPO3\CMS\Core\TypoScript\TemplateService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\RootlineUtility;

class SelectOptions
{
    /**
     * @var LanguageService
     */
    private readonly LanguageService $languageService;

    public function __construct(
        private readonly LanguageServiceFactory $languageServiceFactory
    ) {
        $this->languageService = $this->languageServiceFactory->createFromUserPreferences($GLOBALS['BE_USER']);
    }

    public function addServices(array &$configuration): void
    {
        if (!is_array($configuration['items'] ?? null)) {
            $configuration['items'] = [];
        }

        $pid = (int)$configuration['row']['pid'];

        if ($pid < 0 && strncasecmp((string)$configuration['row']['uid'], 'NEW', 3) === 0) {
            $pid = -$pid;
            $record = BackendUtility::getRecord('tt_content', $pid);

            if (!empty($record['pid'])) {
                $pid = (int)$record['pid'];
            }
        }

        $rootLine = GeneralUtility::makeInstance(RootlineUtility::class, $pid)->get();
        $templates = GeneralUtility::makeInstance(TemplateService::class);
        $templates->runThroughTemplates($rootLine);
        $templates->generateConfig();

        $services = $templates->setup['plugin.']['tx_supi.']['settings.']['services.'] ?? [];

        foreach ($services as $id => $service) {
            if ((int)($service['internal'] ?? 0) !== 1) {
                $label = $service['label'];

                if (strncasecmp($label, 'LLL:', 4) === 0) {
                    $label = $this->languageService->sL($label);
                }

                $configuration['items'][] = [$label, trim($id, '.')];
            }
        }
    }
}
