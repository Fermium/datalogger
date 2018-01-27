# datalogger

[![Build Status](https://travis-ci.com/ddavidebor/datalogger.svg?token=wpMBDd4yw5jYZj2bMMU7&branch=v1.1.1)](https://travis-ci.com/ddavidebor/datalogger)


Datlogger (name needed!) is an application to control and acquire data from scientific instruments.

## Toggling DevTools

Toggle DevTools.

- macOS: <kbd>Cmd</kbd> <kbd>Alt</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> or <kbd>F12</kbd>

### Reload

Force reload the window.

- macOS: <kbd>Cmd</kbd> <kbd>R</kbd> or <kbd>F5</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>R</kbd> or <kbd>F5</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>R</kbd> or <kbd>F5</kbd>

### Element Inspector

Open DevTools and focus the Element Inspector tool.

- macOS: <kbd>Cmd</kbd> <kbd>Shift</kbd> <kbd>C</kbd>
- Linux: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>C</kbd>
- Windows: <kbd>Ctrl</kbd> <kbd>Shift</kbd> <kbd>C</kbd>

# developing

This application is designed to run on node 6. Please use [nvm](https://github.com/creationix/nvm) to install node 6 and use it:

* nvm install 6
* nmv use 6
* nmv alias default 6

Please use included Vagrant images:
* ubuntu 
* ubuntu_desktop
* windows
* arch (still not working, misses a few dependencies to build)
* fedora (test only)

If you want to develop without the vagrant images, install the required dependencies described [here](https://github.com/nodejs/node-gyp)

You will need to have a working [node-gyp](https://github.com/nodejs/node-gyp) since this app uses many native extensions

logs can be found following this [instructions](https://www.npmjs.com/package/electron-log)

## macOS

If you're developing on macOS, run `yarn patchlibusb` after install, otherwise data-chan will not find libusb, since they're linked together for production and not for development

## Windows

If you're developing on macOS, run `yarn patchlibpthread` after install, otherwise data-chan will not find libwinpthread-1, since it's not included inside windows by default.

Developing on Windows is messy. As long as you get node-gyp to work correctly (following ALL steps), you'll be fine.

Common errors we had in the past:

* "%1 is not a win32 application" you've built the app using wine and mono. You need to use a native Windows environment.
* "Win32 [...] error 126" You're missing pthread, check data-chan docs or run `yarn patchlibpthread`
* MSBUILD> error MSB4132> The tools version "2.0" is unrecognizes. run `npm config set msvs_version 2015`


# Dev builds:

This software is automatically built by: 

* Travis CI: Linux and macOS
* Appveyor: Windows


Dev builds go to s3://fermiumlabs-software-builds/nng-logger/{{COMMIT HASH}}
Dist builds go to s3://fermiumlabs-software/nng-logger/


# Contributing

Please open pull requests against develop, not master.

# OS status

## macOS

With the latest fixes should work like a charm. Still some work to do on scidavis, but fixes are on their way.

## Linux

### Centos, Fedora, etc etc

USB permission fixed

### Ubuntu, Debian

The USB permissions now works like a charm

### Windows

Should work like a charm. Ok, Windows suck. 
