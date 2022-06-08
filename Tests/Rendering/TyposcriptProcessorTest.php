<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\Rendering;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\Rendering\TyposcriptProcessor;
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

        $GLOBALS['TSFE'] = new \stdClass();
        $GLOBALS['TSFE']->tmpl = new \stdClass();
        $GLOBALS['TSFE']->tmpl->setup = [
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

        $subject = new TyposcriptProcessor();
        $actual = $subject->process($cObj, [], $config, []);

        static::assertEquals($expected, $actual);
    }
}
