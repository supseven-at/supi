.. include:: /Includes.rst.txt
.. _start:

====
EXT:Supi
====

:Language:
     en

:Version:
   |release|

:Description:
     Full documentation to install, integrate and style EXT:supi

:Keywords:
     cookie, banner, consent, gdpr

:Author:
     Volker Kemeter

:Email:
     v.kemeter@supseven.at

:License:
   This document is published under the Open Content License
   available from http://www.opencontent.org/opl.shtml

:Rendered:
   |today|

----
Introduction
----

The EXT:Supi Extension provides a Cookie Consent Banner for almost every needs.

You can add:

* External Scripts
* External Sources in Iframes
* External Sources via APIs

This Extension provides a few Content-Elements which are ready to go:

* Youtube Content Element
* Google Maps Youtube Element
* Embeded Page/Service (Iframe Element)
* Spotify Playlist Element
* Cookie Button Element (to reopen the Cookie Banner)

There are also JavaScript Events where you can add Listeners to interact with
the corresponding User-Settings.

----
Compatibility
----

.. list-table:: EXT:Supi Versions available for TYPO3 Versions
   :widths: 33 33 33
   :header-rows: 1

   * - EXT:Supi Version
     - TYPO3
     - PHP
   * - 6
     - 7 - 11
     - 7.4 - 8.1

----
Table of Contents
----

.. toctree::
   :maxdepth: 2
   :titlesonly:

   About/Index
   Installation/Index
   Integration/Index
   ContentElements/Index
   Styling/Index
   Extending/Index
   Changelog/Index

----
TODO
----

#.  Refactor Templates/ Styles which can be better used

    #.  Add more CSS-Grid to Youtube, Maps and other Elements
    #.  Add more Bootstrap Classes in HTML Templates (btn classes e.g.)

#.  Remove some not needed TS-Settings
#.  Improve Youtube CE (add preview image field and some options)
#.  Improve Maps CE (styling, translation/labels)
#.  Add as much as possible translations
#.  Refactor Language behaviour

    #.  move to xlf files only, remove typoscript settings
    #.  make xlf files configurable/overrideable
    #.  https://docs.typo3.org/m/typo3/reference-coreapi/11.5/en-us/ApiOverview/Internationalization/ManagingTranslations.html

--------------------
Render Documentation
--------------------

`docker-compose run --rm t3docmake`
