# -*- mode: ruby -*-
# vi: set ft=ruby :

# install dependencies
unless Vagrant.has_plugin?('vagrant-s3auth')
  # Attempt to install ourself. Bail out on failure so we don't get stuck in an
  # infinite loop.
  system('vagrant plugin install vagrant-s3auth') || exit!

  # Relaunch Vagrant so the plugin is detected. Exit with the same status code.
  exit system('vagrant', *ARGV)
end


unless Vagrant.has_plugin?('vagrant-reload')
  # Attempt to install ourself. Bail out on failure so we don't get stuck in an
  # infinite loop.
  system('vagrant plugin install vagrant-reload') || exit!

  # Relaunch Vagrant so the plugin is detected. Exit with the same status code.
  exit system('vagrant', *ARGV)
end

########################################################################################################################################################################

Vagrant.configure(2) do |config|
  config.vm.define 'arch' do |arch|
    arch.vm.box = 'terrywang/archlinux'
    arch.vm.network 'private_network', type: 'dhcp'
    
    arch.vm.provider 'virtualbox' do |vb|
      vb.gui = false
      vb.name = 'datalogger-arch'
      vb.memory = '1024'
      # Avoid ubuntu network problems at boot
      vb.customize ['modifyvm', :id, '--cableconnected1', 'on']
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    ###############################################################
    arch.vm.provision 'shell', privileged: false, inline: <<-SHELL
      echo "WARNING! still can't build on arch!!!!"
      sudo pacman --noconfirm -Syu
      sudo pacman --noconfirm -S git python-pip nodejs npm yarn

      #Install icnsutils from source
      sudo pacman --noconfirm -S openjpeg jasper
      wget https://downloads.sourceforge.net/project/icns/libicns-0.8.1.tar.gz
      tar -zxvf libicns-0.8.1.tar.gz
      cd libicns-0.8.1/
      ./configure
      make
      sudo make install

      # link volume to home user folder
      ln -s /vagrant /home/vagrant/datalogger
    SHELL
  end
  
  ########################################################################################################################################################################

  config.vm.define 'ubuntu' do |ubuntu|

    ubuntu.vm.box = 'ubuntu/xenial64'
    ubuntu.vm.network 'private_network', type: 'dhcp'
    
    ubuntu.vm.provider 'virtualbox' do |vb|
      vb.gui = false
      vb.name = 'datalogger-ubuntu'
      vb.memory = '1024'
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    ubuntu.vm.provision 'shell', privileged: false, inline: <<-SHELL
       export DEBIAN_FRONTEND=noninteractive

       printf "\n\nInstalling software\n"

       sudo apt-get update
       sudo apt-get -y install wget python python-dev curl build-essential

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

       # link volume to home user folder
       ln -s /vagrant datalogger
     SHELL
  end
  
  ########################################################################################################################################################################
  
  config.vm.define 'ubuntu_desktop' do |ubuntu_desktop|
    ubuntu_desktop.vm.box = 'ubuntu/xenial64'
    ubuntu_desktop.vm.network 'private_network', type: 'dhcp'
    
    ubuntu_desktop.vm.provider 'virtualbox' do |vb|
      vb.gui = true
      vb.name = 'datalogger-ubuntu-desktops'
      vb.memory = '1024'
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    ubuntu_desktop.vm.provision 'shell', privileged: false, inline: <<-SHELL
       export DEBIAN_FRONTEND=noninteractive


       printf "\n\nInstalling software\n"

       sudo apt-get update
       sudo apt-get -y install wget python python-dev curl build-essential
       sudo apt-get -y install ubuntu-mate-cloudtop virtualbox-guest-x11

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
       ln -s /vagrant datalogger
     SHELL
  end
  
  
  ########################################################################################################################################################################
  
  config.vm.define 'windows' do |windows|
    
    # The following box is from a privte s3 bucket.
    # To use it you need to install this vagrant plugin: https://github.com/WhoopInc/vagrant-s3auth
    # You can build the box yourself following instructions from https://github.com/boxcutter/windows or https://github.com/fermiumlabs/boxcutter-windows
    # If you are a company access to the boxes can be given through the "requester pays" feature of AWS
    # If you're a nonprofit or an individual developing OSS, write to us at info (at) fermiumlabs (dot) com
    # This box is maintaned by Fermium LABS srl (https://fermiumlabs.com)
    
    windows.vm.box = 'eval-win2016-standard-ssh'
    windows.vm.box_url = 's3://fermiumlabs-vagrant-boxes/virtualbox/eval-win2016-standard-ssh-nocm-1.0.4.box'
    windows.vm.network 'private_network', type: 'dhcp'
    
    windows.vm.provider :parallels do |prl, _override|
      _override.vm.box_url = 's3://fermiumlabs-vagrant-boxes/parallels/eval-win2016-standard-ssh-nocm-1.0.4.box'
      prl.memory = 3072
      prl.cpus = 3
    end
    windows.vm.provider :vmware do |vmw, _override|
      _override.vm.box_url = 's3://fermiumlabs-vagrant-boxes/vmware/eval-win2016-standard-ssh-nocm-1.0.4.box'
    end
    
    # Let Vagrant know this is a windows box
    windows.vm.communicator = 'winrm'
    windows.vm.guest = :windows

    # Wait a bit more for windows to shutdown
    windows.windows.halt_timeout = 20

    # Personalize VirtuabBox VM for windows
    windows.vm.provider :virtualbox do |v, _override|
      v.gui = true
      v.customize ['modifyvm', :id, '--memory', 3072]
      v.customize ['modifyvm', :id, '--cpus', 3]
      v.customize ['modifyvm', :id, '--vram', '256']
      v.customize ['modifyvm', :id, '--clipboard', 'bidirectional']
      v.customize ['setextradata', 'global', 'GUI/MaxGuestResolution', 'any']
      v.customize ['setextradata', :id, 'CustomVideoMode1', '1024x768x32']
    end

    windows.vm.provision :shell, path: 'scripts/desktopShortcut.ps1'
    windows.vm.provision :shell, path: 'scripts/InstallChocolatey.ps1'
    windows.vm.provision :shell, path: 'scripts/install.ps1'
    windows.vm.provision :reload

  end
  
########################################################################################################################################################################
  config.vm.define 'fedora_desktop' do |fedora_desktop|
    fedora_desktop.vm.box = "jhcook/fedora26"

    fedora_desktop.vm.network 'private_network', type: 'dhcp'

    fedora_desktop.vm.provider 'virtualbox' do |vb|
      vb.gui = true
      vb.name = 'datalogger-fedora_desktop'
      vb.memory = '1024'
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    fedora_desktop.vm.provision 'shell', privileged: false, inline: <<-SHELL
       sudo yum -y update
       printf "\n\nInstalling software\n"

       # link volume to home user folder
       ln -s /vagrant datalogger
     SHELL
  end
end
