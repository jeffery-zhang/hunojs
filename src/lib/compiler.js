import path from 'path'
import fs from 'fs'
import { glob } from 'glob'
import { marked } from 'marked'
import dayjs from 'dayjs'
import chalk from 'chalk'

export class Compiler {
  constructor(config) {
    if (!config) {
      console.error(
        chalk.redBright('Compiler class Error: config is required!'),
      )
      process.exit(1)
    }
    this.#_config = config
  }

  #_config = {}
  #_contentConfigRegexp = /\+\+\+(.*?)\+\+\+/s

  async findAllContentMds() {
    /**
     * find all md files in content dir configured in config files
     */
    return await glob(`${this.#_config.contentPath}/**/*.md`)
  }

  async compileAllContent() {
    /**
     * parse all mds content to html content
     */
    console.log(chalk.yellowBright('compiling md content files...'))
    const promises = []
    const contentMds = await this.findAllContentMds()

    if (!contentMds || contentMds.length === 0) {
      console.error(chalk.redBright('No content markdown files found!'))
      throw new Error(
        `No markdown files found in the directory ${
          this.#_config.contentPath
        }!`,
      )
    }

    contentMds.forEach((md) => {
      promises.push(
        new Promise(async (resolve, reject) => {
          const filePath = path.join(this.#_config.rootPath, md)
          try {
            const fileStats = fs.statSync(filePath)
            // get the last modified time of md file as the article update time
            const updateTime = fileStats.mtime
            fs.readFile(filePath, 'utf-8', (err, data) => {
              if (err) {
                throw new Error(err)
              }
              const config = this.extractContentConfig(data)
              const html = this.compileContentWithoutConfig(data)
              resolve({
                // absolute path of files, used to generate html files and directories
                filePath: filePath.replace('.md', ''),
                // used to configure links of pages
                url: this.filePathToUrl(md),
                // content page configs
                config: {
                  ...config,
                  author: config.author || 'anonymous',
                  date:
                    config.date ||
                    dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss'),
                },
                // content page htmls
                html,
                // used to sort articles
                updateTime: dayjs(updateTime).valueOf(),
              })
            })
          } catch (err) {
            console.error(
              chalk.redBright(
                `compiling content of ${filePath} failed \n${err}`,
              ),
            )
            reject(err)
          }
        }).catch((err) => {
          console.error(chalk.redBright(err))
        }),
      )
    })

    const compiledContentList = await Promise.all(promises)
    console.log(chalk.greenBright('all md content compiled'))

    return compiledContentList.filter((item) => !!item)
  }

  extractContentConfig(content) {
    /**
     * extract the config between the symbols from md files
     */
    const contentConfig = {}
    const reg = this.#_contentConfigRegexp
    const match = content.match(reg)
    if (match) {
      try {
        const lines = match[1].trim().split('\n')
        lines.forEach((line) => {
          const [key, value] = line.split('=')
          contentConfig[key.trim()] = value?.trim() ?? ''
        })
        return contentConfig
      } catch (err) {
        throw new Error(err)
      }
    }
  }

  compileContentWithoutConfig(content) {
    /**
     * compile the md content to html string without config
     */
    const reg = this.#_contentConfigRegexp
    const restContent = content.replace(reg, '').trim()
    try {
      const html = marked(restContent)
      return html
    } catch (err) {
      throw new Error(err)
    }
  }

  filePathToUrl(filePath) {
    /**
     * transfer file path to link url
     */
    const realPath = path.resolve(filePath)
    return realPath
      .replace(this.#_config.contentPath, '')
      .replaceAll('\\', '/')
      .replace('.md', '')
  }
}
