<?php

declare(strict_types=1);

namespace Supseven\Supi\CSP;

use Psr\Http\Message\ServerRequestInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use TYPO3\CMS\Core\Attribute\AsEventListener;
use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\HashValue;
use TYPO3\CMS\Core\SingletonInterface;

/**
 * Registry and event listener to extend the CSP config
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
#[AsEventListener('supseven/supi/csp')]
class SupiPolicyExtender implements SingletonInterface
{
    public function __construct(
        #[Autowire(service: '@cache.hash')]
        protected readonly FrontendInterface $cache,
    ) {
    }

    public function __invoke(PolicyMutatedEvent $event): void
    {
        if (!$this->getRequest()?->getAttribute('frontend.cache.collector')) {
            return;
        }

        $hashes = $this->cache->get($this->getCacheKey()) ?: [];

        foreach ($hashes as $hash) {
            $event->getCurrentPolicy()->extend(Directive::ScriptSrcElem, new HashValue($hash));
        }
    }

    public function addInlineScript(string $data): void
    {
        $hash = hash('sha256', $data);
        $hashes = $this->cache->get($this->getCacheKey());

        if (!is_array($hashes)) {
            $hashes = [];
        }

        if (!in_array($hash, $hashes)) {
            $hashes[] = $hash;
            $pageId = $this->getRequest()->getAttribute('frontend.page.information')->getId();
            $this->cache->set($this->getCacheKey(), $hashes, ['pageId_' . $pageId], 31536000);
        }
    }

    protected function getCacheKey(): string
    {
        return 'supi_hashes_' . $this->getRequest()->getAttribute('frontend.cache.collector')->getPageCacheIdentifier();
    }

    private function getRequest(): ?ServerRequestInterface
    {
        return $GLOBALS['TYPO3_REQUEST'] ?? null;
    }
}
