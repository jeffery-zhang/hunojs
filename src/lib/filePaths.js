import path from 'path'
import fs from 'fs'

export class FilePaths {
  constructor() {
    this._rootPath = path.resolve()
  }

  static _rootPath = ''

  get rootPath() {
    return this._rootPath
  }

  get configPath() {
    return path.join(this._rootPath, 'config')
  }

  get configFilePath() {
    return path.join(this._rootPath, 'config.toml')
  }

  get contentsPath() {
    return path.join(this._rootPath, 'contents')
  }

  configPathExists() {
    return fs.existsSync(this.configPath)
  }

  configFileExists() {
    return fs.existsSync(this.configFilePath)
  }
}
