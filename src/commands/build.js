import chalk from 'chalk'

import { Config } from '../lib/config.js'
import { Compiler } from '../lib/compiler.js'
import { Renderer } from '../lib/renderer.js'

const action = async () => {
  const config = new Config()
  const compiler = new Compiler(config)
  const renderer = new Renderer(config)

  const mds = await compiler.compileMds()
  console.log(mds.map((md) => md.config))
  console.log(mds.map((md) => md.filePath))
  // renderer.renderAllHtml(mds)
}

export default {
  command: 'build',
  description: 'build sites',
  action,
}
