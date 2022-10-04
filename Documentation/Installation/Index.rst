.. include:: /Includes.rst.txt

Installation
==================

In a :ref:`composer-based TYPO3 installation <t3start:install>` you can install
the extension EXT:supi via composer:

.. code-block:: bash

   composer require supseven/supi

In TYPO3 installations above version 11.5 the extension will be automatically
installed. You do not have to activate it manually.

Update the database scheme
--------------------------

Open your TYPO3 backend with :ref:`system maintainer <t3start:system-maintainer>`
permissions.

In the module menu to the left navigate to :guilabel:`Admin Tools > Maintanance`,
then click on :guilabel:`Analyze database` and create all.

.. include:: /Images/AnalyzeDatabase.rst.txt

Clear all caches
----------------

In the same module :guilabel:`Admin Tools > Maintanance` you can also
conveniently clear all caches by clicking the button :guilabel:`Flush cache`.

.. include:: /Images/FlushCache.rst.txt
