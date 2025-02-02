<?php

declare(strict_types=1);

namespace Supseven\Supi\DataProcessing;

use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Core\Utility\ArrayUtility;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\ContentObject\DataProcessorInterface;

class TyposcriptProcessor implements DataProcessorInterface
{
    public function __construct(
        protected readonly TypoScriptService $typoscriptService,
    ) {
    }

    public function process(ContentObjectRenderer $cObj, array $contentObjectConfiguration, array $processorConfiguration, array $processedData)
    {
        $path = $processorConfiguration['path'] ?? '';

        if ($path) {
            $path = explode('/', str_replace('.', './', $path) . '.');
            $setup = $cObj->getRequest()->getAttribute('frontend.typoscript')->getSetupArray();

            if (ArrayUtility::isValidPath($setup, $path)) {
                $data = ArrayUtility::getValueByPath($setup, $path);

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
