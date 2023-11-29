import path from 'path'
import fs from 'fs'
import nunjucks from 'nunjucks'
import * as cheerio from 'cheerio'
import chalk from 'chalk'

export class Renderer {
  constructor(config, compiledContentList) {
    if (!config) {
      console.error(
        chalk.redBright('Renderer class Error: config is required!'),
      )
      process.exit(1)
    }
    if (!compiledContentList || compiledContentList.length === 0) {
      console.error(
        chalk.redBright(
          'Renderer class Error: compiled content list is required!',
        ),
      )
      process.exit(1)
    }
    this.#_config = config
    this.#_originalBasicLayoutHtmlString =
      this.#_getSingleOriginalHtmlTemplate('basicLayout')
    this.#_compiledContentList = compiledContentList
  }

  #_config = {}
  #_originalBasicLayoutHtmlString = ''
  #_compiledContentList = []

  #_getSingleOriginalHtmlTemplate(templateName) {
    /**
     * private function to get target html template
     */
    let filePath
    if (this.#_config.template === 'default') {
      filePath = path.join(
        this.#_config.hunoRootPath,
        `template/${templateName}.html`,
      )
    } else {
      filePath = path.join(
        this.#_config.rootPath,
        `${this.#_config.templateDir}/${
          this.#_config.template
        }/${templateName}.html`,
      )
    }
    try {
      const content = fs.readFileSync(filePath, 'utf-8')
      return content
    } catch (err) {
      console.error(chalk.redBright(`read ${filePath} template error \n${err}`))
      process.exit(1)
    }
  }

  async renderAllPageConfigs() {
    const listHtmlString = this.getRenderedIndexListHtmlString()
    const indexPageConfig = this.getRenderedIndexPageConfig(listHtmlString)
    const contentPageConfigs = await this.getAllContentPageConfig()
    return [indexPageConfig, ...contentPageConfigs]
  }

  getRenderedIndexListHtmlString() {
    /**
     * read and render index list template
     */
    const list = this.#_compiledContentList
      // filter out content with title and generate full config of list
      .filter(({ config }) => config.title)
      .map((item) => ({
        ...item.config,
        postLink: item.url,
      }))
    const indexListTemplate = this.#_getSingleOriginalHtmlTemplate('list')
    try {
      // render html with combined config
      return nunjucks.renderString(indexListTemplate, {
        ...this.#_config.globalParams,
        list,
      })
    } catch (err) {
      console.error(chalk.redBright('render index list template error\n' + err))
      process.exit(1)
    }
  }

  getRenderedIndexPageConfig(listHtmlString) {
    /**
     * generate index page config
     */
    try {
      const renderedBasicLayoutHtmlString = nunjucks.renderString(
        this.#_originalBasicLayoutHtmlString,
        {
          ...this.#_config.globalParams,
        },
      )
      const $ = cheerio.load(renderedBasicLayoutHtmlString)
      const listDom = $(listHtmlString)
      const mainElement = $('main#main')
      mainElement.append(listDom)
      return {
        // used to write html files
        htmlString: $.html(),
        // used to manage links
        url: '/',
        // used to generate html files and directories
        filePath: this.#_config.outputPath,
      }
    } catch (err) {
      console.error(chalk.redBright('generate index page config error\n' + err))
      process.exit(1)
    }
  }

  getSingleRenderedContentHtmlString(compiledContent) {
    /**
     * read and render single content template
     */
    const contentTemplate = this.#_getSingleOriginalHtmlTemplate('article')
    try {
      const renderedContentTemplate = nunjucks.renderString(contentTemplate, {
        ...this.#_config.globalParams,
        ...compiledContent.config,
      })
      const $ = cheerio.load(renderedContentTemplate)
      const article = $(compiledContent.html)
      const postContent = $('div#postContent')
      postContent.append(article)
      return $.html()
    } catch (err) {
      console.error(
        chalk.redBright(
          `render single template with ${
            compiledContent.filePath + '.md'
          } file content went wrong\n` + err,
        ),
      )
    }
  }

  getRenderedSingleContentPageConfig(renderedContentTemplate, compiledContent) {
    /**
     * generate single content page config
     */
    try {
      console.log(chalk.yellowBright('rendering index page config...'))

      const { title = '', ...rest } = compiledContent.config
      const renderedBasicLayoutHtmlString = nunjucks.renderString(
        this.#_originalBasicLayoutHtmlString,
        {
          ...this.#_config.globalParams,
          ...rest,
          post: { title },
        },
      )
      const $ = cheerio.load(renderedBasicLayoutHtmlString)
      const content = $(renderedContentTemplate)
      $('main#main').append(content)
      console.log(chalk.greenBright('index page config rendered'))

      return {
        // used to write html files
        htmlString: $.html(),
        // used to manage links
        url: compiledContent.url,
        // used to generate html files and directories
        filePath: compiledContent.filePath,
      }
    } catch (err) {
      console.error(
        chalk.redBright(
          `render single content page of ${compiledContent.filePath} file went wrong\n` +
            err,
        ),
      )
    }
  }

  async getAllContentPageConfig() {
    /**
     * asynchronously generate all content page configs
     */
    console.log(chalk.yellowBright('rendering content page configs...'))
    const promises = []
    this.#_compiledContentList.forEach((item) => {
      promises.push(
        new Promise((resolve, reject) => {
          try {
            const contentTemplate =
              this.getSingleRenderedContentHtmlString(item)
            resolve(
              this.getRenderedSingleContentPageConfig(contentTemplate, item),
            )
          } catch (err) {
            reject(err)
          }
        }).catch((err) => {
          console.error(chalk.redBright(err))
        }),
      )
    })
    const contentPageConfigs = await Promise.all(promises)
    console.log(chalk.greenBright('content page configs rendered'))

    return contentPageConfigs.filter((item) => !!item)
  }
}
