# datalogger

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
* arch (still not working)
* fedora (test only)

If you want to develop without the vagrant images, install the required dependencies described [here](https://github.com/nodejs/node-gyp)

You will need to have a working [node-gyp](https://github.com/nodejs/node-gyp) since this app uses many native extensions

## macOS

If you're developing on macOS, run `yarn patchlibusb` after install, otherwise data-chan will not find libusb, since they're linked together for production and not for development

## Windows

Developing on Windows is messy. As long as you get node-gyp to work correctly, you'll be fine

# Contributing

Please open pull requests against develop, not master. 

# OS status

## macOS

With the latest fixes should work like a charm. Still work to do on scidavis

## Linux

### Ubuntu

We build everything on ubuntu on travis so it should work quite well. Some script should be provided for usb permission.

### Centos, fedora, etc etc

There seems to be issues with finding libusb, needs to be checked.

## Windows

Still needs the dll
