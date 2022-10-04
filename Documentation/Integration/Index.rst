.. include:: /Includes.rst.txt

Integration
===========

Setup
-----

You need to integrate the shipped TypoScript (e.g. in your theme Extension) and
add a cObject into your Page Template/Layout

TypoScript
^^^^^^^^^^

Include the shipped TypoScript File into your Theme TypoScript Setup:

.. code-block:: typoscript

   @import "EXT:supi/Configuration/TypoScript/setup.typoscript"

Fluid/HTML
^^^^^^^^^^

Include the cObject in your Page Layout

.. code-block:: html

   <f:cObject typoscriptObjectPath="lib.elements.supi" />

.. tip::

    **Best Practice**

    Add the `cObject` Part at the very end of the Page.

Configuration
-------------

Template and Views
^^^^^^^^^^^^^^^^^^

The Template, Partials and Layout Root Paths. You can override them or add own Paths, if You need.

.. code-block:: typoscript

   templateRootPaths.10 = EXT:your-theme/Resources/Private/Templates/
   partialRootPaths.10 = EXT:your-theme/Resources/Private/Partials/
   layoutRootPaths.10 = EXT:your-theme/Resources/Private/Layouts/

Page Settings
^^^^^^^^^^^^^

.. container:: ts-properties

.. ### BEGIN~OF~TABLE ###

.. index:: page.includeJS.supi

page.includeJS.supi
~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         page.includeJS.supi

   Description
         Includes the main JavaScript file into Your TYPO3 instance.

.. index:: page.includeCSS.supi

page.includeCSS.supi
~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         page.includeCSS.supi

   Description
         Includes the main CSS file into Your TYPO3 instance.

.. ###### END~OF~TABLE ######

.. tip::

    **Best Practice**

    Remove the Default CSS/JS implementations and integrate it into Your frontend workflow/ pipeline. All SCSS/TypeScript Sources are available in the EXT:supi folder.

Settings
^^^^^^^^

.. container:: ts-properties

   ================================== ============== ======
   Name                               Default Value  Type
   ================================== ============== ======
   `enabled`_                         1              bool
   `hideOverlayOnButtonCe`_           1              bool
   `hideAutoEssential`_               0              bool
   `detailed`_                        1              bool
   `perItemDetail`_                   1              bool
   `perItemSelect`_                   1              bool
   `showBigSwitch`_                   0              bool
   `theme`_                           default        string
   `position`_                        1              int
   `enableYoutubeOnce`_               0              bool
   `enableSimpleMapsOnce`_            0              bool
   `essentialIncludesYoutube`_        0              bool
   `essentialIncludesMaps`_           0              bool
   `debugClass`_                      be_user_login  string
   `cookieDomain`_                                   string
   `cookieTTL.all`_                   30             int
   `cookieTTL.reduced`_               7              int
   `gdpr.uid`_                        1              int
   `elements`_                                       array
   `button`_                                         array
   `spotify`_                                        array
   ================================== ============== ======

.. ### BEGIN~OF~TABLE ###

.. index:: enabled

enabled
~~~~~~~

.. container:: table-row

   Property
         enabled

   Data type
         bool

   Default
         1

   Description
         Enable or Disable the Banner. This could be useful in some cases

.. index:: hideOverlayOnButtonCe

hideOverlayOnButtonCe
~~~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         hideOverlayOnButtonCe

   Data type
         bool

   Default
         1

   Description
         Hides the overlay if the cookie button CE is visible (mostly used on the dataprotection page)

.. index:: hideAutoEssential

hideAutoEssential
~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         hideAutoEssential

   Data type
         bool

   Default
         0

   Description
         Hide the "Functional Cookies only" button

   Images
         .. include:: /Images/HideAutoEssentialBtn.rst.txt

   Notes
         **@TODO: we might remove this due to DARK PATTERN behaviour**

.. index:: detailed

detailed
~~~~~~~~

.. container:: table-row

   Property
         detailed

   Data type
         bool

   Default
         1

   Description
         Enables or disables detailed view

   Notes
         **@TODO: we need to discuss this. we might remove this or at least do not show the individual btn config**

.. index:: perItemDetail

perItemDetail
~~~~~~~~~~~~~

.. container:: table-row

   Property
         perItemDetail

   Data type
         bool

   Default
         1

   Description
         Enables or disables detailed view for each item

   Notes
         **@TODO: we need to discuss this. we might remove this due to GDPR regulations**


.. index:: perItemSelect

perItemSelect
~~~~~~~~~~~~~

.. container:: table-row

   Property
         perItemSelect

   Data type
         bool

   Default
         1

   Description
         Enable select per item

.. index:: showBigSwitch

showBigSwitch
~~~~~~~~~~~~~

.. container:: table-row

   Property
         showBigSwitch

   Data type
         bool

   Default
         0

   Description
         Enable big switch-to-detail in overview if detail is active. works only with `hideAutoEssential`_

   Notes
         **@TODO: we need to discuss this. we might remove this due to GDPR regulations - DARK PATTERN**

