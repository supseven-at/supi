<?php
declare(strict_types=1);
namespace Supseven\Supi\ViewHelpers;

use TYPO3\CMS\Core\Utility\MathUtility;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractConditionViewHelper;

class IfIntViewHelper extends AbstractConditionViewHelper
{
    public function initializeArguments()
    {
        parent::initializeArguments();
        $this->registerArgument('value', 'mixed', '', true);
    }

    public static function verdict(array $arguments, RenderingContextInterface $renderingContext)
    {
        return MathUtility::canBeInterpretedAsInteger($arguments['value']);
    }
}
