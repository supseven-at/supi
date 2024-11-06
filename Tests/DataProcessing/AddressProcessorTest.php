<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\DataProcessing;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\DataProcessing\AddressProcessor;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class AddressProcessorTest extends TestCase
{
    /**
     * @dataProvider processDataProvider
     * @param $in
     * @param $expected
     * @throws \ReflectionException
     */
    public function testProcess($in, $expected): void
    {
        $subject = new AddressProcessor();
        $field = 'address';
        $cObj = (new \ReflectionClass(ContentObjectRenderer::class))->newInstanceWithoutConstructor();
        $cObj->data[$field] = $in;
        $as = 'addr';

        $actual = $subject->process($cObj, [], ['field' => 'address', 'as' => $as], []);
        $expected = [$as => $expected];

        static::assertEquals($expected, $actual);
    }

    public static function processDataProvider(): \Generator
    {
        yield 'Empty' => ['', ''];
        yield 'One Line' => ['Street 1', 'Street 1'];
        yield 'One Line, untrimmed' => ['Street 1  ', 'Street 1'];
        yield 'One Line, comma' => [' Street 1  , 12345  ', 'Street 1,12345'];
        yield 'Two Line' => ["Street 1\n12345", 'Street 1,12345'];
        yield 'Two Line, untrimmed' => ["  Street 1  \n   12345  ", 'Street 1,12345'];
    }
}
