/*jshint esversion: 6*/
import { isDev, log } from "./util";

import * as electron from 'electron';
import {dialog} from 'electron';
import {ipcMain} from 'electron';

import {fork} from 'child_process';
import * as math from 'mathjs';
import * as dateFormat from 'dateformat';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'https';
import * as PDFWindow from 'electron-pdf-window';
import * as jsyaml from 'js-yaml';

import AppUpdater from "./updater"
import * as  Raven from 'raven';

let usb;
var _ = require('lodash');
let logger;
let usb_on : boolean =false;
let corr  = {a:0,b:0};

if(!isDev()){
  try{
    Raven.config('https://d62ce425b8f346439bf694c9f36eae45:84b649383e3843d49d1e56561cff98b1@sentry.io/208461',{
      release: electron.app.getVersion()
    }).install();
  }
  catch(err){
    log('Error connecting to sentry');
  }
}


let dbfile;
// Module to control application life.
const app = electron.app;
const Menu = electron.Menu;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
let config;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let plotWindow = {};
let handbookWindow;

const glob : any = global;
glob.session = {'_name':'','_date':dateFormat(Date.now(), 'yyyy_mm_dd')};
function createWindow () {


  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/main/index.html`);
  mainWindow.on('ready-to-show',()=>{
    mainWindow.show();
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    if(logger !== undefined && logger !== null) logger.kill();
    if(usb    !== undefined && usb    !== null) usb.kill();
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

function createSelectDevice () {
  // Create the browser window.
  // and load the index.html of the app.

  mainWindow.loadURL(`file://${__dirname}/selectdevice/index.html`);
  mainWindow.on('ready-to-show',()=>{
    mainWindow.show();


  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

}

//this shit is long, we could move it somewhere else ?
function createHandbookWindow(){
  var manual = config.manual;
  handbookWindow = new PDFWindow({width: 800, height: 600,show:false});
  handbookWindow.on('ready-to-show',()=>{
    handbookWindow.show();
  });
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
  plotWindow[name]= new BrowserWindow({
    width:800,
    height:600,
    title:name,
    show:false,
    minWidth: 800,
    minHeight: 600
  });
  plotWindow[name].loadURL(`file://${__dirname}/plot/index.html`);

  plotWindow[name].on('ready-to-show',()=>{
    plotWindow[name].show();
  })
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
  mainWindow =  new BrowserWindow({
    width: 850,
    height: 950,
    show:false,
    backgroundColor:'#f5f5f5',
    minWidth: 800,
    minHeight: 600
  });
  createSelectDevice();
  new AppUpdater()
});

// Quit when all windows are closed.

app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  //if (process.platform !== 'darwin') {
    app.quit();
  //}
});

/*
app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

    if (mainWindow === null) {
    createWindow();
  }

});
*/
app.on('web-contents-created',function(ev,wc){
  wc.on('will-navigate',ev=>{
    ev.preventDefault();
  });
});

ipcMain.on('plot',(event,arg) => {
  createPlotWindow(arg.name);
});

ipcMain.on('relaunch',(event,arg) => {
  createSelectDevice();
});

ipcMain.on('handbook',(event,arg) => {
  createHandbookWindow();

  handbookWindow.webContents.on('will-navigate',ev=>{
    ev.preventDefault();
    handbookWindow.webContents.stop();
  });
});

ipcMain.on('save-file',(event,arg)=>{
  logger = fork(path.normalize(path.join(__dirname,'processes','logger.js')));
    logger.on('message',(data)=>{
    switch(data.action){
      case 'createdb':
        mainWindow.webContents.send('rec',  {'rec':data.message.state});
        dbfile = data.message.file;
        break;
    }
  });
  if(logger!==undefined && logger !== null) logger.send({
    action:'createdb',
    message:{
      path: arg.path,
      name:glob.session._name,
      date:glob.session._date,
      model:config.product.model,
      manufacturer:config.product.manufacturercode
    }
  });
});

ipcMain.on('start',(event,arg) => {
if(logger!==undefined && logger !== null) logger.send({action:'start'});
mainWindow.webContents.send('started',  {'return':'a'});
});

ipcMain.on('stop',(event,arg) => {
  if(logger!==undefined && logger !== null) logger.send({action:'stop'});
});


ipcMain.on('on',(event,arg) => {

  usb = fork(path.normalize(path.join(__dirname,'devices',config.product.manufacturercode,config.product.model,'src','usb.js')),[],{
    env: {},
    stdio: ["ipc","inherit", "inherit", "inherit"]
  });

  usb.on('message',(data)=>{
    switch(data.action){
      case 'error':
        mainWindow.webContents.send('usb-error', {});
        //report to sentry
        console.log("Error in USB:", data.message);
        if(!isDev()){
        Raven.captureException(data.payload)
       }
       else{
         console.log(data.message);
       }

        break;
      case 'usb-init':
        mainWindow.webContents.send('init', {});
        break;
      case 'mes':
        if(logger!==undefined && logger!==null)logger.send({action:'write',message:data.message});
        mainWindow.webContents.send('measure',  {'scope':data.message});
        break;
      case 'on':
        mainWindow.webContents.send('on',  {'st':data.message});
        usb_on=data.message;

        break;
    }
  });

usb.on('exit',(code,n)=>{
  mainWindow.webContents.send('usb-error', {});
  console.log('usb exited with exit code', code);
});

 usb.on('disconnect',(code,n)=>{
  mainWindow.webContents.send('usb-error', {});
  console.log('usb disconnected with exit code', code);
});

  usb.send({
    action:'on',
    message:
      {
        vid:config.product.usb.vid,
        pid:config.product.usb.pid
      }
    });
});


ipcMain.on('off',(event,arg) => {
  if(usb_on){
  usb.send({action:'off',message:''});
  if(logger!==undefined && logger !== null) logger.send({action:'close'});
  }
});

ipcMain.on('update',(event,arg)=>{
  for(var name in plotWindow){
    plotWindow[name].webContents.send('update',{'val':arg.scope[name]});
  }
});

ipcMain.on('isrunning',(event,arg)=>{
  usb.send({action:'is_on',message:''});
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
  glob.session._name=config.product.model;
  createWindow();
});

ipcMain.on('export',(event,args)=>{
    args.to_export=['Vh','temp','Vr','I','R','B'];
    args.file=dbfile.source;
    var exprt=fork(path.normalize(path.join(__dirname,'processes','exports.js')),[JSON.stringify(args)],{env: {'ATOM_SHELL_INTERNAL_RUN_AS_NODE':'0'},stdio: ['ipc', 'inherit', 'inherit','inherit']});
    exprt.on('message',(data)=>{
      switch (data.action) {
        case 'end':
          mainWindow.webContents.send('exported',{path:data.message});
          exprt.kill();
          break;
        case 'error':
          mainWindow.webContents.send('scidavis-error');
          exprt.kill();
      }
    });
});
