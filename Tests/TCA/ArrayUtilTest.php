<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\TCA;

use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;
use Supseven\Supi\TCA\ArrayUtil;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ArrayUtilTest extends TestCase
{
    /**
     * @param $input
     * @param $value
     * @param $expected
     */
    #[DataProvider('removeValueDataProvider')]
    public function testRemoveValue($input, $value, $expected): void
    {
        $actual = ArrayUtil::removeValue($input, $value);
        self::assertEquals($expected, $actual);
    }

    public static function removeValueDataProvider(): \Generator
    {
        yield 'Simple, one element' => [['a' => 'b'], 'b', ['a' => '']];
        yield 'Deep, one element' => [['a' => ['z' => 'b']], 'b', ['a' => ['z' => '']]];
        yield 'Deep, one element, list middle' => [['a' => ['z' => 'b, c, d']], 'c', ['a' => ['z' => 'b, d']]];
        yield 'Deep, one element, list start' => [['a' => ['z' => 'b, c, d']], 'b', ['a' => ['z' => 'c, d']]];
        yield 'Deep, one element, list end' => [['a' => ['z' => 'b, c, d']], 'd', ['a' => ['z' => 'b, c']]];
    }
}
