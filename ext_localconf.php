<?php

if (version_compare(\TYPO3\CMS\Core\Utility\VersionNumberUtility::getCurrentTypo3Version(), '9.0.0') < 0) {
    $import = '<INCLUDE_TYPOSCRIPT: source="FILE:EXT:supi/Configuration/%s">';
} else {
    $import = '@import \'EXT:supi/Configuration/%s\'';
}

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig(sprintf($import, 'TSConfig/Page/NewElementWizard.tsconfig'));
