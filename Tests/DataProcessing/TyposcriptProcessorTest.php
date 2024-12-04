<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\DataProcessing\TyposcriptProcessor;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\TypoScript\AST\Node\RootNode;
use TYPO3\CMS\Core\TypoScript\FrontendTypoScript;
use TYPO3\CMS\Core\TypoScript\TypoScriptService;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * Test Typoscript processor
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class TyposcriptProcessorTest extends TestCase
{
    public function testProcess(): void
    {
        $as = 'ts';
        $path = 'plugin.tx_supi.settings';

        $setup = [
            'plugin.' => [
                'tx_supi.' => [
                    'settings.' => [
                        'a'  => 'b',
                        'c.' => [
                            'd' => 'e',
                        ],
                    ],
                ],
            ],
        ];
        $typoscript = new FrontendTypoScript(new RootNode(), [], [], []);
        $typoscript->setSetupArray($setup);

        $request = (new ServerRequest())->withAttribute('frontend.typoscript', $typoscript);

        $expected = [
            $as => [
                'a' => 'b',
                'c' => [
                    'd' => 'e',
                ],
            ],
        ];

        $config = ['as' => $as, 'path' => $path];
        $cObj = $this->createMock(ContentObjectRenderer::class);
        $cObj->method('getRequest')->willReturn($request);

        $subject = new TyposcriptProcessor(new TypoScriptService());
        $actual = $subject->process($cObj, [], $config, []);

        static::assertEquals($expected, $actual);
    }
}
