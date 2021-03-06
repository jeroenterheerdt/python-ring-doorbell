=====================
Python Ring Door Bell
=====================

.. image:: https://badge.fury.io/py/ring-doorbell.svg
    :target: https://badge.fury.io/py/ring-doorbell

.. image:: https://travis-ci.org/tchellomello/python-ring-doorbell.svg?branch=master
    :target: https://travis-ci.org/tchellomello/python-ring-doorbell

.. image:: https://coveralls.io/repos/github/tchellomello/python-ring-doorbell/badge.svg?branch=master
    :target: https://coveralls.io/github/tchellomello/python-ring-doorbell?branch=master

.. image:: https://img.shields.io/pypi/pyversions/ring-doorbell.svg
    :target: https://pypi.python.org/pypi/ring-doorbell


Python Ring Door Bell is a library written in Python 2.7/3x
that exposes the Ring.com devices as Python objects.

*Currently Ring.com does not provide an official API. The results of this project are merely from reverse engineering.*

Documentation: `http://python-ring-doorbell.readthedocs.io/ <http://python-ring-doorbell.readthedocs.io/>`_


Installation
------------

.. code-block:: bash

    # Installing from PyPi
    $ pip install ring_doorbell

    # Installing latest development
    $ pip install \
        git+https://github.com/tchellomello/python-ring-doorbell@master


Initializing your Ring object
-----------------------------

.. code-block:: python

    from ring_doorbell import Ring
    myring = Ring('foo@bar', 'secret')

    myring.is_connected
    True

Listing devices linked to your account
--------------------------------------

.. code-block:: python

    # All devices
    myring.devices
    {'chimes': [<RingChime: Downstairs>],
    'doorbells': [<RingDoorBell: Front Door>]}

    # All chimes
    myring.chimes
    [<RingChime: Downstairs>]

    # All door bells
    myring.doorbells
    [<RingDoorBell: Front Door>]

    # All stickup cams
    myring.stickup_cams
    [<RingStickUpCam: Driveway>]

Playing with the attributes and functions
-----------------------------------------
.. code-block:: python

    for dev in list(myring.stickup_cams + myring.chimes + myring.doorbells):

        # refresh data
        dev.update()

        print('Account ID: %s' % dev.account_id)
        print('Address:    %s' % dev.address)
        print('Family:     %s' % dev.family)
        print('ID:         %s' % dev.id)
        print('Name:       %s' % dev.name)
        print('Timezone:   %s' % dev.timezone)
        print('Wifi Name:  %s' % dev.wifi_name)
        print('Wifi RSSI:  %s' % dev.wifi_signal_strength)

        # setting dev volume
        print('Volume:     %s' % dev.volume)
        dev.volume = 5
        print('Volume:     %s' % dev.volume)

        # play dev test shound
        if dev.family == 'chimes':
            dev.test_sound(kind = 'ding')
            dev.test_sound(kind = 'motion')

        # turn on lights on floodlight cam
        if dev.family == 'stickup_cams' and dev.lights:
            dev.lights = 'on'


Showing door bell events
------------------------
.. code-block:: python

    for doorbell in myring.doorbells:

        # listing the last 15 events of any kind
        for event in doorbell.history(limit=15):
            print('ID:       %s' % event['id'])
            print('Kind:     %s' % event['kind'])
            print('Answered: %s' % event['answered'])
            print('When:     %s' % event['created_at'])
            print('--' * 50)

        # get a event list only the triggered by motion
        events = doorbell.history(kind='motion')


Downloading the last video triggered by ding
--------------------------------------------
.. code-block:: python

    doorbell = myring.doorbells[0]
    doorbell.recording_download(
        doorbell.history(limit=100, kind='ding')[0]['id'],
                         filename='/home/user/last_ding.mp4',
                         override=True)


Displaying the last video capture URL
-------------------------------------
.. code-block:: python

    print(doorbell.recording_url(doorbell.last_recording_id))
    'https://ring-transcoded-videos.s3.amazonaws.com/99999999.mp4?X-Amz-Expires=3600&X-Amz-Date=20170313T232537Z&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=TOKEN_SECRET/us-east-1/s3/aws4_request&X-Amz-SignedHeaders=host&X-Amz-Signature=secret'

Streaming live video to disk
----------------------------
This is a very hacky solution and it depends on https://github.com/dgreif/ring/, a Node-based package by @dgreif.
In time we might be able to convert this to a full Python solution.
To get this to work, do the following:

1. install node (version 10+), npm (version 6.9+), typescript (version 3.6+) and ffmpeg:
    - ``sudo apt install nodejs npm ffmpeg``
    - ``npm install typescript``
2. Clone the Ring repository: ``git clone https://github.com/dgreif/ring/``.
3. Copy `livestream-param.ts` from this repo into the directory you just cloned: ``cp livestream-param.ts` ring/examples``.
4.  Install the NPM solution you just cloned: ``cd ring``, ``npm install``
5. Run ``tsc /ring/examples/livestream-param.ts --target es5 -esModuleInterop``. This should return without any error and create ``livestream-param.js`` in the ``ring/examples`` directory. Check that file exists before continuing.
6. make sure you have Naked (https://pypi.org/project/Naked/) installed: ``pip install naked`` (or pip3) or run ``pip install -r requirements.txt`` (or pip3)
7. Finally you are ready to get the livestream to work:

.. code-block:: python

    js_file = '/path/to/livestream-param.js'
    outputdir = '/path/to/outputdir'
    doorbell = myring.doorbells[0]
    doorbell.get_livestream(js_file, outputdir)

8. This will output a livestream from your Ring doorbell in MP4 format chunked in pieces of 10 seconds.


How to contribute
-----------------
See CONTRIBUTING.rst


Credits && Thanks
-----------------

* This project was inspired and based on https://github.com/jeroenmoors/php-ring-api. Many thanks @jeroenmoors.
* A guy named MadBagger at Prism19 for his initial research (http://www.prism19.com/doorbot/second-pass-and-comm-reversing/)
* The creators of mitmproxy (https://mitmproxy.org/) great http and https traffic inspector
* @mfussenegger for his post on mitmproxy and virtualbox https://zignar.net/2015/12/31/sniffing-vbox-traffic-mitmproxy/
* To the project http://www.android-x86.org/ which allowed me to install Android on KVM.
