cinst -y nodejs-lts
refreshenv
node -v
cinst -y yarn --ignore-dependencies
npm install --global --production windows-build-tools
