#!/bin/bash
export DEBIAN_FRONTEND=noninteractive

printf "\n\nInstalling software\n"

sudo apt-get update
sudo apt-get -y install wget python python-dev curl build-essential
#sudo apt-get -y install ubuntu-mate-cloudtop virtualbox-guest-x11

# Electron Builder requirements https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build
sudo apt-get -y install icnsutils rpm graphicsmagick xz-utils

# Wine
sudo add-apt-repository ppa:ubuntu-wine/ppa -y
sudo apt-get update
sudo apt-get install --no-install-recommends -y wine1.8

# Mono
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
echo "deb http://download.mono-project.com/repo/debian wheezy main" | sudo tee /etc/apt/sources.list.d/mono-xamarin.list
sudo apt-get update
sudo apt-get install --no-install-recommends -y mono-devel ca-certificates-mono

# Build 32 bit app from 64 bit image
sudo apt-get install --no-install-recommends -y gcc-multilib g++-multilib

# NodeJS
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

# Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

#Enable autologin
sudo /bin/sh -c "echo autologin-user=ubuntu >> /usr/share/lightdm/lightdm.conf.d/60-lightdm-gtk-greeter.conf"

# link volume to home user folder
ln -s /vagrant /home/vagrant/Desktop/datalogger
