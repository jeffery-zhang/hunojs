import { Config } from '../lib/config.js'
import { Compiler } from '../lib/compiler.js'
import { Renderer } from '../lib/renderer.js'
import { Generator } from '../lib/generator.js'

const action = async () => {
  const config = new Config()
  const compiler = new Compiler(config)
  const compiledContentList = await compiler.compileAllContent()

  const renderer = new Renderer(config, compiledContentList)
  // console.log(mds.map((md) => md.url))
  // console.log(mds.map((md) => md.filePath))
  const pageConfigs = await renderer.renderAllPageConfigs()

  const generator = new Generator(config)
  await generator.generateAllFiles(pageConfigs)
}

export default {
  command: 'build',
  description: 'build sites',
  action,
}
