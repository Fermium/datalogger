import { BrowserWindow as BrowserWindowElectron, dialog } from "electron";
let autoUpdater = require('electron-updater').autoUpdater;
import * as os from "os";
import { log, isDev } from "./util";



export default class AppUpdater {
  constructor() {
    if (isDev() || os.platform() == "linux") {
      log("dev mode, skipping Update check")
      return
    }
    autoUpdater.setFeedURL({
      "provider": "s3",
      "path": "nng-logger",
      "bucket": "fermiumlabs-software"
    });
    autoUpdater.autoDownload = false
    autoUpdater.on('checking-for-update', () => {
      log('Checking for update...');
    })

    autoUpdater.on('update-available', (info) => {
      log('Update available:', info);
      dialog.showMessageBox({
        type: 'info',
        title: 'Found Updates',
        message: 'Found updates, do you want update now?',
        buttons: ['Sure', 'No']
      }, (buttonIndex) => {
        if (buttonIndex === 0) {
          autoUpdater.downloadUpdate()
        }
        /*
        else {
          updater.enabled = true
          updater = null
        }
        */
      })
    })

    autoUpdater.on('update-not-available', (info) => {
      log('Update not available:', info);
    })

    autoUpdater.on('error', (err) => {
      log('Error in auto-updater.', err);
      if (!isDev()) {
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
      dialog.showMessageBox({
        title: 'Install Updates',
        message: 'Updates downloaded, application will be quit and restarted for update...'
      }, () => {
        setImmediate(() => autoUpdater.quitAndInstall())
      })
    });

    autoUpdater.checkForUpdates()
  }
}
