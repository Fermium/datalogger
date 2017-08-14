/*jshint esversion: 6*/
const path = require('path');
const appRoot = path.join(__dirname,'..');

require('electron-compile').init(appRoot, path.join(__dirname,'/main'));
