#!/usr/bin/env python
'''
    This is our dashboard server application, using the tornado handlers,
    that you can use to connect your HTML/Javascript dashboard code to
    your robot via NetworkTables.

    Run this application with python, then you can open your browser to
    http://localhost:5080/ to view the index.html page.
'''

from os.path import abspath, dirname, exists, join
from optparse import OptionParser

import tornado.web
from tornado.ioloop import IOLoop

from networktables import NetworkTable
import pynetworktables2js

import pylib.Robotlog as Robotlog

import functools
import logging
logger = logging.getLogger('dashboard')

def initNetworktables(options):
    if options.dashboard:
        logger.info("Connecting to networktables in Dashboard mode")
        NetworkTable.setDashboardMode()
    else:
        logger.info("Connecting to networktables at %s", options.robot)
        NetworkTable.setIPAddress(options.robot)
        NetworkTable.setClientMode()

    NetworkTable.initialize()
    logger.info("Networktables Initialized")

if __name__ == '__main__':

    # Setup options here
    parser = OptionParser()

    parser.add_option('-p', '--port', default=5080,
                      help='Port to run web server on')

    parser.add_option('-v', '--verbose', default=False, action='store_true',
                      help='Enable verbose logging')

    parser.add_option('--robot', default='10.49.15.2',
                      help="Robot's IP address")

    parser.add_option('--dashboard', default=False, action='store_true',
                      help='Use this instead of --robot to receive the IP from the driver station. WARNING: It will not work if you are not on the same host as the DS!')

    options, args = parser.parse_args()

    # Setup logging
    log_datefmt = "%H:%M:%S"
    #log_format = "%(asctime)s:%(msecs)03d %(levelname)-6s: %(name)-8s: %(message)s"
    log_format = "%(asctime)s %(levelname)-6s: %(name)-8s: %(message)s"
    logging.basicConfig(datefmt=log_datefmt,
                        format=log_format,
                        level=logging.DEBUG if options.verbose else logging.INFO)

    if options.dashboard and options.robot != '10.49.15.2':
        parser.error("Cannot specify --robot and --dashboard")

    initNetworktables(options)
    robotlog = Robotlog.Robotlog()

    # setup tornado application with static handler + networktables support
    www_dir = abspath(join(dirname(__file__), 'www'))
    index_html = join(www_dir, 'index.html')

    if not exists(www_dir):
        logger.error("Directory '%s' does not exist!", www_dir)
        exit(1)

    if not exists(index_html):
        logger.warn("%s not found" % index_html)

    app = tornado.web.Application(
        pynetworktables2js.get_handlers() +
        robotlog.getHandlers() + [
            (r"/()", pynetworktables2js.NonCachingStaticFileHandler,
                {"path": index_html}),
            (r"/(.*)", pynetworktables2js.NonCachingStaticFileHandler,
                {"path": www_dir})
        ]
    )


    # Start the app
    logger.info("Listening on http://localhost:%s/", options.port)

    app.listen(options.port)
    ioLoop = tornado.ioloop.IOLoop.current()
    sock = robotlog.getUDPSocket()
    callback = functools.partial(robotlog.handleMsg, sock);
    ioLoop.add_handler(sock.fileno(), callback, ioLoop.READ)
    IOLoop.current().start()
