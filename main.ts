const path = require('path')

import * as electron from "electron"; //import all the electron stuff for typescript
// Module to control application life.
const app = electron.app
// Module to create native browser window.
var BrowserWindow = electron.BrowserWindow

// Module to create pdf renderer windows
const PDFWindow = require('electron-pdf-window')
var http = require('https') //required to do requests

// filesystem apis
var fs = require('fs');

// electron imports
var {ipcMain} = require('electron') //IPC comunication
var {dialog} = require('electron');  //system diaglogs

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let plotWindow
let handbookWindow

//other stuff
var dateFormat = require('dateformat'); //for date
var math = require('mathjs');

//custom software
var handler = require('./usb-handler');


mainWindow.config = { '_experiment': '', '_date': dateFormat(Date.now(), 'yyyy_mm_dd'), '_file': '' }
/*global.scope =  { 'k' : 0 };*/
mainWindow.formula = {};

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 850, height: 950 })

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`)


    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        if (handler.isrunning()) {
            handler.stop();
        }
        if (handler.ison()) {
            handler.off();
        }
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}
function createHandbookWindow() {
    handbookWindow = new PDFWindow({ width: 800, height: 600 })
    var options = {
        host: 'api.github.com',
        port: 443,
        path: '/repos/fermiumlabs/hall-effect-handbook/releases/latest',
        method: 'GET',
        headers: {
            'user-agent': 'fermiumlabs-datalogger'
        }
    };

    var latest;
    var req = http.request(options, function(res) {
        var output = '';
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            output += chunk
        });
        res.on('end', function() {
            var obj = JSON.parse(output);
            var assets = obj.assets;
            var i;
            for (i in assets) {
                if (assets[i].name == 'Hall_Handbook.pdf') {
                    latest = assets[i].browser_download_url;
                    handbookWindow.loadURL(latest);
                }
            }
        });
    });
    req.end();
    // and load the index.html of the app.
    // Emitted when the window is closed.
    handbookWindow.on('closed', function() {

        handbookWindow = null
    })
}
function createPlotWindow() {
    plotWindow = new BrowserWindow({ width: 800, height: 600 })
    plotWindow.loadURL(`file://${__dirname}/plot/index.html`)


    // Emitted when the window is closed.
    plotWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.

        plotWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.

app.on('window-all-closed', function() {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        /*if(handler.isrunning()){
        }*/
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('plot', (event, arg) => {
    createPlotWindow()
})
ipcMain.on('handbook', (event, arg) => {
    createHandbookWindow()
})

ipcMain.on('start', (event, arg) => {
    fs.exists(config._file, function(exists) {
        if (!exists) {
            var diag = dialog.showSaveDialog({ defaultPath: './data/' + mainWindow.config._experiment + "_" + mainWindow.config._date, title: 'Experiment file save location' });
            config._file = diag + '.json';
        }
        mainWindow.webContents.send('started', { 'return': handler.start(mainWindow, mainWindow.config._file, mainWindow.config._experiment, mainWindow.config._date) });
    });
})
ipcMain.on('stop', (event, arg) => {
    handler.stop();
})
ipcMain.on('on', (event, arg) => {
    handler.on();
})
ipcMain.on('off', (event, arg) => {
    handler.off();
    config._file = '';
})

ipcMain.on('update', (event, arg) => {
    if (plotWindow) {
        plotWindow.webContents.send('update', { 'scope': arg.scope })
    }
})

ipcMain.on('isrunning', (event, arg) => {
    event.returnValue = handler.isrunning();
})
