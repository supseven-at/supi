<?php
declare(strict_types=1);
namespace Supseven\Supi\Tests\Rendering;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\Rendering\BannerRenderer;
use TYPO3\CMS\Core\Localization\LanguageService;
use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Extbase\Mvc\Web\Request;
use TYPO3\CMS\Fluid\View\StandaloneView;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

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
    public function testOverrideSettings()
    {
        $subject = new BannerRenderer(
            ['settings' => ['a' => 'b']],
            $this->createMock(StandaloneView::class),
            $this->createMock(TypoScriptService::class),
            $this->createMock(LanguageService::class)
        );
        $subject->overrideSettings(['settings' => ['b' => 'c', 'a' => 'd'], 'e' => 'f']);

        $prop = (new \ReflectionObject($subject))->getProperty('configuration');
        $prop->setAccessible(true);
        $actual = $prop->getValue($subject);

        static::assertSame(['settings' => ['a' => 'd', 'b' => 'c'], 'e' => 'f'], $actual);
    }

    /**
     * @covers \Supseven\Supi\Rendering\BannerRenderer
     */
    public function testRender()
    {
        if (!class_exists(Request::class)) {
            static::markTestSkipped('Request class does not exist, not supported in current TYPO3 anymore');
        }

        $service = $this->createMock(TypoScriptService::class);

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
            'extbase'  => ['controllerExtensionName' => 'Supi'],
            'elements' => ['a' => 'b'],
        ];

        $variables = [
            'settings' => $settings,
            'data'     => null,
            'config'   => json_encode($settings),
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
            'extbase'           => ['controllerExtensionName' => 'Supi'],
        ];

        $langService = $this->createMock(LanguageService::class);

        $subject = new BannerRenderer($configuration, $view, $service, $langService);
        $subject->render();
    }

    /**
     * @covers \Supseven\Supi\Rendering\BannerRenderer
     */
    public function testUserFunc()
    {
        if (!class_exists(Request::class)) {
            static::markTestSkipped('Request class does not exist, not supported in current TYPO3 anymore');
        }

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

        $data = ['a' => 'b'];

        $variables = [
            'settings' => $settings + $conf,
            'data'     => $data,
            'config'   => json_encode($settings + $conf),
        ];

        $expected = 'RESULT';
        $request = $this->createMock(Request::class);
        $request->expects(static::once())->method('setControllerExtensionName')->with(static::equalTo('Supi'));
        $view = $this->createMock(StandaloneView::class);
        $view->expects(static::any())->method('getRequest')->willReturn($request);
        $view->expects(static::once())->method('setTemplate')->with(static::equalTo($template));
        $view->expects(static::once())->method('setTemplateRootPaths')->with(static::equalTo($templates));
        $view->expects(static::once())->method('setLayoutRootPaths')->with(static::equalTo($layouts));
        $view->expects(static::once())->method('setPartialRootPaths')->with(static::equalTo($partials));
        $view->expects(static::once())->method('assignMultiple')->with(static::equalTo($variables));
        $view->expects(static::once())->method('render')->willReturn($expected);

        $configuration = [
            'templateName'      => $template,
            'templateRootPaths' => $templates,
            'layoutRootPaths'   => $layouts,
            'partialRootPaths'  => $partials,
            'settings'          => $settings + $conf,
            'extbase'           => ['controllerExtensionName' => 'Supi'],
        ];
        $langService = $this->createMock(LanguageService::class);

        $subject = new BannerRenderer($configuration, $view, new TypoScriptService(), $langService);
        $subject->cObj = (new \ReflectionClass(ContentObjectRenderer::class))->newInstanceWithoutConstructor();
        $subject->cObj->data = $data;

        $actual = $subject->userFunc('', $conf);

        static::assertSame($expected, $actual);
    }
}
