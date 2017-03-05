const electron = require('electron')
var {dialog} = require('electron');
var handler = require('./usb-handler');
const math = require('mathjs');
const dateFormat = require('dateformat'); //for date
var fs = require('fs');
var path = require('path')
var http = require('https')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron')
const PDFWindow = require('electron-pdf-window')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let plotWindow
let handbookWindow

global.config = {'_experiment':'','_date':dateFormat(Date.now(), 'yyyy_mm_dd'),'_file':''}
/*global.scope =  { 'k' : 0 };*/
global.formula = {};
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 850, height: 950})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    if(handler.isrunning()){
      handler.stop();
    }
    if(handler.ison()){
      handler.off();
    }
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}
function createHandbookWindow(){
  handbookWindow = new PDFWindow({width: 800, height: 600})
  var options = {
      host: 'api.github.com',
      port: 443,
      path: '/repos/fermiumlabs/hall-effect-handbook/releases/latest',
      method: 'GET',
      headers : {
        'user-agent' : 'fermiumlabs-datalogger'
      }
  };

  var latest;
  var req = http.request(options, function(res)
  {
    var output='';
    res.setEncoding('utf8');
    res.on('data',function(chunk){
      output+=chunk
    });
    res.on('end', function() {
            var obj = JSON.parse(output);
            assets = obj.assets;
            for(i in assets){
              if(assets[i].name=='Hall_Handbook.pdf'){
                latest = assets[i].browser_download_url;
                handbookWindow.loadURL(latest);
              }
            }
        });
  });
  req.end();
  // and load the index.html of the app.



  // Emitted when the window is closed.
  handbookWindow.on('closed', function () {

    handbookWindow = null
  })
}
function createPlotWindow () {
  plotWindow= new BrowserWindow({width:800, height:600})
  plotWindow.loadURL(`file://${__dirname}/plot/index.html`)


  // Emitted when the window is closed.
  plotWindow.on('closed', function () {
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

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    /*if(handler.isrunning()){

    }*/
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('plot',(event,arg) => {
  createPlotWindow()
})
ipcMain.on('handbook',(event,arg) => {
  createHandbookWindow()
})

ipcMain.on('start',(event,arg) => {
  fs.exists(config._file,function(exists){
    if(!exists){
    diag=dialog.showSaveDialog({ defaultPath : './data/'+config._experiment+"_"+config._date,title: 'Experiment file save location'});
    config._file = diag+'.json';
    }
  mainWindow.webContents.send('started',{'return' : handler.start(mainWindow,config._file,config._experiment,config._date)});
  });
})
ipcMain.on('stop',(event,arg) => {
  handler.stop();
})
ipcMain.on('on',(event,arg) => {
  handler.on();
})
ipcMain.on('off',(event,arg) => {
  handler.off();
  config._file='';
})

ipcMain.on('update',(event,arg)=>{
  if(plotWindow){
    plotWindow.webContents.send('update',{'scope':arg.scope})
  }
})

ipcMain.on('isrunning',(event,arg)=>{
  event.returnValue = handler.isrunning();
})
