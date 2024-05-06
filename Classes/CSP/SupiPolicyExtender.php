<?php

declare(strict_types=1);

namespace Supseven\Supi\CSP;

use TYPO3\CMS\Core\Cache\Frontend\FrontendInterface;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\HashValue;
use TYPO3\CMS\Core\SingletonInterface;
use TYPO3\CMS\Frontend\Controller\TypoScriptFrontendController;

/**
 * Registry and event listener to extend the CSP config
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SupiPolicyExtender implements SingletonInterface
{
    public function __construct(
        private readonly FrontendInterface $cache,
    ) {
    }

    public function __invoke(PolicyMutatedEvent $event): void
    {
        if (empty($GLOBALS['TSFE'])) {
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

            $this->cache->set($this->getCacheKey(), $hashes, ['pageId_' . $this->getTSFE()->id], 31536000);
        }
    }

    private function getCacheKey(): string
    {
        return 'supi_hashes_' . $this->getTSFE()->newHash;
    }

    private function getTSFE(): TypoScriptFrontendController
    {
        return $GLOBALS['TSFE'];
    }
}
