<?php
declare(strict_types=1);
namespace Supseven\Supi\Tests\ViewHelpers;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\Rendering\BannerRenderer;
use Supseven\Supi\ViewHelpers\BannerViewHelper;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContext;

/**
 * Description
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class BannerViewHelperTest extends TestCase
{
    /**
     * @covers \Supseven\Supi\ViewHelpers\BannerViewHelper
     */
    public function testRender(): void
    {
        if (!class_exists('TYPO3Fluid\Fluid\Core\Rendering\RenderingContext')) {
            $this->markTestSkipped('Skip for TYPO3 7');
        }

        $config = [
            'a' => 'b',
        ];
        $elements = [
            'c' => 'd',
        ];
        $children = function () use ($elements) {
            return $elements;
        };
        $banner = $this->createMock(BannerRenderer::class);

        $banner->expects(static::at(0))->method('overrideSettings')->with(static::equalTo(['elements' => $elements]));
        $banner->expects(static::at(1))->method('overrideSettings')->with(static::equalTo(['config' => $config]));
        $banner->expects(static::once())->method('render');

        GeneralUtility::addInstance(BannerRenderer::class, $banner);
        BannerViewHelper::renderStatic(['config' => $config], $children, $this->createMock(RenderingContext::class));
    }
}
