import path from 'path'
import fs from 'fs'
import { glob } from 'glob'

export class Compile {  
  constructor(contentPath) {
    this.#_contentPath = contentPath
  }

  #_contentPath = ''

  get contentPath() {
    return this.#_contentPath
  }

  async findAllContent() {
    return await glob(`${this.#_contentPath}/**/*.md`)
  }
}