.. include:: /Includes.rst.txt

Content Elements
====

There are five Content Elements at this moment. All Content Elements have JavaScript events where you can add listeners to to interact with the HTML markup for more specific stuff.

The ContentElements get its information through dataprocessing.

.. container:: row m-0 p-0

   .. container:: col-xs-12 pl-0 pr-3 py-3 m-0

      .. container:: card px-0 h-100

         .. rst-class:: card-header h3

            .. rubric:: Youtube

         .. container:: card-body

            The Youtube Element gives You the ability to add .youtube File relations into the Element. See the Template-File for integration requirements.

            The Youtube CE delivers the Youtube Poster-Image as a local File. See `tt_content.tx_supi_youtube` for more detailed configurations.

   .. container:: col-xs-12 pl-0 pr-3 py-3 m-0

      .. container:: card px-0 h-100

         .. rst-class:: card-header h3

            .. rubric:: Google Maps

         .. container:: card-body

            The Google Maps Element displays a Google Map based on a given Address in the Content Element. You can add a Preview Image which can be displayed before the user accepts the cookie.

            See `tt_content.tx_supi_maps` for more detailed configurations.

   .. container:: col-xs-12 pl-0 pr-3 py-3 m-0

      .. container:: card px-0 h-100

         .. rst-class:: card-header h3

            .. rubric:: Spotify

         .. container:: card-body

            The Spotify element helps you, to add spotify playlists or tracks into your webpage.

            See `tt_content.tx_supi_spotify` for more detailed configurations.

   .. container:: col-xs-12 pl-0 pr-3 py-3 m-0

      .. container:: card px-0 h-100

         .. rst-class:: card-header h3

            .. rubric:: Embed Page

         .. container:: card-body

            The Embed Page element helps you, to add iframes or other external related stuff into your webpage.

            **@TODO: explain the services. there are different types, eg. iframe, callback and possibly more**

            Example:

            register the service into the settings.elements array. see :ref:`elements <elements>` for a detailed description

            .. code-block:: typoscript

               plugin.tx_supi.settings.elements.media.items.test {
                  label = test
                  service = test
               }

            afterwards configure your `service`

            .. code-block:: typoscript

               plugin.tx_supi.settings.services {
                   test {
                       label = My Test IFRAME
                       service = test
                       type = iframe
                       attr {
                           src = https://www.supseven.at
                           height = 1200
                           style = width:100%
                           class = supi-iframe
                       }
                   }
               }

   .. container:: col-xs-12 pl-0 pr-3 py-3 m-0

      .. container:: card px-0 h-100

         .. rst-class:: card-header h3

            .. rubric:: Cookie Button

         .. container:: card-body

            The Cookie Button re-opens the Cookie Banner to let the user choose again what cookies or services he accepts. usually this button is located in the data-privacy page or maybe added to the html layout as a sticky element.
