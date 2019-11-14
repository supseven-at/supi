<?php
declare(strict_types=1);
namespace Supseven\Supi\Tests\LegacyViewHelpers;

use PHPUnit\Framework\TestCase;
use stdClass;
use Supseven\Supi\LegacyViewHelpers\AppendViewHelper;
use TYPO3\CMS\Fluid\Core\Rendering\RenderingContext;

/**
 * Test the append function
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class AppendViewHelperTest extends TestCase
{
    /**
     * @covers \Supseven\Supi\ViewHelpers\AppendViewHelper
     * @dataProvider renderData
     * @param $content
     * @param $as
     * @param $section
     */
    public function testRenderMethod(string $content, string $as, string $section): void
    {
        if (class_exists('TYPO3Fluid\\Fluid\\Core\\ViewHelper\\AbstractViewHelper')) {
            $this->markTestSkipped('Skip legacy test for TYPO3 8+');
        }

        $context = $this->createMock(RenderingContext::class);

        $GLOBALS['TSFE'] = new stdClass();
        $GLOBALS['TSFE']->additionalHeaderData = [];
        $GLOBALS['TSFE']->additionalFooterData = [];

        $render = static function () use ($content) {
            return $content;
        };

        AppendViewHelper::renderStatic(['as' => $as, 'section' => $section], $render, $context);

        $expected = [$as => $content];

        if ($section === 'head') {
            $actual = $GLOBALS['TSFE']->additionalHeaderData;
        } else {
            $actual = $GLOBALS['TSFE']->additionalFooterData;
        }

        static::assertSame($expected, $actual);
    }

    public function renderData()
    {
        return [
            ['Data', 'a', 'head'],
            ['Data', 'b', 'footer'],
        ];
    }
}
