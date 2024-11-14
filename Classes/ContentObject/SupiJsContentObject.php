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
        protected readonly SupiPolicyExtender $supiPolicyExtender,
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

        foreach (['cookies', 'service'] as $attr) {
            $value = $this->cObj->stdWrapValue($attr, $conf);

            if ($value) {
                $script .= ' data-supi-' . $attr . '="' . htmlspecialchars($value, ENT_QUOTES, 'UTF-8', false) . '"';
            }
        }

        return $script . '>' . $jsSource . '</script>';
    }
}
