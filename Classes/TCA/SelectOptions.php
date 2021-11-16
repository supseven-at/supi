<?php
declare(strict_types=1);
namespace Supseven\Supi\TCA;

use TYPO3\CMS\Backend\Utility\BackendUtility;
use TYPO3\CMS\Core\TypoScript\TemplateService;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Core\Utility\RootlineUtility;
use TYPO3\CMS\Core\Utility\StringUtility;

class SelectOptions
{
    public function addServices(array &$configuration): void
    {
        if (!is_array($configuration['items'] ?? null)) {
            $configuration['items'] = [];
        }

        $pid = $configuration['row']['pid'];

        if ($pid < 0 && StringUtility::beginsWith($configuration['row']['uid'], 'NEW')) {
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

                if (StringUtility::beginsWith($label, 'LLL:')) {
                    $label = $GLOBALS['LANG']->sL($label);
                }

                $configuration['items'][] = [$label, trim($id, '.')];
            }
        }
    }
}
