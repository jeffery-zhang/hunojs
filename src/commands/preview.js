import http from 'http'
import express from 'express'
import path from 'path'
import chalk from 'chalk'

const startPreviewServer = () => {
  const app = express()
  const port = 8080
  app.use('/', express.static(path.join(path.resolve(), 'dist')))

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
