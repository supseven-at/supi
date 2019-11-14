<?php
declare(strict_types=1);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
    'tt_content',
    'CType',
    ['LLL:EXT:supi/Resources/Private/Language/locallang_db.xlf:tt_content.button.title', 'tx_supi_button', 'content-panel']
);
