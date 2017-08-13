# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.define 'arch' do |arch|
    # Every Vagrant development environment requires a box. You can search for
    # boxes at https://atlas.hashicorp.com/search.
    arch.vm.box = 'terrywang/archlinux'

    # Create a public network, which generally matched to bridged network.
    # Bridged networks make the machine appear as another physical device on
    # your network.
    arch.vm.network 'private_network', type: 'dhcp'

    # Provider-specific configuration so you can fine-tune various
    # backing providers for Vagrant. These expose provider-specific options.
    arch.vm.provider 'virtualbox' do |vb|
      # Display the VirtualBox GUI when booting the machine
      vb.gui = false

      vb.name = 'datalogger-arch'
      # Customize the amount of memory on the VM:
      vb.memory = '1024'

      # Avoid ubuntu network problems at boot
      vb.customize ['modifyvm', :id, '--cableconnected1', 'on']

      # Limit CPU usage
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

      echo "WARNING! still can't build on arch!!!!"
    SHELL
  end

  config.vm.define 'ubuntu' do |ubuntu|
    # Every Vagrant development environment requires a box. You can search for
    # boxes at https://atlas.hashicorp.com/search.
    ubuntu.vm.box = 'ubuntu/xenial64'

    # Create a public network, which generally matched to bridged network.
    # Bridged networks make the machine appear as another physical device on
    # your network.
    ubuntu.vm.network 'private_network', type: 'dhcp'

    # Provider-specific configuration so you can fine-tune various
    # backing providers for Vagrant. These expose provider-specific options.
    ubuntu.vm.provider 'virtualbox' do |vb|
      # Display the VirtualBox GUI when booting the machine
      vb.gui = false

      vb.name = 'datalogger-ubuntu'
      # Customize the amount of memory on the VM:
      vb.memory = '1024'

      # Limit CPU usage
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    ## Enable USB Controller on VirtualBox
    # ubuntu.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['modifyvm', :id, '--usb', 'on']
    #  vb.customize ['modifyvm', :id, '--usbehci', 'on']
    # end

    ## Implement determined configuration attributes
    # ubuntu.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['usbfilter', 'add', '0',
    #                '--target', :id,
    #                '--name', 'datachan tester',
    #                '--product', 'datachan tester']
    # end

    # ubuntu.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['usbfilter', 'add', '0',
    #                '--target', :id,
    #                '--name', 'USBasp',
    #                '--product', 'USBasp']
    # end

    ###############################################################
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


       printf "\n\n\n\nThe box is ready. Now simply run \"vagrant ssh\" to connect! \n"

     SHELL
  end
  config.vm.define 'ubuntu_desktop' do |ubuntu_desktop|
    # Every Vagrant development environment requires a box. You can search for
    # boxes at https://atlas.hashicorp.com/search.
    ubuntu_desktop.vm.box = 'ubuntu/xenial64'

    # Create a public network, which generally matched to bridged network.
    # Bridged networks make the machine appear as another physical device on
    # your network.
    ubuntu_desktop.vm.network 'private_network', type: 'dhcp'

    # Provider-specific configuration so you can fine-tune various
    # backing providers for Vagrant. These expose provider-specific options.
    ubuntu_desktop.vm.provider 'virtualbox' do |vb|
      # Display the VirtualBox GUI when booting the machine
      vb.gui = true

      vb.name = 'datalogger-ubuntu-desktops'
      # Customize the amount of memory on the VM:
      vb.memory = '1024'

      # Limit CPU usage
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    ## Enable USB Controller on VirtualBox
    # ubuntu.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['modifyvm', :id, '--usb', 'on']
    #  vb.customize ['modifyvm', :id, '--usbehci', 'on']
    # end

    ## Implement determined configuration attributes
    # ubuntu.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['usbfilter', 'add', '0',
    #                '--target', :id,
    #                '--name', 'datachan tester',
    #                '--product', 'datachan tester']
    # end

    # ubuntu.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['usbfilter', 'add', '0',
    #                '--target', :id,
    #                '--name', 'USBasp',
    #                '--product', 'USBasp']
    # end

    ###############################################################
    ubuntu_desktop.vm.provision 'shell', privileged: false, inline: <<-SHELL
       export DEBIAN_FRONTEND=noninteractive
       

       printf "\n\nInstalling software\n"

       sudo apt-get update 
       sudo apt-get -y install wget python python-dev curl build-essential 
       sudo apt-get -y install mate-desktop-environment

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


       printf "\n\n\n\nThe box is ready. Now simply run \"vagrant ssh\" to connect! \n"

     SHELL
  end
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
        
    # Let Vagrant know this is a windows box
    windows.vm.communicator = 'winrm'
    windows.vm.guest = :windows
    
    # Wait a bit more for windows to shutdown
    windows.windows.halt_timeout = 20

    # Personalize VirtuabBox VM for windows
    windows.vm.provider :virtualbox do |v, _override|
      v.gui = true
      v.customize ['modifyvm', :id, '--memory', 2048]
      v.customize ['modifyvm', :id, '--cpus', 2]
      v.customize ['modifyvm', :id, '--vram', '256']
      v.customize ['modifyvm', :id, '--clipboard', 'bidirectional']  
      v.customize ['setextradata', 'global', 'GUI/MaxGuestResolution', 'any']
      v.customize ['setextradata', :id, 'CustomVideoMode1', '1024x768x32']
      
    end

    ## Enable USB Controller on VirtualBox
    # windows.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['modifyvm', :id, '--usb', 'on']
    #  vb.customize ['modifyvm', :id, '--usbehci', 'on']
    # end

    ## Implement determined configuration attributes
    # windows.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['usbfilter', 'add', '0',
    #                '--target', :id,
    #                '--name', 'datachan tester',
    #                '--product', 'datachan tester']
    # end

    # windows.vm.provider 'virtualbox' do |vb|
    #  vb.customize ['usbfilter', 'add', '0',
    #                '--target', :id,
    #                '--name', 'USBasp',
    #                '--product', 'USBasp']
    # end
    ###############################################################
    windows.vm.provision :shell, path: "scripts/desktopShortcut.ps1"   
    windows.vm.provision :shell, path: "scripts/InstallChocolatey.ps1"
    windows.vm.provision :shell, path: "scripts/install.ps1"
    windows.vm.provision :shell, path: "scripts/windows-build-toolssl.ps1"
  end
end
