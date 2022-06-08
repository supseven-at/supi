<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use Supseven\Supi\DataProcessing\ItemsProcessor;
use PHPUnit\Framework\TestCase;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ItemsProcessorTest extends TestCase
{
    public function testProcess()
    {
        $policyUid = '12';
        $policyUrl = 'https://www.domain.tld/privacy/';
        $vars = [
            'settings' => [
                'elements' => [
                    'essential' => [
                        'items' => [
                            'session' => [
                                'table' => [
                                    'policy' => $policyUid
                                ],
                            ],
                        ],
                    ],
                    'media' => [
                        'items' => [
                            'googleMaps' => [
                                'table' => [
                                    'policy' => 'https://www.google.com/privacy/'
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
        $expected = [
            'settings' => [
                'elements' => [
                    'essential' => [
                        'items' => [
                            'session' => [
                                'table' => [
                                    'policyUrl' => $policyUrl,
                                    'policy'    => $policyUid
                                ],
                            ],
                        ],
                    ],
                    'media' => [
                        'items' => [
                            'googleMaps' => [
                                'table' => [
                                    'policyUrl' => 'https://www.google.com/privacy/',
                                    'policy'    => 'https://www.google.com/privacy/'
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $ts = [
            'parameter'        => $policyUid,
            'forceAbsoluteUrl' => true,
        ];

        $cObj = $this->createMock(ContentObjectRenderer::class);
        $cObj->expects(static::once())->method('typoLink_URL')->with(static::equalTo($ts))->willReturn($policyUrl);

        $subject = new ItemsProcessor();
        $actual = $subject->process($cObj, [], [], $vars);

        static::assertEquals($expected, $actual);
    }
}
