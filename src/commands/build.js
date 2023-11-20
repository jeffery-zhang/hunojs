import chalk from 'chalk'
import path from 'path'

import { FilePaths } from '../lib/filePaths.js'

const action = async () => {
  const filePaths = new FilePaths()

  console.log(chalk.yellow('huno build...', filePaths.configFileExists()))
}

export default {
  command: 'build',
  description: 'build sites',
  action,
}
