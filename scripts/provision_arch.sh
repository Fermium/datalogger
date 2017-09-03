#!/bin/bash
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

#Install NVM (Node Version Manager)
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

#Install NodeJS 6
nvm install 6
nvm use 6
nvm alias default 6

# link volume to home user folder
ln -s /vagrant /home/vagrant/datalogger
