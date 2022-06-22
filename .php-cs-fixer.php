<?php

declare(strict_types=1);

$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__ . DIRECTORY_SEPARATOR . 'Tests')
    ->in(__DIR__ . DIRECTORY_SEPARATOR . 'Classes');

$config = new PhpCsFixer\Config();

return $config->setUsingCache(true)->setRiskyAllowed(true)->setRules([
    '@PSR12'                => true,
    'array_indentation'     => true,
    'no_unused_imports'     => true,
    'cast_spaces'           => ['space' => 'none'],
    'no_extra_blank_lines'  => [
        'tokens' => ['break', 'case', 'continue', 'curly_brace_block', 'default', 'extra', 'parenthesis_brace_block', 'return', 'square_brace_block', 'switch', 'throw', 'use'],
    ],
    'types_spaces'           => ['space' => 'single'],
    'binary_operator_spaces' => [
        'operators' => [
            '|'  => 'no_space',
            '=>' => 'align',
        ],
    ],
    'no_trailing_comma_in_singleline_array' => true,
])
    ->setFinder($finder);
