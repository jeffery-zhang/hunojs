import path from 'path'
import fs from 'fs'
import chalk from 'chalk'

export class Generator {
  constructor(config) {
    if (!config) {
      console.error(
        chalk.redBright('Generator class error: config is required!'),
      )
      process.exit(1)
    }
    this.#_config = config
  }

  #_config = {}

  #_writeSinglePageFile(url, content) {
    const outputFilePath = path.join(this.#_config.outputPath, url)
    const fileExists = fs.existsSync(outputFilePath)
    if (!fileExists) {
      fs.mkdirSync(outputFilePath, { recursive: true })
    }
    const targetFile = path.join(outputFilePath, 'index.html')
    console.log('writing: ' + targetFile)
    try {
      fs.writeFileSync(targetFile, content)
    } catch (err) {
      console.error(chalk.redBright(`writing ${targetFile} failed \n${err}`))
      throw new Error(`writing ${targetFile} failed \n${err}`)
    }
  }

  #_copyAssets() {
    let assetsPath
    if (this.#_config.template === 'default') {
      assetsPath = path.join(this.#_config.hunoRootPath, 'template/assets')
    } else {
      assetsPath = path.join(
        this.#_config.rootPath,
        `${this.#_config.templateDir}/${this.#_config.template}/assets`,
      )
    }
    const targetPath = path.join(this.#_config.outputPath, 'assets')
    return new Promise((resolve, reject) => {
      fs.cp(assetsPath, targetPath, { recursive: true }, (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    }).catch((err) => {
      console.error(chalk.redBright(`copy assets failed \n${err}`))
    })
  }

  async generateAllFiles(pageConfigs) {
    console.log(chalk.yellowBright('generating all page files...'))

    const promises = []
    pageConfigs.forEach((item) => {
      promises.push(
        new Promise((resolve, reject) => {
          try {
            this.#_writeSinglePageFile(item.url, item.htmlString)
            resolve()
          } catch (err) {
            reject(err)
          }
        }).catch((err) => {
          console.error(chalk.redBright(err))
        }),
      )
    })
    promises.push(this.#_copyAssets())

    await Promise.all(promises)
    console.log('Huno build finished!')
    process.exit(0)
  }
}
