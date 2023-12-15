<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\DataProcessing\ServicesProcessor;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ServicesProcessorTest extends TestCase
{
    public function testProcess(): void
    {
        $cObj = $this->createMock(ContentObjectRenderer::class);

        $attr = [
            'src'    => 'https://www.service.com/embed',
            'height' => '1000',
        ];
        $in = [
            'settings' => [
                'services' => [
                    'sage' => [
                        'label'   => 'My Service',
                        'service' => 'service',
                        'type'    => 'iframe',
                        'attr'    => $attr,
                    ],
                ],
            ],
        ];

        $expected = $in;
        $expected['settings']['services']['sage']['attrJson'] = json_encode($attr);

        $subject = new ServicesProcessor();
        $actual = $subject->process($cObj, [], [], $in);

        self::assertEquals($expected, $actual);
    }
}
