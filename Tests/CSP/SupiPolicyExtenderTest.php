<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\CSP;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\CSP\SupiPolicyExtender;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\HashValue;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Policy;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;

/**
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SupiPolicyExtenderTest extends TestCase
{
    public function testAddInlineScript(): void
    {
        $data = 'console.log("I am a Javascript");';
        $hash = new HashValue(hash('sha256', $data));
        $directive = Directive::ScriptSrc;

        $policy = $this->createMock(Policy::class);
        $policy
            ->expects($this->once())
            ->method('extend')
            ->with($this->equalTo($directive), $this->equalTo($hash));

        $event = new PolicyMutatedEvent(
            Scope::frontend(),
            $this->createMock(Policy::class),
            $policy
        );

        $subject = new SupiPolicyExtender();
        $subject->addInlineScript($data);
        $subject($event);
    }
}
