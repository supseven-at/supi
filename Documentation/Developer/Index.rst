..  include:: /Includes.rst.txt

..  _developer:

=========
Developer
=========

This chapter provides technical information for developers who want to extend
or customize EXT:supi.

DataProcessors
==============

EXT:supi includes several specialized DataProcessors to prepare data for the
frontend templates.

Available Processors:
---------------------

-   :php:`Supseven\Supi\DataProcessing\YoutubeProcessor`: Prepares data for
    YouTube content elements, including local preview images.
-   :php:`Supseven\Supi\DataProcessing\AddressProcessor`: Handles address
    resolution for Google Maps elements.
-   :php:`Supseven\Supi\DataProcessing\SpotifyProcessor`: Prepares Spotify
    embed URLs.
-   :php:`Supseven\Supi\DataProcessing\ServicesProcessor`: Collects all
    active services for the banner configuration.
-   :php:`Supseven\Supi\DataProcessing\SettingsProcessor`: Merges Site
    Settings into the TypoScript configuration.

JavaScript API
==============

The banner logic is implemented in TypeScript and provides a global object on
the ``window`` scope (if enabled).

Events
------

You can listen to custom events on the ``document.body`` or specific elements:

..  code-block:: javascript

    document.body.addEventListener('supiInitEnd', (event) => {
        console.log('Supi is ready!', event.detail);
    });

    document.body.addEventListener('allowAll', () => {
        console.log('User accepted all services');
    });

    document.body.addEventListener('injectScript', (event) => {
        console.log('New script injected:', event.target);
    });

Content Security Policy (CSP)
=============================

If you are using inline scripts that should only load after consent, you can
use the :php:`SupiPolicyExtender` to register them. This will automatically
add the necessary sha256 hashes to your CSP policy.

..  code-block:: php

    use Supseven\Supi\CSP\SupiPolicyExtender;
    use TYPO3\CMS\Core\Utility\GeneralUtility;

    $policyExtender = GeneralUtility::makeInstance(SupiPolicyExtender::class);
    $policyExtender->addInlineScript('console.log("Hello from supi consent!");');

Custom Services
===============

You can add custom services to the banner via TypoScript or Site Settings.
A service typically belongs to a category (element) and has a type (iframe,
script, or callback).

Example registration:

..  code-block:: typoscript

    plugin.tx_supi.settings.services {
        my_service {
            label = My Custom Service
            type = callback
            service = my_service
            callback = myNamespace.initCustomService
        }
    }
