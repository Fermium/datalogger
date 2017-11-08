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

      vb.memory = '2048'
      vb.memory = '1024'
      # Avoid ubuntu network problems at boot
      vb.customize ['modifyvm', :id, '--cableconnected1', 'on']
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    arch.vm.provision :shell, path: 'scripts/provision_arch.sh'

  end

  ########################################################################################################################################################################

  config.vm.define 'ubuntu' do |ubuntu|

    ubuntu.vm.box = 'bento/ubuntu-16.04'
    ubuntu.vm.network 'private_network', type: 'dhcp'

    ubuntu.vm.provider 'virtualbox' do |vb|
      vb.gui = false
      vb.name = 'datalogger-ubuntu'
      vb.memory = '2048'
      # Limit CPU usage
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
    end

    ubuntu.vm.provision :shell, path: 'scripts/provision_ubuntu.sh'
  end

  ########################################################################################################################################################################

  config.vm.define 'ubuntu_desktop' do |ubuntu_desktop|
    ubuntu_desktop.vm.box = 'bento/ubuntu-16.04'

    ubuntu_desktop.vm.network 'private_network', type: 'dhcp'

    ubuntu_desktop.vm.provider 'virtualbox' do |vb|
      vb.gui = true
      vb.name = 'datalogger-ubuntu-desktops'
      vb.memory = '2048'

      # Limit CPU usage
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
      vb.customize ["modifyvm", :id, "--accelerate3d", "on"]
    end

    ubuntu_desktop.vm.provision :shell, path: 'scripts/provision_ubuntu.sh'
    ubuntu_desktop.vm.provision :shell, path: 'scripts/provision_ubuntu_desktop.sh'
    ubuntu_desktop.vm.provision :reload

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
      v.customize ['setextradata', :id, 'CustomVideoMode1', '2048x768x32']
      #v.customize ["modifyvm", :id, "--accelerate3d", "on"]
    end

    windows.vm.provision :shell, path: 'scripts/provision_windows.ps1'
    windows.vm.provision :reload

  end

########################################################################################################################################################################
  config.vm.define 'fedora_desktop' do |fedora_desktop|
    fedora_desktop.vm.box = "jhcook/fedora26"

    fedora_desktop.vm.network 'private_network', type: 'dhcp'

    fedora_desktop.vm.provider 'virtualbox' do |vb|
      vb.gui = true
      vb.name = 'datalogger-fedora_desktop'
      vb.memory = '2048'
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
      vb.customize ["modifyvm", :id, "--accelerate3d", "on"]
    end

    fedora_desktop.vm.provision :shell, path: 'scripts/provision_fedora_desktop.sh'

  end

  ########################################################################################################################################################################

  config.vm.define 'centos_desktop' do |centos_desktop|

    centos_desktop.vm.box = "boxcutter/centos73-desktop"
    centos_desktop.vm.network 'private_network', type: 'dhcp'
    centos_desktop.vm.provider 'virtualbox' do |vb|
      vb.gui = true
      vb.name = 'datalogger-centos_desktop'
      vb.memory = '2048'
      # Limit CPU usage
      vb.customize ['modifyvm', :id, '--cpuexecutioncap', '65']
      vb.customize ["modifyvm", :id, "--accelerate3d", "on"]
    end

    centos_desktop.vm.provision :shell, path: 'scripts/provision_centos_desktop.sh'
  end

end
