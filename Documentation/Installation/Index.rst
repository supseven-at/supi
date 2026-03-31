..  include:: /Includes.rst.txt

..  _installation:

============
Installation
============

Requirements
============

-   TYPO3 v14.1 or higher
-   PHP 8.5 or higher

Installation via Composer
=========================

Run the following command in your TYPO3 project root:

..  code-block:: bash

    composer require supseven/supi

Activation
==========

In TYPO3 v14, extensions are automatically active. To use the functionality of
EXT:supi, you need to include its Site Sets in your site configuration.

1.  Open the **Site Management > Sites** module.
2.  Select your site and go to the **Sets** tab.
3.  Add the **EXT:supi base setup** set.
4.  (Optional) Add additional sets for specific services (e.g., YouTube,
    Google Maps).

..  note::
    Including the base setup set will automatically load the required
    TypoScript and Page TSconfig.

Update the database schema
==========================

After installing the extension, ensure your database schema is up to date:

1.  Navigate to **Admin Tools > Maintenance**.
2.  Click on **Analyze database**.
3.  Apply all suggested changes.
