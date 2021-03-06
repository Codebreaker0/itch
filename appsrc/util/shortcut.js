
import path from 'path'

import {app} from '../electron'
import spawn from './spawn'
import sf from './sf'

import mklog from './log'
const log = mklog('shortcut')
const opts = {logger: new mklog.Logger()}

const app_folder = path.resolve(process.execPath, '..')
const root_folder = path.resolve(app_folder, '..')
const update_exePath = path.join(root_folder, 'Update.exe')
const exe_name = path.basename(process.execPath)

const self = {
  update_run: async function (args) {
    log(opts, `Update.exe located at = ${update_exePath}`)
    const code = await spawn({
      command: update_exePath,
      args
    })
    log(opts, `Update.exe exited with code ${code}`)
    if (code !== 0) {
      throw new Error(`Update.exe exited with non-zero code ${code}`)
    }
  },

  create_or_update_shortcut: async function () {
    await self.update_run(['--createShortcut', exe_name])
  },

  update: async function () {
    const desktopPath = app.getPath('desktop')
    const shortcutPath = path.join(desktopPath, 'itch.lnk')

    // find out if the user has deleted the desktop shortcut
    // cf. https://github.com/itchio/itch/issues/239
    let remove_desktop_shortcut = false

    if (await sf.exists(shortcutPath)) {
      log(opts, `Shortcut at ${shortcutPath} still exists, letting Squirrel do its thing`)
    } else {
      // shortcut was deleted by user, remove it after Squirrel recreates it
      remove_desktop_shortcut = true
      log(opts, `Shortcut at ${shortcutPath} has been deleted, preparing to re-delete`)
    }

    try {
      log(opts, 'Updating shortcut with squirrel')
      await self.create_or_update_shortcut()
      if (remove_desktop_shortcut) {
        log(opts, 'Removing shortcut as requested')
        await sf.wipe(shortcutPath)
      }
    } catch (e) {
      log(opts, `Could not update shortcut: ${e.stack || e}`)
    }
  },

  install: async function () {
    log(opts, 'Creating shortcut with squirrel')
    try {
      await self.create_or_update_shortcut()
    } catch (e) {
      log(opts, `Could not create shortcut: ${e.stack || e}`)
    }
  },

  uninstall: async function () {
    log(opts, 'Removing shortcut with squirrel')
    try {
      await self.update_run(['--removeShortcut', exe_name])
    } catch (e) {
      log(opts, `Could not remove shortcut: ${e.stack || e}`)
    }
  }

}

export default self
