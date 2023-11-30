import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import lodash from 'lodash'
import yaml from 'yaml'
import chalk from 'chalk'

import basicLayout from '../../template/basicLayout.html'
import list from '../../template/list.html'
import article from '../../template/article.html'

const defaultPageParams = {
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
  #_defaultTemplate = {
    basicLayout,
    list,
    article,
  }
  #_config = {
    port: 8080,
    outputDir: 'dist',
    contentDir: 'content',
    templateDir: 'template',
    template: 'default',
    pageParams: defaultPageParams,
  }

  get hunoRootPath() {
    // polyfill for commonjs environment
    if (__dirname) {
      return __dirname
    } else {
      const currentModuleUrl = import.meta.url
      const currentModulePath = path.dirname(fileURLToPath(currentModuleUrl))
      const rootDir = path.join(currentModulePath, '../..')
      return rootDir
    }
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
  get defaultTemplate() {
    return this.#_defaultTemplate
  }
  get port() {
    return this.#_config?.port
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
  get pageParams() {
    return this.#_config.pageParams
  }
  get fullConfig() {
    return this.#_config
  }

  init() {
    /**
     * 初始化并合并基础配置和环境配置
     * 优先使用环境配置
     */
    console.log(chalk.yellowBright('reading config files...'))
    const configPathExists = fs.existsSync(this.configPath)
    if (configPathExists) {
      const configExists = fs.existsSync(this.configFile)
      const envConfigExists = fs.existsSync(this.envConfigFile)

      let baseConfig = {},
        envConfig = {}
      if (configExists) {
        baseConfig = yaml.parse(fs.readFileSync(this.configFile, 'utf-8')) ?? {}
        this.#_config = lodash.merge(this.#_config, baseConfig)
      }
      if (envConfigExists) {
        envConfig =
          yaml.parse(fs.readFileSync(this.envConfigFile, 'utf-8')) ?? {}
        this.#_config = lodash.merge(this.#_config, envConfig)
      }
      console.log(chalk.greenBright('config files loaded!'))
      if (!configExists && !envConfigExists) {
        console.log(
          chalk.yellowBright(
            'No existing config files found. Huno is now building with default config...',
          ),
        )
      }
    }
  }
}
