<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\CSP;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\CSP\SupiPolicyExtender;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\HashValue;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Policy;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SupiPolicyExtenderTest extends TestCase
{
    public function testAddInlineScript(): void
    {
        $data = 'console.log("I am a Javascript");';
        $hash = hash('sha256', $data);
        $hashValue = new HashValue($hash);
        $newHash = 'abc';
        $directive = Directive::ScriptSrcElem;

        $policy = $this->createMock(Policy::class);
        $policy
            ->expects($this->once())
            ->method('extend')
            ->with($this->equalTo($directive), $this->equalTo($hashValue));

        $event = new PolicyMutatedEvent(
            Scope::frontend(),
            $this->createMock(Policy::class),
            $policy
        );

        $cache = $this->createMock(FrontendInterface::class);
        $cache
            ->expects($this->exactly(2))
            ->method('get')
            ->with($this->equalTo('supi_hashes_' . $newHash))
            ->willReturn([$hash]);

        $tsfe = $this->createMock(TypoScriptFrontendController::class);
        $tsfe->id = 123;
        $tsfe->newHash = $newHash;
        $GLOBALS['TSFE'] = $tsfe;

        $subject = new SupiPolicyExtender($cache);
        $subject->addInlineScript($data);
        $subject($event);
    }
}
