import http from 'http'
import express from 'express'
import path from 'path'
import chalk from 'chalk'

import { Config } from '../lib/config.js'

const startPreviewServer = () => {
  const config = new Config()

  const app = express()
  const port = config.port
  app.use('/', express.static(config.outputPath))

  http.createServer(app).listen(port, () => {
    console.log(
      `preview sever is running on ${chalk.greenBright(
        'http://localhost:' + port,
      )}`,
    )
  })
}

const action = async () => {
  startPreviewServer()
}

export default {
  command: 'preview',
  description: 'start preview server',
  action,
}
