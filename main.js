const electron = require('electron')
const dateFormat = require('dateformat'); //for date

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let plotWindow
global.config = {'_file': '','_experiment':'','_date':dateFormat(Date.now(), "yyyy_mm_dd"),'_gain':{'vh': 1 ,'vr': 1 , 'a' : 1, 'g' : 1},'_db_exists':false}
global.scope =  {'series': null,'timestamp': 0, 'ch1': 0,'ch2':0,'ch3':0,'a':0,'b':0};
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
