<?php

declare(strict_types=1);

namespace Supseven\Supi\Tests\CSP;

use PHPUnit\Framework\TestCase;
use Supseven\Supi\CSP\SupiPolicyExtender;
use TYPO3\CMS\Core\Cache\CacheDataCollector;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Http\ServerRequest;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\HashValue;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Policy;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Scope;
use TYPO3\CMS\Frontend\Page\PageInformation;

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

        $pageInfo = new PageInformation();
        $pageInfo->setId(123);

        $cacheCollector = new CacheDataCollector();
        $cacheCollector->setPageCacheIdentifier($newHash);

        $request = (new ServerRequest())
            ->withAttribute('frontend.cache.collector', $cacheCollector)
            ->withAttribute('frontend.page.information', $pageInfo);

        $policy = $this->createMock(Policy::class);
        $policy
            ->expects($this->once())
            ->method('extend')
            ->with($this->equalTo($directive), $this->equalTo($hashValue));

        $event = new PolicyMutatedEvent(
            Scope::frontend(),
            $request,
            $this->createStub(Policy::class),
            $policy
        );

        $cache = $this->createMock(FrontendInterface::class);
        $cache
            ->expects($this->exactly(2))
            ->method('get')
            ->with($this->equalTo('supi_hashes_' . $newHash))
            ->willReturn([$hash]);

        $GLOBALS['TYPO3_REQUEST'] = $request;

        $subject = new SupiPolicyExtender($cache);
        $subject->addInlineScript($data);
        $subject($event);
    }
}
