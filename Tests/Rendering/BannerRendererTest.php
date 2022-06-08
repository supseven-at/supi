<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\Rendering;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\Rendering\BannerRenderer;
use TYPO3\CMS\Extbase\Mvc\Request;
use TYPO3\CMS\Fluid\View\StandaloneView;
use TYPO3\CMS\Frontend\ContentObject\ContentDataProcessor;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;
use TYPO3\CMS\Frontend\DataProcessing\FilesProcessor;

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
        $langService = $this->getLanguageService();
        $tsService = $this->getTypoScriptService();

        $subject = new BannerRenderer(
            ['settings' => ['a' => 'b']],
            $this->createMock(StandaloneView::class),
            $tsService,
            $langService,
            $this->createMock(ContentDataProcessor::class)
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
        $service = $this->getTypoScriptService();

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

        $langService = $this->getLanguageService();

        $subject = new BannerRenderer(
            $configuration,
            $view,
            $service,
            $langService,
            $this->createMock(ContentDataProcessor::class)
        );
        $subject->render();
    }

    /**
     * @covers \Supseven\Supi\Rendering\BannerRenderer
     */
    public function testUserFunc()
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
        $langService = $this->getLanguageService();

        $procData = $configuration + $conf;
        $procData['data'] = $data;

        $proc = $this->createMock(ContentDataProcessor::class);
        $subject = new BannerRenderer(
            $configuration,
            $view,
            $this->getTypoScriptService(false),
            $langService,
            $proc
        );
        $subject->cObj = (new \ReflectionClass(ContentObjectRenderer::class))->newInstanceWithoutConstructor();
        $subject->cObj->data = $data;

        $dataProcessingConf = [
            '10'  => FilesProcessor::class,
            '10.' => [
                'references.' => ['field' => 'assets'],
                'as'          => 'files',
            ],
        ];

        $proc->expects(static::once())->method('process')->with(
            static::equalTo($subject->cObj),
            static::equalTo(['dataProcessing.' => $dataProcessingConf]),
            static::equalTo($procData)
        )->willReturn($procData);

        $conf['dataProcessing.'] = $dataProcessingConf;
        $actual = $subject->userFunc('', $conf);

        static::assertSame($expected, $actual);
    }

    /**
     * @return \PHPUnit\Framework\MockObject\MockObject&\TYPO3\CMS\Lang\LanguageService&\TYPO3\CMS\Core\Localization\LanguageService
     * @throws \ReflectionException
     */
    protected function getLanguageService()
    {
        if (class_exists(\TYPO3\CMS\Lang\LanguageService::class)) {
            $langService = $this->createMock(\TYPO3\CMS\Lang\LanguageService::class);
        } else {
            $langService = $this->createMock(\TYPO3\CMS\Core\Localization\LanguageService::class);
        }

        return $langService;
    }

    /**
     * @return \PHPUnit\Framework\MockObject\MockObject&\TYPO3\CMS\Extbase\Service\TypoScriptService&\TYPO3\CMS\Core\TypoScript\TypoScriptService
     * @throws \ReflectionException
     */
    protected function getTypoScriptService($createMock = true)
    {
        if (class_exists(\TYPO3\CMS\Extbase\Service\TypoScriptService::class)) {
            $class = \TYPO3\CMS\Extbase\Service\TypoScriptService::class;
        } else {
            $class = \TYPO3\CMS\Core\TypoScript\TypoScriptService::class;
        }

        return $createMock ? $this->createMock($class) : new $class();
    }
}
