<?php

declare(strict_types=1);

(function ($extKey, $table, $type) {
    $ll = 'LLL:EXT:supi/Resources/Private/Language/locallang_db.xlf:';

    /**
     * Additional columns
     */
    $additionalColumns = [
        'tx_supi_video_cover' => [
            'label'   => $ll . $table . '.tx_supi_video_cover.label',
            'description'   => $ll . $table . '.tx_supi_video_cover.description',
            'config'  => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::getFileFieldTCAConfig(
                'tx_supi_video_cover',
                [
                    'appearance' => [
                        'createNewRelationLinkTitle' => $ll . $table . '.tx_supi_video_cover.irre.new.label',
                        'collapseAll'                => true,
                    ],
                    'overrideChildTca' => [
                        'types' => [
                            \TYPO3\CMS\Core\Resource\File::FILETYPE_IMAGE => [
                                'showitem' => '
                                    crop,
                                    --palette--;;filePalette',
                                'columnsOverrides' => [],
                            ],
                        ],
                    ],
                    'maxitems' => 1,
                ],
                'jpg,jpeg,png,svg'
            ),
        ],
    ];
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns($table, $additionalColumns);

    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addFieldsToPalette(
        $table,
        'videoOverlayPalette',
        'tx_supi_video_cover',
        'after:autoplay'
    );

    \JosefGlatz\CropVariantsBuilder\Builder::getInstance($table, 'tx_supi_video_cover')
        ->disableDefaultCropVariants()
        ->addCropVariant(
            \JosefGlatz\CropVariantsBuilder\CropVariant::create('xs')
                ->addAllowedAspectRatios(\JosefGlatz\CropVariantsBuilder\Defaults\AspectRatio::get(['16:9']))
                ->setCropArea(\JosefGlatz\CropVariantsBuilder\Defaults\CropArea::get())
                ->get()
        )
        ->persistToTca();

})('supi', 'sys_file_reference', 'tx_supi_youtube');
