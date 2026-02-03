<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;
use Supseven\Supi\DataProcessing\MetaProcessor;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class MetaProcessorTest extends TestCase
{
    #[Test]
    #[DataProvider('instagramUrlProvider')]
    public function testProcess(string $bodytext, array $result): void
    {
        $cObj = $this->createStub(ContentObjectRenderer::class);
        $cObj->data['bodytext'] = $bodytext;
        $config = [
            'as' => 'metaUrls',
        ];

        $data = [
            'settings' => [
                'meta' => [
                    'iframeAttr' => [
                        'height' => '100%',
                    ],
                ],
            ],
        ];
        $expected = $data;

        if ($result) {
            $expected[$config['as']] = [
                'height' => '100%',
                'src'    => 'https://www.instagram.com/embed.js',
                'posts'  => $result,
            ];

        }

        $subject = new MetaProcessor();
        $actual = $subject->process($cObj, [], $config, $data);

        self::assertEquals($expected, $actual);
    }

    public static function instagramUrlProvider(): array
    {
        $ok1 = 'https://www.instagram.com/p/sdfsdf';
        $ok2 = 'https://www.instagram.com/reel/sdfsdf';
        $bad1 = 'https://www.instagram.com/abcd/sdfsdf';
        $bad2 = 'http://www.instagram.com/abcd/sdfsdf';
        $bad3 = 'https://www.youtube.com/watch/sdfsdf';

        return [
            ["{$ok1}", [$ok1]],
            ["{$ok1}\n{$ok2}", [$ok1, $ok2]],
            ["{$ok1}\n{$bad1}", [$ok1]],
            ["{$bad2}\n{$ok2}", [$ok2]],
            ["{$bad1}\n{$ok1}\n{$bad2}\n{$bad3}", [$ok1]],
            ["{$bad1}\n{$bad2}\n{$bad3}", []],
            ["{$bad1}", []],
            ['', []],
        ];
    }
}
