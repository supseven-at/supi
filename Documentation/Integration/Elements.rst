.. include:: /Includes.rst.txt

.. _elements:

Elements
================

The Elements array configures all elements visible in the banner for the user. here you can define whether a element is an optional or mandatory setting and describe them and all depending cookies here.

you can add as many elements as you need. We explain the `essential` section here in detail

.. container:: ts-properties

   ================================================== ============== ======
   Name                                               Default Value  Type
   ================================================== ============== ======
   `essential`_                                                      array
   `essential.required`_                              1              bool
   `essential.showOnLoad`_                            1              bool
   `essential.label`_                                                string
   `essential.text`_                                                 string
   `essential.names`_                                                string
   `essential.items`_                                                array
   `essential.items.$NAME.label`_                                    string
   `essential.items.$NAME.names`_                                    string
   `essential.items.$NAME.table`_                                    array
   `essential.items.$NAME.table.name`_                               string
   `essential.items.$NAME.table.company`_                            string
   `essential.items.$NAME.table.policy`_                             integer
   `essential.items.$NAME.table.rows`_                               array
   ================================================== ============== ======

.. ### BEGIN~OF~TABLE ###

.. index:: essential

essential
~~~~~~~~~

.. container:: table-row

   Property
         essential

   Data type
         array

   Default


   Description
         these are the very essential elements on a web-page. for example the EXT:supi cookie itself. these elements are mostly required by default and cannot be disabled.

   Images
         .. include:: /Images/Essentials.rst.txt

.. index:: essential.required

essential.required
~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.required

   Data type
         bool

   Default
         1

   Description
         these elements are required and cannot be deselected by the user

.. index:: essential.showOnLoad

essential.showOnLoad
~~~~~~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.showOnLoad

   Data type
         bool

   Default
         1

   Description
         @TODO: muss noch beschrieben werden. ich weiss gerade nicht, für was das gut ist.

.. index:: essential.label

essential.label
~~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.label

   Data type
         string

   Default
         LLL String

   Description
         Add a String or a LLL String to describe this section

   Images
         .. include:: /Images/EssentialLabel.rst.txt

.. index:: essential.text

essential.text
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.text

   Data type
         string

   Default
         LLL String

   Description
         @TODO: wird das noch verwendet?

.. index:: essential.names

essential.names
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.names

   Data type
         string

   Default
         Some cookie Names

   Description
         The cookies that are initially set by default from the TYPO3 system or the EXT:supi

.. index:: essential.items

essential.items
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items

   Data type
         array

   Default


   Description
         All Items in this (essential) section the user can use.

   Images
         .. include:: /Images/EssentialItems.rst.txt

.. index:: essential.items.$NAME.label

essential.items.$NAME.label
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.label

   Data type
         string

   Default
      LLL String

   Description
         Describe your essential item

   Images
         .. include:: /Images/EssentialItemsLabel.rst.txt

.. index:: essential.items.$NAME.names

essential.items.$NAME.names
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.names

   Data type
         string

   Default
      Some cookie names

   Description
         Name all your cookies in this section

.. index:: essential.items.$NAME.table

essential.items.$NAME.table
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.table

   Data type
         array

   Default


   Description
         A HTML Table declaration for displaying more detailed cookie informations

   Images
         .. include:: /Images/Tables.rst.txt

.. index:: essential.items.$NAME.table.name

essential.items.$NAME.table.name
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.table.name

   Data type
         string

   Default
      LLL String

   Description
         Describe the usage of the named cookie

.. index:: essential.items.$NAME.table.company

essential.items.$NAME.table.company
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.table.company

   Data type
         string

   Default
      LLL String

   Description
         The responsible company for this cookie

.. index:: essential.items.$NAME.table.policy

essential.items.$NAME.table.policy
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.table.policy

   Data type
         integer

   Default
      1

   Description
         The PageUID or URL to the privacy/policy page

.. index:: essential.items.$NAME.table.rows

essential.items.$NAME.table.rows
~~~~~~~~~~~~~~

.. container:: table-row

   Property
         essential.items.$NAME.table.rows

   Data type
         array

   Default

   Description
         add as many rows as you cookies have, each row has a purpose and a duration

   Images
         .. include:: /Images/Row.rst.txt

.. ###### END~OF~TABLE ######
