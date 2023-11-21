import chalk from 'chalk'

import { Config } from '../lib/config.js'

const action = async () => {
  const config = new Config()

  console.log(chalk.yellow('huno build...', JSON.stringify(config.fullConfig)))
}

export default {
  command: 'build',
  description: 'build sites',
  action,
}
