import { BrowserWindow as BrowserWindowElectron } from "electron"
import { autoUpdater } from "electron-updater"
import * as os from "os"
import { log, isDev } from "./util"



export default class AppUpdater {
  constructor() {
    if (isDev() || os.platform() == "linux") {
      log("dev mode, skipping Update check")
      return
    }

    autoUpdater.on('checking-for-update', () => {
      log('Checking for update...');
    })
    
    autoUpdater.on('update-available', (info) => {
      log('Update available:', info);
    })
    
    autoUpdater.on('update-not-available', (info) => {
      log('Update not available:', info);
    })
    
    autoUpdater.on('error', (err) => {
      log('Error in auto-updater.', err);
      if (!isDev) {
        //Raven.captureException(err)
      }
    })
    
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      log(log_message);
    })
    
    autoUpdater.on('update-downloaded', (info) => {
      log('Update downloaded; will install in 5 seconds', info);
    });

    autoUpdater.checkForUpdates()
  }
}
