import path from 'path'
import fs from 'fs'
import { glob } from 'glob'
import { marked } from 'marked'
import dayjs from 'dayjs'

export class Compiler {
  constructor(config) {
    if (!config) throw new Error('config is required')
    this.config = config
  }

  config = {}

  #_configRegexp = /\+\+\+(.*?)\+\+\+/s

  get contentPath() {
    return this.config.contentPath
  }

  async findAllContent() {
    return await glob(`${this.config.contentPath}/**/*.md`)
  }

  async compileMds() {
    const promises = []
    const mds = await this.findAllContent()
    mds.forEach((md) => {
      promises.push(
        new Promise(async (resolve) => {
          const filePath = path.join(this.config.rootPath, md)
          try {
            const fileStats = fs.statSync(filePath)
            const updateTime = fileStats.mtime
            fs.readFile(filePath, 'utf-8', (err, data) => {
              if (err) {
                throw new Error('read file error', err)
              }
              const config = this.extractContentConfig(data)
              const html = this.compileContentWithoutConfig(data)
              resolve({
                filePath: filePath.replace('.md', ''),
                url: this.filePathToUrl(md),
                config: {
                  ...config,
                  author: config.author || 'anonymous',
                  date:
                    config.date ||
                    dayjs(updateTime).format('YYYY-MM-DD HH:mm:ss'),
                },
                html,
              })
            })
          } catch (err) {
            console.error('compile content files error', err)
            throw new Error(err)
          }
        }),
      )
    })

    return await Promise.all(promises)
  }

  extractContentConfig(content) {
    const contentConfig = {}
    const reg = this.#_configRegexp
    const match = content.match(reg)
    if (match) {
      const lines = match[1].trim().split('\n')
      lines.forEach((line) => {
        const [key, value] = line.split('=')
        contentConfig[key.trim()] = value?.trim() ?? ''
      })
    }

    return contentConfig
  }

  compileContentWithoutConfig(content) {
    const reg = this.#_configRegexp
    const restContent = content.replace(reg, '').trim()
    const html = marked(restContent)
    return html
  }

  filePathToUrl(filePath) {
    const realPath = path.resolve(filePath)
    return realPath
      .replace(this.config.contentPath, '')
      .replaceAll('\\', '/')
      .replace('.md', '')
  }
}
