import path from 'path'
import fs from 'fs'
import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import dayjs from 'dayjs'

export class Renderer {
  constructor(config) {
    if (!config) throw new Error('config is required')
    this.config = config
  }

  config = {}

  renderAllHtml(compiledContentList) {
    const list = compiledContentList
      .filter(({ config }) => config.title)
      .map(({ config }) => config)
    const basicLayout = this.getBasicLayoutContent()
    const indexList = this.getIndexListTemplate(list)
    const indexTemplate = this.generateIndexTemplate(basicLayout, indexList)
    this.writeIndex(indexTemplate)
    this.copyAssets()
  }

  getBasicLayoutContent() {
    let basicLayout
    if (this.config.template === 'default') {
      basicLayout = path.join(
        this.config.hunoRootPath,
        'template/basicLayout.html',
      )
    } else {
      basicLayout = path.join(
        this.config.rootPath,
        `${this.config.templateDir}/${this.config.template}/basicLayout.html`,
      )
    }
    try {
      const content = fs.readFileSync(basicLayout, 'utf-8')
      return content
    } catch (err) {
      console.error('read basic layout template error', err)
      throw new Error(err)
    }
  }

  getIndexListTemplate(list) {
    let indexList
    if (this.config.template === 'default') {
      indexList = path.join(this.config.hunoRootPath, 'template/list.html')
    } else {
      indexList = path.join(
        this.config.rootPath,
        `${this.config.templateDir}/${this.config.template}/list.html`,
      )
    }
    try {
      const content = fs.readFileSync(indexList, 'utf-8')
      return nunjucks.renderString(content, {
        list,
      })
    } catch (err) {
      console.error('read index list template error', err)
      throw new Error(err)
    }
  }

  generateIndexTemplate(basicLayout, list) {
    const renderedBasicLayout = nunjucks.renderString(basicLayout, {
      ...this.config.globalParams,
    })
    const basicLayoutHtml = cheerio.load(renderedBasicLayout)
    const listHtml = basicLayoutHtml(list)
    const mainElement = basicLayoutHtml('main#main')
    mainElement.append(listHtml)
    return basicLayoutHtml.html()
  }

  getContentListTemplate(list) {
    let contentHtml
    if (this.config.template === 'default') {
      contentHtml = path.join(this.config.hunoRootPath, 'template/content.html')
    } else {
      contentHtml = path.join(
        this.config.rootPath,
        `${this.config.templateDir}/${this.config.template}/content.html`,
      )
    }
    const result = []
    try {
      const content = fs.readFileSync(contentHtml, 'utf-8')
      list.forEach((item) => {
        result.push(
          nunjucks.renderString(content, {
            ...this.config.globalParams,
            post: item.config,
          }),
        )
      })
      return result
    } catch (err) {
      console.error('read content list template error', err)
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
