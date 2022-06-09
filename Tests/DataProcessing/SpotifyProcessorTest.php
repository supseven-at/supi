<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\DataProcessing\SpotifyProcessor;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SpotifyProcessorTest extends TestCase
{
    public function testProcess(): void
    {
        $id = '1234567890';
        $baseUrl = 'https://embed.spotify.com/playlist/';
        $attr = [
            'width'  => '100%',
            'height' => '400px',
        ];
        $patternUrl = $baseUrl . '{id}';
        $expectedUrl = $baseUrl . $id;

        $res = $attr;
        $res['src'] = $expectedUrl;

        $data = [
            'settings' => [
                'spotify' => [
                    'playerAttr' => $attr,
                    'url'        => $patternUrl,
                ],
            ],
        ];
        $as = 'spotify';

        $expected = $data;
        $expected[$as] = json_encode($res);

        $cObj = $this->createMock(ContentObjectRenderer::class);
        $cObj->data['bodytext'] = $id;

        $subject = new SpotifyProcessor();
        $actual = $subject->process($cObj, [], ['as' => 'spotify'], $data);

        self::assertEquals($expected, $actual);
    }
}
