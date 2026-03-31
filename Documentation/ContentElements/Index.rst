..  include:: /Includes.rst.txt

..  _content-elements:

================
Content Elements
================

EXT:supi provides several content elements that are designed to respect the
user's consent. These elements display a placeholder or a preview image and load
the actual content only after the user has accepted the corresponding service.

YouTube
=======

The YouTube element allows you to embed videos by providing a YouTube ID. It
automatically fetches a local preview image to avoid external requests before
consent.

**Configuration:**
You can configure the behavior (e.g., enable load-once button) via Site Settings.

Google Maps
===========

Displays an interactive Google Map based on an address. A preview image can be
assigned to the content element to be shown as a placeholder.

**Types:**
-   **Custom Map**: Uses a callback function for specialized implementations.
-   **Simple Map**: Uses a standard iframe embed.

Spotify
=======

Embed playlists or tracks from Spotify. The extension ensures that the player
is only loaded after consent.

Embed Page
==========

A generic content element to embed any external page or service via an iframe.
You can register custom services in the banner configuration and use them with
this element.

Cookie Button
=============

A simple button that opens the Cookie Consent Banner. This is useful for
placing a "Privacy Settings" button in the footer or on the data protection
page.

JavaScript Events
=================

All content elements trigger custom JavaScript events when they are loaded or
initialized. You can listen to these events to add custom logic:

-   ``injectScript``
-   ``youTubeAllowed``
-   ``customMapAllowed``
-   ``simpleMapAllowed``
-   ``serviceEmbeded``
-   ``serviceCallback``
