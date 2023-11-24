import path from 'path'
import fs from 'fs'
import nunjucks from 'nunjucks'

export class Renderer {
  constructor(config) {
    if (!config) throw new Error('config is required')
    this.config = config
  }

  config = {}

  renderAllHtml(content) {
    const indexList = []
    const indexContent = this.getDefaultIndexTemplate()
    content.forEach((obj) => {})
    this.writeIndex(indexContent)
    this.copyAssets()
  }

  getDefaultIndexTemplate() {
    let indexFile
    if (this.config.template === 'default') {
      indexFile = path.join(this.config.hunoRootPath, 'template/index.html')
    } else {
      indexFile = path.join(
        this.config.rootPath,
        `${this.config.templateDir}/${this.config.template}/index.html`,
      )
    }
    try {
      const content = fs.readFileSync(indexFile, 'utf-8')
      return nunjucks.renderString(content, this.config.globalParams)
    } catch (err) {
      console.error('read index template error', err)
      throw new Error(err)
    }
  }

  writeIndex(content) {
    const filePath = path.join(this.config.outputPath, 'index.html')
    const fileExists = fs.existsSync(this.config.outputPath)
    if (!fileExists) {
      fs.mkdirSync(this.config.outputPath, { recursive: true })
    }
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error('Caught an error while writing index.html... ', err)
        throw new Error(err)
      }
      console.log('Write index.html succeed!')
    })
  }

  copyAssets() {
    let assetsPath
    if (this.config.template === 'default') {
      assetsPath = path.join(this.config.hunoRootPath, 'template/assets')
    } else {
      assetsPath = path.join(
        this.config.rootPath,
        `${this.config.templateDir}/${this.config.template}/assets`,
      )
    }
    const targetPath = path.join(this.config.outputPath, 'assets')
    try {
      fs.cp(assetsPath, targetPath, { recursive: true }, (err) => {
        if (err) {
          throw new Error(err)
        }
        console.log('Copy assets to output dir succeed!')
      })
    } catch (err) {
      console.error('Copy assets to output dir failed... ', err)
      throw new Error(err)
    }
  }
}
