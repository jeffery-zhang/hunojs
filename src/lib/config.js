import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import lodash from 'lodash'
import yaml from 'yaml'

const defaultParams = {
  baseUrl: '/',
  defaultLang: 'en',
  title: 'Huno',
  description: 'Huno is a static site generator',
  favicon: 'favicon.ico',
}

export class Config {
  constructor(env = 'prod') {
    this.#_env = env
    this.init()
  }

  #_rootPath = path.resolve()
  #_env = 'prod'
  #_configPath = 'config'
  #_configFile = 'config.yaml'
  #_config = {
    outputDir: 'dist',
    contentDir: 'content',
    templateDir: 'template',
    template: 'default',
    globalParams: defaultParams,
  }

  get hunoRootPath() {
    const currentModuleUrl = import.meta.url
    const currentModulePath = path.dirname(fileURLToPath(currentModuleUrl))
    const rootDir = path.join(currentModulePath, '../..')
    return rootDir
  }
  get rootPath() {
    return this.#_rootPath
  }
  get configPath() {
    return path.join(this.#_rootPath, this.#_configPath)
  }
  get configFile() {
    return path.join(this.#_configPath, this.#_configFile)
  }
  get envConfigFile() {
    const [pre, ext] = this.#_configFile.split('.')
    return path.join(this.#_configPath, `${pre}.${this.#_env}.${ext}`)
  }
  get outputPath() {
    return path.join(this.#_rootPath, this.#_config?.outputDir)
  }
  get contentPath() {
    return path.join(this.#_rootPath, this.#_config?.contentDir)
  }
  get templatePath() {
    return path.join(this.#_rootPath, this.#_config?.templateDir)
  }
  get template() {
    return this.#_config.template
  }
  get globalParams() {
    return this.#_config.globalParams
  }
  get fullConfig() {
    return this.#_config
  }

  init() {
    /**
     * 初始化并合并基础配置和环境配置
     * 优先使用环境配置
     */
    const configPathExists = fs.existsSync(this.configPath)
    if (configPathExists) {
      const configExists = fs.existsSync(this.configFile)
      const envConfigExists = fs.existsSync(this.envConfigFile)

      let baseConfig = {},
        envConfig = {}
      if (configExists) {
        baseConfig = yaml.parse(
          fs.readFileSync(this.configFile, 'utf-8') ?? '{}',
        )
        this.#_config = lodash.merge(this.#_config, baseConfig)
      }
      if (envConfigExists) {
        envConfig = yaml.parse(
          fs.readFileSync(this.envConfigFile, 'utf-8') ?? '{}',
        )
        this.#_config = lodash.merge(this.#_config, envConfig)
      }
    }
  }
}
