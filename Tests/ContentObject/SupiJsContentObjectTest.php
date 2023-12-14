<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\ContentObject;

use Supseven\Supi\ContentObject\SupiJsContentObject;
use PHPUnit\Framework\TestCase;
use Supseven\Supi\CSP\SupiPolicyExtender;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Frontend\ContentObject\ContentObjectRenderer;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SupiJsContentObjectTest extends TestCase
{
    public function testRender(): void
    {
        $jsSourceCobj = 'console.log(|)';
        $jsSourceStdWrap = 'console.log("I will be run")';
        $conf = [
            'content'  => 'TEXT',
            'content.' => [
                'value' => $jsSourceCobj,
            ],
            'cookies'  => 'cookie_name',
            'service'  => 'service_name',
            'stdWrap.' => [
                'wrap' => 'Some | string',
            ]
        ];

        $cObj = $this->createMock(ContentObjectRenderer::class);
        $cObj->expects($this->once())
            ->method('cObjGetSingle')
            ->with($this->equalTo($conf['content']), $this->equalTo($conf['content.']))
            ->willReturn($jsSourceCobj);
        $cObj->expects($this->once())
            ->method('stdWrap')
            ->with($this->equalTo($jsSourceCobj), $this->equalTo($conf['stdWrap.']))
            ->willReturn($jsSourceStdWrap);

        $cObj->expects($this->any())
            ->method('stdWrapValue')
            ->willReturnCallback(fn (string $key, array $config) => match (true) {
                $key === 'cookies' && $config === $conf => $conf['cookies'],
                $key === 'service' && $config === $conf => $conf['service'],
            });

        $csp = $this->createMock(SupiPolicyExtender::class);
        $csp->expects($this->once())
            ->method('addInlineScript')
            ->with($this->equalTo($jsSourceStdWrap));

        $expected = '<script type="application/supi" data-supi-cookies="' .
            $conf['cookies'] .
            '" data-supi-service="' .
            $conf['service'] .
            '">' . $jsSourceStdWrap . '</script>';

        $request = new ServerRequest(
            'https://www.domain.tld/privacy',
            'GET',
            null,
            [],
            [],
            []
        );

        $subject = new SupiJsContentObject($csp);
        $subject->setRequest($request);
        $subject->setContentObjectRenderer($cObj);
        $actual = $subject->render($conf);

        $this->assertEquals($expected, $actual);
    }
}