.. index:: theme

theme
~~~~~~

.. container:: table-row

   Property
         theme

   Data type
         string

   Default
         default

   Description
         Theming Name

   Notes
         **@TODO: IMHO we can remove this and build a simple but useful theme - most websites are styling all over but the main theme is always the same**

.. index:: position

position
~~~~~~~~

.. container:: table-row

   Property
         position

   Data type
         int

   Default
         1

   Description
         Position of the Cookie Banner (0 ~ Bottom-Left, 1 ~ Center-Center)

   Notes
         **@TODO: IMHO we can remove this and build a simple but useful theme - most websites are styling all over but the main theme is always the same**

.. index:: enableYoutubeOnce

enableYoutubeOnce
~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         enableYoutubeOnce

   Data type
         bool

   Default
         0

   Description
         Set to 1 to enable the load-once button for youtube elements

   Images
         .. include:: /Images/EnableYoutubeOnce.rst.txt

   Notes
         **@TODO: refactor youtube element**

.. index:: enableSimpleMapsOnce

enableSimpleMapsOnce
~~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         enableSimpleMapsOnce

   Data type
         bool

   Default
         0

   Description
         Set to 1 to enable the load-once button for Google Maps elements

   Images
         .. include:: /Images/EnableSimpleMapsOnce.rst.txt

   Notes
         **@TODO: add translations and propper style**

.. index:: essentialIncludesYoutube

essentialIncludesYoutube
~~~~~~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essentialIncludesYoutube

   Data type
         bool

   Default
         0

   Description
         Youtube is enabled by essential

   Notes
         **@TODO: we need to discuss this. due to GDPR regulations this might not be OK!**

.. index:: essentialIncludesMaps

essentialIncludesMaps
~~~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essentialIncludesMaps

   Data type
         bool

   Default
         0

   Description
         Google Maps is enabled by essential

   Notes
         **@TODO: we need to discuss this. due to GDPR regulations this might not be OK!**

.. index:: debugClass

debugClass
~~~~~~~~~~

.. container:: table-row

   Property
         debugClass

   Data type
         string

   Default


   Description
         A CSS-Classname on the HTML-Body, that is needed, to output console.log() debug messages. Usually you have to set a addictional body-class via :ref:`TypoScript reference: page.bodyTagCObject <t3tsref:setup-page-bodytagcobject>`.

.. index:: cookieDomain

cookieDomain
~~~~~~~~~~~~

.. container:: table-row

   Property
         cookieDomain

   Data type
         string

   Default


   Description
         Set a Domain Name for the Cookie Settings

.. index:: cookieTTL.all

cookieTTL.all
~~~~~~~~~~~~

.. container:: table-row

   Property
         cookieTTL.all

   Data type
         int

   Default
         30

   Description
         cookie time to live (in days) for allow all cookies

.. index:: cookieTTL.reduced

cookieTTL.reduced
~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         cookieTTL.reduced

   Data type
         int

   Default
         7

   Description
         cookie time to live (in days) for selected/ essential cookies

.. index:: gdpr.uid

gdpr.uid
~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         gdpr.uid

   Data type
         int

   Default
         1

   Description
         page uid for the gdpr page

   Image
         .. include:: /Images/GdprUid.rst.txt

.. index:: elements

elements
~~~~~~

.. container:: table-row

   Property
         elements

   Data type
         array

   Default


   Description
      The configuration of all elements visible and usable in the EXT:supi banner

   Example
      see :ref:`elements <elements>` for a detailed description
      // @TODO: how to add a subpage in rst in the pagetree?

.. index:: button

button
~~~~~~

.. container:: table-row

   Property
         button

   Data type
         array

   Default
      LLL Strings

   Description
      Text/ Translations of all Buttons visible in the Banner. Use `LLL` Strings to output translated strings

   Example
      .. code-block:: typoscript

         button {
            allow {
                label = LLL:EXT:supi/Resources/Private/Language/locallang.xlf:banner.button.allow.label
                text = LLL:EXT:supi/Resources/Private/Language/locallang.xlf:banner.button.allow.text
            }
         }

.. index:: spotify

spotify
~~~~~~

.. container:: table-row

   Property
         spotify

   Data type
         array

   Default
      Spotify Player attributes

   Description
      Configure the Spotify integration like `url`, `player attributes` and more

   Example
      .. code-block:: typoscript

        spotify {
            url = https://open.spotify.com/embed/playlist/{id}
            playerAttr {
                width = 100%
                height = 380
                allowfullscreen = allowfullscreen
                allow = autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture
                style = border-radius:12px
            }
            enableDescription = LLL:EXT:supi/Resources/Private/Language/locallang.xlf:ce.spotify.enable.description
            enableToggle = LLL:EXT:supi/Resources/Private/Language/locallang.xlf:ce.spotify.enable.toggle
        }

.. ###### END~OF~TABLE ######

