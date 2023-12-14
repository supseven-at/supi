<?php

declare(strict_types=1);

namespace Supseven\Supi\CSP;

use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Directive;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\Event\PolicyMutatedEvent;
use TYPO3\CMS\Core\Security\ContentSecurityPolicy\HashValue;
use TYPO3\CMS\Core\SingletonInterface;

/**
 * Registry and event listener to extend the CSP config
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SupiPolicyExtender implements SingletonInterface
{
    private array $extensions = [];

    public function addInlineScript(string $data): void
    {
        $hash = hash('sha256', $data);
        $this->extensions[] = [Directive::ScriptSrc, new HashValue($hash)];
    }

    public function __invoke(PolicyMutatedEvent $event): void
    {
        foreach ($this->extensions as $extension) {
            $event->getCurrentPolicy()->extend(...$extension);
        }
    }
}
