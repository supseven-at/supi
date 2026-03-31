..  include:: /Includes.rst.txt

..  _introduction:

============
Introduction
============

What does it do?
================

The EXT:supi extension provides a GDPR-compliant Cookie Consent Banner for TYPO3.
It allows you to manage user consent for various types of cookies and external
services.

Key features:

-   **Site Sets support**: Modern configuration using TYPO3 v13/v14 Site Sets.
-   **Service categories**: Group cookies into categories like 'Essential',
    'Marketing', or 'Media'.
-   **Pre-configured services**: Built-in support for YouTube, Google Maps,
    Spotify, Matomo, Google Analytics, and Google Tag Manager.
-   **Dynamic script injection**: Loads scripts only after user consent.
-   **Content Security Policy (CSP)**: Automatically adds hashes for inline
    scripts to your CSP policy.
-   **Accessibility**: Fully accessible and responsive banner UI using native
    HTML ``<dialog>`` element.
-   **Customizable**: Easily extendable with custom services and styles.

Built-in Content Elements
=========================

The extension provides several content elements that respect user consent:

-   **YouTube**: Displays a preview image and loads the video only after consent.
-   **Google Maps**: Interactive maps with placeholder support.
-   **Spotify**: Embed playlists or tracks securely.
-   **Embed Page**: Generic iframe element for any external service.
-   **Cookie Button**: A button to let users reopen the banner and change their
    preferences.

Kudos
=====

This extension is brought to you by `supseven <https://www.supseven.at>`__.
Big kudos to Georg Großberger for the initial implementation and architectural
design.
