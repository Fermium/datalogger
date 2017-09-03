cinst -y nodejs-lts
refreshenv
node -v
cinst -y yarn --ignore-dependencies
#cinst -y python2
#cinst -y visualstudioexpress2013windowsdesktop
#cint -y microsoft-build-tools-2013
#cinst -y visualstudiocode
#choco install vcbuildtools -y
npm install -g --production windows-build-tools
refreshenv
