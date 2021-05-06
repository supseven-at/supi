<?php
declare(strict_types=1);
namespace Supseven\Supi\ViewHelpers;

use TYPO3\CMS\Core\Core\Environment;
use TYPO3\CMS\Core\Resource\FileInterface;
use TYPO3\CMS\Core\Resource\ResourceFactory;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\Traits\CompileWithRenderStatic;

class AddressViewHelper extends AbstractViewHelper
{
    use CompileWithRenderStatic;

    protected $escapeOutput = false;

    protected $escapeChildren = false;

    public function initializeArguments()
    {
        $this->registerArgument('address', 'string', '', true);
    }

    public static function renderStatic(array $arguments, \Closure $renderChildrenClosure, RenderingContextInterface $renderingContext)
    {
        $address = $arguments['address'] ?: $renderChildrenClosure();

        if (stripos($address, ',') !== false) {
            $address = explode(',', $address);
        } else {
            $address = array_map('trim', explode("\n", $address));
        }

        return implode(',', $address);
    }
}
