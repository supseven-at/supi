<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\TCA;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\TCA\ArrayUtil;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ArrayUtilTest extends TestCase
{
    /**
     * @dataProvider removeValueDataProvider
     * @param $input
     * @param $value
     * @param $expected
     * @return void
     */
    public function testRemoveValue($input, $value, $expected)
    {
        $actual = ArrayUtil::removeValue($input, $value);
        self::assertEquals($expected, $actual);
    }

    public function removeValueDataProvider()
    {
        yield 'Simple, one element' => [['a' => 'b'], 'b', ['a' => '']];
        yield 'Deep, one element' => [['a' => ['z' => 'b']], 'b', ['a' => ['z' => '']]];
        yield 'Deep, one element, list middle' => [['a' => ['z' => 'b, c, d']], 'c', ['a' => ['z' => 'b, d']]];
        yield 'Deep, one element, list start' => [['a' => ['z' => 'b, c, d']], 'b', ['a' => ['z' => 'c, d']]];
        yield 'Deep, one element, list end' => [['a' => ['z' => 'b, c, d']], 'd', ['a' => ['z' => 'b, c']]];
    }
}
