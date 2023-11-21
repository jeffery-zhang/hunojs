import path from 'path'
import fs from 'fs'
import lodash from 'lodash'
import yaml from 'yaml'

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
    baseUrl: '/',
    outputDir: 'dist',
    contentDir: 'content',
    theme: 'default',
    defaultLang: 'en',
    params: {},
  }

  get baseUrl() {
    return this.#_config.baseUrl
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
  get outputDir() {
    return path.join(this.#_rootPath, this.#_config?.outputDir)
  }
  get contentPath() {
    return path.join(this.#_rootPath, this.#_config?.contentDir)
  }
  get theme() {
    return this.#_config.theme
  }
  get defaultLang() {
    return this.#_config.defaultLang
  }
  get params() {
    return this.#_config.params
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
