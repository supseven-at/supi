<?php

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:supi/Configuration/TSConfig/Page/NewElementWizard.tsconfig">');
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPageTSConfig('<INCLUDE_TYPOSCRIPT: source="FILE:EXT:supi/Configuration/TSConfig/Page/YoutubeElement.tsconfig">');

// Icon Registry
if (version_compare((string)\TYPO3\CMS\Core\Utility\VersionNumberUtility::getCurrentTypo3Version(), '11.5.0') < 0) {
    $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
    $iconRegistry->registerIcon(
        'supi',
        \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
        [
            'source' => 'EXT:supi/Resources/Public/Icons/Extension.svg'
        ]
    );
}
