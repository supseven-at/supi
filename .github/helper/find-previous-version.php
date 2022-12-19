#!/usr/bin/env php
<?php

declare(strict_types=1);
function checkVersion(string $v): bool
{
    return (bool)preg_match('/^v?\\d+\\.\\d+\\.\\d+$/', $v);
}

$next = $_SERVER['argv'][1] ?? '';

if (!checkVersion($next)) {
    fwrite(STDERR, 'Value is not a valid semver version number' . PHP_EOL);
    exit(1);
}
function tr(string $str): string
{
    return trim($str, " \t\n\r\0\x0Bv");
}

$nextCompare = tr($next);
$versions = shell_exec('git tag -l');
$previous = null;
$prevCompare = null;

foreach (explode("\n", $versions) as $v) {
    if ($v !== $next && checkVersion($v)) {
        $compare = tr($v);

        if (version_compare($compare, $nextCompare, '<')) {
            if (!$previous || version_compare($prevCompare, $compare, '<')) {
                $prevCompare = $compare;
                $previous = $v;
            }
        }
    }
}

fwrite(STDOUT, $previous);
