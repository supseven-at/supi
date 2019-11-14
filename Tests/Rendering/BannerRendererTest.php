<?php
declare(strict_types=1);
namespace Supseven\Supi\Tests\Rendering;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\Rendering\BannerRenderer;
use TYPO3\CMS\Extbase\Mvc\Web\Request;
use TYPO3\CMS\Fluid\View\StandaloneView;

/**
 * Test renderer methods
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class BannerRendererTest extends TestCase
{
    /**
     * @covers \Supseven\Supi\Rendering\BannerRenderer
     */
    public function testOverrideSettings(): void
    {
        $subject = new BannerRenderer(['settings' => ['a' => 'b']], $this->createMock(StandaloneView::class));
        $subject->overrideSettings(['b' => 'c', 'a' => 'd']);

        $prop = (new \ReflectionObject($subject))->getProperty('configuration');
        $prop->setAccessible(true);
        $actual = $prop->getValue($subject);

        static::assertSame(['settings' => ['a' => 'd', 'b' => 'c']], $actual);
    }

    /**
     * @covers \Supseven\Supi\Rendering\BannerRenderer
     */
    public function testRender(): void
    {
        $template = 'Banner';
        $templates = [
            ['DIR/Templates'],
        ];
        $layouts = [
            ['DIR/Layouts'],
        ];
        $partials = [
            ['DIR/Partials'],
        ];
        $settings = [
            'elements' => ['a' => 'b'],
        ];

        $variables = [
            'settings' => $settings,
            'config'   => json_encode($settings['elements']),
        ];

        $request = $this->createMock(Request::class);
        $request->expects(static::once())->method('setControllerExtensionName')->with(static::equalTo('Supi'));
        $view = $this->createMock(StandaloneView::class);
        $view->expects(static::any())->method('getRequest')->willReturn($request);
        $view->expects(static::once())->method('setTemplate')->with(static::equalTo($template));
        $view->expects(static::once())->method('setTemplateRootPaths')->with(static::equalTo($templates));
        $view->expects(static::once())->method('setLayoutRootPaths')->with(static::equalTo($layouts));
        $view->expects(static::once())->method('setPartialRootPaths')->with(static::equalTo($partials));
        $view->expects(static::once())->method('assignMultiple')->with(static::equalTo($variables));
        $view->expects(static::once())->method('render')->willReturn('');

        $configuration = [
            'templateName'      => $template,
            'templateRootPaths' => $templates,
            'layoutRootPaths'   => $layouts,
            'partialRootPaths'  => $partials,
            'settings'          => $settings,
        ];

        $subject = new BannerRenderer($configuration, $view);
        $subject->render();
    }

    /**
     * @covers \Supseven\Supi\Rendering\BannerRenderer
     */
    public function testUserFunc(): void
    {
        $template = 'Banner';
        $templates = [
            ['DIR/Templates'],
        ];
        $layouts = [
            ['DIR/Layouts'],
        ];
        $partials = [
            ['DIR/Partials'],
        ];
        $settings = [
            'elements' => ['a' => 'b'],
        ];

        $conf = [
            'c' => 'd',
        ];

        $variables = [
            'settings' => $settings + $conf,
            'config'   => json_encode($settings['elements']),
        ];

        $request = $this->createMock(Request::class);
        $request->expects(static::once())->method('setControllerExtensionName')->with(static::equalTo('Supi'));
        $view = $this->createMock(StandaloneView::class);
        $view->expects(static::any())->method('getRequest')->willReturn($request);
        $view->expects(static::once())->method('setTemplate')->with(static::equalTo($template));
        $view->expects(static::once())->method('setTemplateRootPaths')->with(static::equalTo($templates));
        $view->expects(static::once())->method('setLayoutRootPaths')->with(static::equalTo($layouts));
        $view->expects(static::once())->method('setPartialRootPaths')->with(static::equalTo($partials));
        $view->expects(static::once())->method('assignMultiple')->with(static::equalTo($variables));
        $view->expects(static::once())->method('render')->willReturn('');

        $configuration = [
            'templateName'      => $template,
            'templateRootPaths' => $templates,
            'layoutRootPaths'   => $layouts,
            'partialRootPaths'  => $partials,
            'settings'          => $settings + $conf,
        ];

        $subject = new BannerRenderer($configuration, $view);
        $subject->userFunc('', $conf);
    }
}
