<?php
declare(strict_types=1);

call_user_func(
    function ($extKey, $table, $type) {

        // Icon Registry
        $iconRegistry = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(\TYPO3\CMS\Core\Imaging\IconRegistry::class);
        $iconRegistry->registerIcon(
            'supi',
            \TYPO3\CMS\Core\Imaging\IconProvider\SvgIconProvider::class,
            [
                'source' => 'EXT:' . $extKey . '/Resources/Public/Icons/Extension.svg'
            ]
        );

        $languageFileCePrefix = 'LLL:EXT:supi/Resources/Private/Language/locallang_db.xlf:';

        /**
         * Add CE
         */
        \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTcaSelectItem(
            $table,
            'CType',
            [
                $languageFileCePrefix . $table .'.button.title',
                $type,
                'supi'
            ]
        );

        $showitem = [
            '--div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:general',
            '--palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.general;general',
            '--palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.headers;headers',
            'bodytext',
            '--div--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:tabs.appearance',
            '--palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.frames;frames',
            '--palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.appearanceLinks;appearanceLinks',
            '--div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:language',
            '--palette--;;language',
            '--div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:access',
            '--palette--;;hidden',
            '--palette--;LLL:EXT:frontend/Resources/Private/Language/locallang_ttc.xlf:palette.access;access',
            '--div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:categories',
            'categories',
            '--div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:notes',
            'rowDescription',
            '--div--;LLL:EXT:core/Resources/Private/Language/Form/locallang_tabs.xlf:extended',
        ];

        $tca = [
            'columns' => [

            ],
            'types' => [
                $type => [
                    'showitem' => implode(',', $showitem),
                    'columnsOverrides' => [
                        'bodytext' => [
                            'config' => [
                                'enableRichtext'        => true,
                                'richtextConfiguration' => 'default'
                            ]
                        ],
                        'header' => [
                            'config' => [
                                'eval' => 'required',
                            ],
                        ],
                    ],
                ],
            ],
        ];
        $GLOBALS['TCA'][$table] = array_replace_recursive($GLOBALS['TCA'][$table], $tca);

        /**
         * Assign Icon
         */
        $GLOBALS['TCA'][$table]['ctrl']['typeicon_classes'][$type] = 'supi';
    },
    'supi',
    'tt_content',
    'tx_supi_button'
);
