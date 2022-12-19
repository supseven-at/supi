#!/usr/bin/env php
<?php
declare(strict_types=1);

$version = $_SERVER['argv'][1] ?? null;

function err(string $msg): void
{
    fwrite(STDERR, $msg . PHP_EOL);
    exit(1);
}

if (!is_string($version) || !preg_match('/^v?\d+\.\d+\.\d+$/', $version)) {
    err('Invalid version');
}

$version = ltrim($version, 'v');
$base = trim($_SERVER['argv'][2] ?? '.', '/');

$path = dirname(realpath(__DIR__), 2) . '/' . $base . '/';

if (!is_file($path . 'ext_emconf.php')) {
    err('no ext_emconf.php found');
}

$content = file_get_contents($path . 'ext_emconf.php');
$content = preg_replace('/(\'version\'\s*=>\s*)\'\d\.\d\.\d/', '\1\'' . $version, $content);

file_put_contents($path . 'ext_emconf.php', $content);

if (is_file($path . 'Documentation/Settings.cfg')) {
    $content = file_get_contents($path . 'Documentation/Settings.cfg');
    $content = preg_replace('/((?:version|release)\s*=)\s*\d\.\d\.\d/', '\1 ' . $version, $content);

    file_put_contents($path . 'Documentation/Settings.cfg', $content);
}
