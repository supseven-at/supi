<?php
declare(strict_types=1);
namespace Supseven\Supi\LegacyViewHelpers;

use Closure;
use Supseven\Supi\Rendering\BannerRenderer;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContextInterface;
use TYPO3\CMS\Fluid\Core\ViewHelper\AbstractViewHelper;
use TYPO3Fluid\Fluid\Core\ViewHelper\Traits\CompileWithContentArgumentAndRenderStatic;

/**
 * Render the banner in its current configuration
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class BannerViewHelper extends AbstractViewHelper
{
    use CompileWithContentArgumentAndRenderStatic;

    protected $escapeChildren = false;

    protected $escapeOutput = false;

    /**
     * @codeCoverageIgnore
     */
    public function initializeArguments()
    {
        $this->registerArgument('elements', 'array', '', false, []);
        $this->registerArgument('config', 'array', '');
    }

    public static function renderStatic(
        array $arguments,
        Closure $renderChildrenClosure,
        RenderingContextInterface $renderingContext
    ) {
        $renderer = GeneralUtility::makeInstance(BannerRenderer::class);
        $overrides = [
            'elements' => $renderChildrenClosure(),
            'config'   => $arguments['config'] ?? null,
        ];

        foreach ($overrides as $key => $data) {
            if (!empty($data) && is_array($data)) {
                $renderer->overrideSettings([$key => $data]);
            }
        }

        return $renderer->render();
    }
}
