<?php
declare(strict_types=1);
namespace Supseven\Supi\ViewHelpers;

use TYPO3Fluid\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3Fluid\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\Traits\CompileWithRenderStatic;

/**
 * Append children of viewhelper to <head> or footer
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class AppendViewHelper extends AbstractViewHelper
{
    use CompileWithRenderStatic;

    protected $escapeChildren = false;

    protected $escapeOutput = false;

    public function initializeArguments()
    {
        $this->registerArgument('content', 'string', '', false, '');
        $this->registerArgument('section', 'string', '', false, 'head');
        $this->registerArgument('as', 'string', '');
    }

    public static function renderStatic(
        array $arguments,
        \Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $content = (string) $renderChildrenClosure();
        $as = (string) ($arguments['as'] ?? md5($content));

        switch ($arguments['section']) {
            case 'head':
                $GLOBALS['TSFE']->additionalHeaderData[$as] = $content;
                break;

            case 'footer':
                $GLOBALS['TSFE']->additionalFooterData[$as] = $content;
                break;
        }
    }
}
