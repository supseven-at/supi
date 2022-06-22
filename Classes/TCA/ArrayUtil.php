<?php

declare(strict_types=1);

namespace Supseven\Supi\TCA;

/**
 * Helper for TCA array manipulation
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class ArrayUtil
{
    public static function removeValue(array $arr, string $value): array
    {
        foreach ($arr as $i => $el) {
            if (is_array($el)) {
                $el = self::removeValue($el, $value);
            } elseif (!empty($el) && is_string($el) && strpos($el, $value) !== false) {
                $el = str_replace($value, '', $el);
                $el = preg_replace('/,\\s*,/', ',', $el);
                $el = trim($el, " \t\n\r\0\x0B,");
            }

            $arr[$i] = $el;
        }

        return $arr;
    }
}
