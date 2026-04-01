..  include:: /Includes.rst.txt

..  _integration:

===========
Integration
===========

Frontend Integration
====================

To display the Cookie Consent Banner on your website, you need to include the
provided cObject in your Fluid layout or page template.

Add the following snippet at the end of your ``<body>`` tag:

..  code-block:: html

    <f:cObject typoscriptObjectPath="lib.elements.supi" />

Site Sets and Services
======================

EXT:supi uses Site Sets to manage configurations for different services. You can
enable specific services by adding their respective Site Sets in the
**Site Management** module.

Available Site Sets:
--------------------

-   **EXT:supi base setup**: Core functionality and basic styling.
-   **EXT:supi - Youtube**: Integration for YouTube videos.
-   **EXT:supi - Google Maps**: Integration for Google Maps.
-   **EXT:supi - Spotify**: Integration for Spotify embeds.
-   **EXT:supi - Google Analytics**: Integration for GA tracking.
-   **EXT:supi - Google Tag Manager**: Integration for GTM.
-   **EXT:supi - Matomo**: Integration for Matomo analytics.

Content Security Policy (CSP)
=============================

EXT:supi includes a built-in CSP extender that automatically generates hashes
for inline scripts injected via the banner. This ensures that your tracking
scripts work even with a strict Content Security Policy.

The ``SupiPolicyExtender`` listens to the ``PolicyMutatedEvent`` and adds
the necessary sha256 hashes to the ``script-src-elem`` directive.

Assets
======

By default, the extension includes its own CSS and JavaScript files.

-   **CSS**: ``EXT:supi/Resources/Public/Css/Supi.css``
-   **JS**: ``EXT:supi/Resources/Public/JavaScript/Supi.js``

If you want to integrate the styles and scripts into your own build pipeline,
you can find the source files in the ``Build/`` directory of the extension.
To disable the automatic inclusion of default assets, you can adjust the
TypoScript settings or your Site configuration.

Google Consent Mode v2
======================

EXT:supi supports Google Consent Mode v2 (GCM v2) to synchronize the user's
consent with Google services like Google Tag Manager and Google Analytics.

Activation
----------

GCM v2 is enabled by default. You can control this via the **Site Configuration**
module:

..  code-block:: yaml

    settings:
      supseven:
        supi:
          google_consent_mode_v2: true

Default Behavior
----------------

When enabled, a default consent state is set before any Google scripts are
loaded. By default, all flags (``ad_storage``, ``ad_user_data``,
``ad_personalization``, ``analytics_storage``) are set to ``denied``.

This initialization script is injected into ``page.headerData`` using the
``SUPI_JS`` content object with the ``as-consent-mode = 1`` option. This
ensures that the script runs immediately and its hash is registered for the
**Content Security Policy (CSP)**.

Consent Synchronization
-----------------------

Once the user interacts with the banner (Allow All, Dismiss, or Save), the
GCM v2 state is updated automatically via ``gtag('consent', 'update', ...)``.

-   If the **Marketing** category is allowed, all GCM v2 flags are set to ``granted``.
-   If **Analytics** or **Statistics** categories are allowed, the ``analytics_storage`` flag is set to ``granted``.

Implementation Detail
---------------------

For developers creating custom Google integrations: Use the ``SUPI_JS`` content
object with ``as-consent-mode = 1`` to inject scripts that should run
immediately (like the GCM default state) while still being compatible with CSP.
