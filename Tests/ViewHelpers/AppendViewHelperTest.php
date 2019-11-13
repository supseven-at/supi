<?php
declare(strict_types=1);
namespace Supseven\Supi\Tests\ViewHelpers;

use PHPUnit\Framework\TestCase;
use stdClass;
use Supseven\Supi\ViewHelpers\AppendViewHelper;
use TYPO3Fluid\Fluid\Core\Rendering\RenderingContext;

/**
 * Test the append function
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class AppendViewHelperTest extends TestCase
{
    /**
     * @dataProvider renderData
     * @param $content
     * @param $as
     * @param $section
     */
    public function testRenderMethod(string $content, string $as, string $section): void
    {
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
