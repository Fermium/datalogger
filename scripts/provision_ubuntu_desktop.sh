#!/bin/bash
# provision_ubuntu.sh is already included before this file

export DEBIAN_FRONTEND=noninteractive

# link volume to home user folder
ln -s /vagrant /home/vagrant/Desktop/datalogger

sudo apt-get install -y ubuntu-desktop
sudo apt-get install -y virtualbox-guest-x11
