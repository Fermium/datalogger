/*jshint esversion: 6*/
const electron = require('electron');
var {dialog} = require('electron');
const {fork} = require('child_process');
var usb;
const math = require('mathjs');
const dateFormat = require('dateformat'); //for date
const _ = require('lodash');
var fs = require('fs');
var path = require('path');
var http = require('https');
var logger;
var usb_on=false;
var corr = {a:0,b:0};
/*const Raven = require('raven');
try{
  Raven.config('https://04a037c659c741938d91beb75df2f653:9c23348a48934d40a2d909b05c342139@sentry.dev.fermiumlabs.com/2').install();
}
catch(err){
  console.log('Error connecting to sentry');
}*/
var dbfile;
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const {ipcMain} = require('electron');
const PDFWindow = require('electron-pdf-window');
const jsyaml = require('js-yaml');
var config;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let plotWindow = {};
let handbookWindow;
let selectDeviceWindow;
global.session = {'_name':'','_date':dateFormat(Date.now(), 'yyyy_mm_dd')};
function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 850, height: 950});

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/main/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    logger.kill();
    usb.kill();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function createSelectDevice () {
  // Create the browser window.
  selectDeviceWindow = new BrowserWindow({width: 850, height: 950});

  // and load the index.html of the app.
  selectDeviceWindow.loadURL(`file://${__dirname}/selectdevice/index.html`);


  // Emitted when the window is closed.
  selectDeviceWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    selectDeviceWindow = null;
  });

}
function createHandbookWindow(){
  var manual = config.manual;
  handbookWindow = new PDFWindow({width: 800, height: 600});
  if(_.has(manual,'git')){
    var options = {
        host: 'api.github.com',
        port: 443,
        path: '/repos/'+manual.git.user+'/'+manual.git.repo+'/releases/'+manual.git.tag,
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
        output+=chunk;
      });
      res.on('end', function() {
              var obj = JSON.parse(output);
              var assets = obj.assets;
              for(var i in assets){
                if(assets[i].name==manual.git.filename){
                  latest = assets[i].browser_download_url;
                  handbookWindow.loadURL(latest);
                }
              }
          });
    });
    req.end();
  }
  else{
    if(_.has(manual,'url')){
      handbookWindow.loadURL(manual.url);
    }
    else{
      dialog.showMessageBox({message:'Handbook not available'});
      handbookWindow=null;
    }
  }

  // and load the index.html of the app.



  // Emitted when the window is closed.
  handbookWindow.on('closed', function () {

    handbookWindow = null;
  });

}
function createPlotWindow (name) {
  plotWindow[name]= new BrowserWindow({width:800, height:600,title:name});
  plotWindow[name].loadURL(`file://${__dirname}/plot/index.html`);


  // Emitted when the window is closed.
  plotWindow[name].on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    plotWindow[name] = null;
    delete plotWindow[name];
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){
  console.log(process.argv[0]);
  usb = fork(/*"/home/s/Desktop/datalogger/node_modules/electron/dist/electron",*/ path.normalize(path.join(__dirname,'processes','usb.js')), {    // see issue 1613 in electron regarding child process spawning
    // env: process.env,
    //stdio: ["ipc","inherit", "inherit", "inherit"]


  }
  );
  logger = fork(/*"/home/s/Desktop/datalogger/node_modules/electron/dist/electron",[*/path.normalize(path.join(__dirname,'processes','logger.js')), {
    //env: process.evn
  }
  );
  usb.on('message',(data)=>{
    switch(data.action){
      case 'usb-fail':
        mainWindow.webContents.send('usb-fail', {});
        break;
      case 'init':
        mainWindow.webContents.send('init', {});
        break;
      case 'mes':
        logger.send({action:'write',message:data.message});
        mainWindow.webContents.send('measure',  {'scope':data.message});
        break;
      case 'on':
        mainWindow.webContents.send('on',  {'st':data.message});
        usb_on=data.message;
        break;
    }
  });
usb.on('exit',(code,n)=>{
  console.log('usb exited with code '+code);
});
  logger.on('message',(data)=>{
    switch(data.action){
      case 'createdb':
        mainWindow.webContents.send('rec',  {'rec':data.message.state});
        dbfile = data.message.file;
        break;
    }
  });
  createSelectDevice();
});

// Quit when all windows are closed.

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
app.on('web-contents-created',function(ev,wc){
  wc.on('will-navigate',ev=>{
    ev.preventDefault();
  });
});
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('plot',(event,arg) => {
  createPlotWindow(arg.name);
});
ipcMain.on('handbook',(event,arg) => {
  createHandbookWindow();

  handbookWindow.webContents.on('will-navigate',ev=>{
    ev.preventDefault();
    handbookWindow.webContents.stop();
  });
});

ipcMain.on('save-file',(event,arg)=>{

  logger.send({
    action:'createdb',
    message:{
      path: arg.path,
      name:session._name,
      date:session._date,
      model:config.product.model,
      manufacturer:config.product.manufacturercode
    }
  });
});

ipcMain.on('start',(event,arg) => {
logger.send({action:'start'});
mainWindow.webContents.send('started',  {'return':'a'});
});

ipcMain.on('stop',(event,arg) => {
  logger.send({action:'stop'});
});
ipcMain.on('on',(event,arg) => {
  usb.send({
    action:'on',
    message:
      {
        a:config.config.calibration.a,
        b:config.config.calibration.b,
        vid:config.product.usb.vid,
        pid:config.product.usb.pid
      }
    });
});
ipcMain.on('off',(event,arg) => {
  if(usb_on){
  usb.send({action:'off',message:''});
    logger.send({action:'close'});
  }
});
ipcMain.on('update',(event,arg)=>{
  for(var name in plotWindow){
    plotWindow[name].webContents.send('update',{'val':arg.scope[name]});
  }
});
ipcMain.on('isrunning',(event,arg)=>{
  usb.send({action:'ison',message:''});
});
ipcMain.on('send-to-hardware',(event,arg)=>{
  if(usb_on){
    usb.send({action:'send_command',message:arg});
  }
});
ipcMain.on('ready',(event,arg)=>{
  event.returnValue={'config':config.config,'product':config.product};
});
ipcMain.on('get-device',(event,arg)=>{
  event.returnValue=path.normalize(path.join('.','devices',config.product.manufacturercode,config.product.model));
});
ipcMain.on('device-select',(event,arg)=>{
  config=jsyaml.safeLoad(fs.readFileSync(path.normalize(path.join(arg.device,'config.yaml'))));
  session._name=config.product.model;
  createWindow();
});
ipcMain.on('export',(event,args)=>{
    args.to_export=['Vh','temp','Vr','I','R','B'];
    args.file=dbfile;
    var exprt=fork(path.normalize(path.join(__dirname,'processes','exports.js')),[JSON.stringify(args)],{env: {'ATOM_SHELL_INTERNAL_RUN_AS_NODE':'0'},stdio: ['ipc', 'inherit', 'inherit','inherit']});
    exprt.on('message',(data)=>{
      switch (data.action) {
        case 'end':
          exprt.kill();
          break;
      }
    });
});
