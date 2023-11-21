import chalk from 'chalk'

import { Config } from '../lib/config.js'
import { Compile } from '../lib/compile.js'

const action = async () => {
  const config = new Config()
  const compile = new Compile(config.contentPath)

  console.log(chalk.yellow('huno build...', JSON.stringify(compile.contentPath)))
  console.log(chalk.yellow('huno build...', JSON.stringify(await compile.findAllContent())))
}

export default {
  command: 'build',
  description: 'build sites',
  action,
}
