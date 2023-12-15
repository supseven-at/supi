<?php

declare(strict_types=1);

(function ($extKey, $table) {
    $ll = 'LLL:EXT:supi/Resources/Private/Language/locallang_db.xlf:';

    /**
     * Additional columns
     */
    $additionalColumns = [
        'tx_supi_video_cover' => [
            'label'   => $ll . $table . '.tx_supi_video_cover.label',
            'description'   => $ll . $table . '.tx_supi_video_cover.description',
            'config'  => [
                'type' => 'file',
                'maxitems' => 1,
                'allowed' => ['jpg', 'jpeg', 'png', 'svg'],
            ],
        ],
    ];
    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns($table, $additionalColumns);

    \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addFieldsToPalette(
        $table,
        'videoOverlayPalette',
        'tx_supi_video_cover',
        'after:autoplay'
    );

    if (\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::isLoaded('cropvariantsbuilder')) {
        \JosefGlatz\CropVariantsBuilder\Builder::getInstance($table, 'tx_supi_video_cover')
            ->disableDefaultCropVariants()
            ->addCropVariant(
                \JosefGlatz\CropVariantsBuilder\CropVariant::create('xs')
                    ->addAllowedAspectRatios(\JosefGlatz\CropVariantsBuilder\Defaults\AspectRatio::get(['16:9']))
                    ->setCropArea(\JosefGlatz\CropVariantsBuilder\Defaults\CropArea::get())
                    ->get()
            )
            ->persistToTca();
    }

})('supi', 'sys_file_reference');
