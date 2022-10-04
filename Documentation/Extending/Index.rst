.. include:: /Includes.rst.txt

Extending
====

you can extend the behaviour using some javascript events.

.. code-block:: javascript

    document.getElementById('myElement').addEventListener('supiInitStart', (event) => {
       alert("supi init done);
    });

Available Events
-------

.. t3-field-list-table::
 :header-rows: 1

 - :Field:
         Event:
   :Description:
         Description:
 - :Field:
         supiInitStart
   :Description:
         This event gets fired, when the EXT:supi init process starts
 - :Field:
         supiInitEnd
   :Description:
         This event gets fired, when the EXT:supi init process ends
 - :Field:
         injectScript
   :Description:
         This event gets fired, when the supi scripts (application/supi) are added to the web-page
 - :Field:
         bannerHide
   :Description:
         This event gets fired, when the banner hides
 - :Field:
         bannerShow
   :Description:
         This event gets fired, when the banner shows
 - :Field:
         allowAll
   :Description:
         This event gets fired, when the user allows all cookies
 - :Field:
         allowEssential
   :Description:
         This event gets fired, when the user allows only essential cookies
 - :Field:
         allowSelected
   :Description:
         This event gets fired, when the user allows only selected cookies
 - :Field:
         cookieDeleted
   :Description:
         This event gets fired, when the user disallows all cookies afterwards
 - :Field:
         youTubeAllowedGlobal
   :Description:
         This event gets fired, when the user allows Youtube globally
 - :Field:
         youTubeAllowed
   :Description:
         This event gets fired, when the user allows a Youtube Element
 - :Field:
         customMapAllowed
   :Description:
         This event gets fired, when the user allows Google Maps
 - :Field:
         simpleMapAllowed
   :Description:
         This event gets fired, when the user allows Google Maps
         **@TODO: where is the difference between this and the customMap event?**
 - :Field:
         serviceCallback
   :Description:
         This event gets fired, when a callback service is called. (eg an json service is loaded)
 - :Field:
         serviceCallbackError
   :Description:
         This event gets fired, when a callback service call failed. eg. a json service is not available
 - :Field:
         serviceEmbeded
   :Description:
         This event gets fired, when a embed service is called. e.g. an iframe
