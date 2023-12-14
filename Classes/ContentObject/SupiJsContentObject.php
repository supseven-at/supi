<?php

declare(strict_types=1);

namespace Supseven\Supi\ContentObject;

use Supseven\Supi\CSP\SupiPolicyExtender;
use TYPO3\CMS\Frontend\ContentObject\AbstractContentObject;

/**
 * Like COA, but with a <script> tag around that generates a CSP hash
 *
 * @author Georg Großberger <g.grossberger@supseven.at>
 */
class SupiJsContentObject extends AbstractContentObject
{
    public function __construct(
        private readonly SupiPolicyExtender $supiPolicyExtender,
    ) {
    }

    public function render($conf = []): string
    {
        $jsSource = $this->cObj->cObjGetSingle($conf['content'], $conf['content.']);

        if (!empty($conf['stdWrap.'])) {
            $jsSource = $this->cObj->stdWrap($jsSource, $conf['stdWrap.']);
        }

        if (!trim($jsSource)) {
            return '';
        }

        $this->supiPolicyExtender->addInlineScript($jsSource);

        $script = '<script type="application/supi"';

        $cookies = $this->cObj->stdWrapValue('cookies', $conf);
        $service = $this->cObj->stdWrapValue('service', $conf);

        if ($cookies) {
            $script .= ' data-supi-cookies="' . htmlspecialchars($cookies, ENT_QUOTES, 'UTF-8', false) . '"';
        }

        if ($service) {
            $script .= ' data-supi-service="' . htmlspecialchars($service, ENT_QUOTES, 'UTF-8', false) . '"';
        }

        return $script . '>' . $jsSource . '</script>';
    }
}
