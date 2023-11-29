#!/usr/bin/env node

import chalk from 'chalk'
import { program } from 'commander'

import build from './commands/build.js'
import preview from './commands/preview.js'

const setCommand = async () => {
  const commands = [build, preview]
  const promises = []
  commands.map((obj) => {
    promises.push(
      new Promise(async (resolve) => {
        try {
          const cmd = program
            .command(obj.command)
            .description(obj.description)
            .action(obj.action)

          obj.options &&
            obj.options.map((opt) => {
              cmd.option(...opt)
            })
          resolve()
        } catch (err) {
          console.error(chalk.redBright(err))
          process.exit(1)
        }
      }),
    )
  })

  await Promise.all(promises)
}

export const start = async () => {
  await setCommand()

  program.parse()
}
