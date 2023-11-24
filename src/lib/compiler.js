import path from 'path'
import fs from 'fs'
import { glob } from 'glob'
import { marked } from 'marked'

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
          try {
            fs.readFile(
              path.join(this.config.rootPath, md),
              'utf-8',
              (err, data) => {
                if (err) {
                  throw new Error('read file error', err)
                }
                const config = this.extractContentConfig(data)
                const html = this.compileContentWithoutConfig(data)
                resolve({
                  path: md,
                  config,
                  html,
                })
              },
            )
          } catch (err) {
            throw new Error('compile md content error', err)
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
}
