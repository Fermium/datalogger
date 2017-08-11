/*jshint esversion: 6*/
const path = require('path');
const appRoot = path.join(__dirname,'..','..');
require('electron-compile').init(path.join(appRoot,'app'),require.resolve('./smain'));