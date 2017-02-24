const electron = require('electron')
const dateFormat = require('dateformat'); //for date
const math = require('mathjs');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let plotWindow
/*global.measure = {
  0 : {
    'name': 'meter',
    'symbol' : 'm'
  },
  1 : 'ampere',
  2 : 'volt',
  3 : 'coulomb',
  4 : 'watt',
  5 : 'kilogram',
  6 : 'kelvin',
  7 : 'candela',
  8 : 'mole',
  9 : 'hertz',
  10 : 'radian',
  11 : 'steradian',
  12 : 'newton',
  13 : 'pascal',
  14 : 'joule',
  15 : 'farad',
  16 : 'ohm',
  17 : 'siemens',
  18 : 'weber',
  19 : 'tesla',
  20 : 'henry',
  21 : 'lumen',
  22 : 'lux',
  23 : 'becquerel',
  24 : 'gray',
  25 : 'sievert',
  26 : 'katal'
}*/
global.config = {'_file': '','_experiment':'','_date':dateFormat(Date.now(), 'yyyy_mm_dd'),'_gain':{'vh': 1 ,'vr': 1 , 'a' : 1, 'g' : 1},'_db_exists':false}
global.scope =  {
  'k':0
};
global.formula = {};
global.source = [
  {label:'ch1',values:[{time:0,y:0}]},
  {label:'ch2',values:[{time:0,y:0}]},
  {label:'ch3',values:[{time:0,y:0}]},
  {label:'ch4',values:[{time:0,y:0}]},
  {label:'ch5',values:[{time:0,y:0}]},
  {label:'ch6',values:[{time:0,y:0}]},
  {label:'ch7',values:[{time:0,y:0}]},
  {label:'ch8',values:[{time:0,y:0}]}
];
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`)


  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function createPlotWindow () {
  plotWindow= new BrowserWindow({width:800, height:600})
  plotWindow.loadURL(`file://${__dirname}/plot.html`)


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
