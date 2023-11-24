import path from 'path'
import fs from 'fs'
import nunjucks from 'nunjucks'

export class Renderer {
  constructor(config) {
    if (!config) throw new Error('config is required')
    this.config = config
  }

  config = {}

  getDefaultIndexTemplate() {
    let indexFile = ''
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
      throw new Error('read index template error', err)
    }
  }

  renderAllHtml(content) {
    content.forEach((obj) => {})
  }
}
