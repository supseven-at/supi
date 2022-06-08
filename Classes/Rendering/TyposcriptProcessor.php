<?php

declare(strict_types=1);

namespace Supseven\Supi\Rendering;

use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

class TyposcriptProcessor implements DataProcessorInterface
{
    /**
     * @var \TYPO3\CMS\Extbase\Service\TypoScriptService|\TYPO3\CMS\Core\SingletonInterface
     */
    private $typoscriptService;

    public function __construct()
    {
        if (class_exists(\TYPO3\CMS\Extbase\Service\TypoScriptService::class)) {
            $class = \TYPO3\CMS\Extbase\Service\TypoScriptService::class;
        } else {
            $class = \TYPO3\CMS\Core\TypoScript\TypoScriptService::class;
        }
        $this->typoscriptService = GeneralUtility::makeInstance($class);
    }

    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData)
    {
        $path = $processorConfiguration['path'] ?? '';

        if ($path) {
            $path = str_replace('.', './', $path) . '.';

            if (ArrayUtility::isValidPath($GLOBALS['TSFE']->tmpl->setup, $path)) {
                $data = ArrayUtility::getValueByPath($GLOBALS['TSFE']->tmpl->setup, $path);

                if ($data) {
                    if (is_array($data)) {
                        $data = $this->typoscriptService->convertTypoScriptArrayToPlainArray($data);
                    }

                    $as = $processorConfiguration['as'] ?? 'settings';
                    $processedData[$as] = $data;
                }
            }
        }

        return $processedData;
    }
}
