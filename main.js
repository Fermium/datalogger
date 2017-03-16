const electron = require('electron')
var {dialog} = require('electron');
var handler = require('./usb-handler');
const math = require('mathjs');
const dateFormat = require('dateformat'); //for date
const _ = require('lodash');
var fs = require('fs');
var path = require('path')
var http = require('https')
var home = require('os').homedir();

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron')
const PDFWindow = require('electron-pdf-window')
const jsyaml = require('js-yaml')
const config=jsyaml.safeLoad(fs.readFileSync('/home/s/Downloads/config.yaml'))
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let plotWindow = {};
let handbookWindow

global.session = {'_name':config.product.model,'_date':dateFormat(Date.now(), 'yyyy_mm_dd'),'_file':''}
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
  });

}
function createHandbookWindow(){
  var manual = config.manual
  handbookWindow = new PDFWindow({width: 800, height: 600})
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
        output+=chunk
      });
      res.on('end', function() {
              var obj = JSON.parse(output);
              assets = obj.assets;
              for(i in assets){
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

    handbookWindow = null
  });

}
function createPlotWindow (name) {
  plotWindow[name]= new BrowserWindow({width:800, height:600,title:name})
  plotWindow[name].loadURL(`file://${__dirname}/plot/index.html`)


  // Emitted when the window is closed.
  plotWindow[name].on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    plotWindow[name] = null
    delete plotWindow[name]
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function(){

  createWindow();
});

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
app.on('web-contents-created',function(ev,wc){
  wc.on('will-navigate',ev=>{
    console.log(ev);
    ev.preventDefault();
  })
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('plot',(event,arg) => {
  createPlotWindow(arg.name);
})
ipcMain.on('handbook',(event,arg) => {
  createHandbookWindow();
  handbookWindow.webContents.on('will-navigate',ev=>{
    console.log(ev);
    ev.preventDefault();
    handbookWindow.webContents.stop();
  })
})

ipcMain.on('start',(event,arg) => {
  fs.exists(session._file,function(exists){
    if(!exists){
    diag=dialog.showSaveDialog({ defaultPath : home+'/.datalogger/sessions/'+session._name+"_"+session._date,title: 'Experiment file save location'});
    session._file = diag+'.json';
    }
  mainWindow.webContents.send('started',{'return' : handler.start(mainWindow,session._file,session._name,session._date)});
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
  session._file=''; 
})

ipcMain.on('update',(event,arg)=>{

  for(name in plotWindow){
    plotWindow[name].webContents.send('update',{'val':arg.scope[name].value})
  }

})

ipcMain.on('isrunning',(event,arg)=>{
  event.returnValue = handler.isrunning();
})
ipcMain.on('ready',(event,arg)=>{
  event.returnValue={'config':config.config,'product':config.product};
})
