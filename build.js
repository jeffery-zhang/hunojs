import { nodeExternalsPlugin } from 'esbuild-node-externals'
import esbuild from 'esbuild'

esbuild.build({
  entryPoints: ['bin/huno.js'],
  bundle: true,
  outfile: 'dist/huno.cjs',
  platform: 'node',
  plugins: [
    nodeExternalsPlugin({
      dependencies: false,
    }),
  ],
}).catch(err => {
  console.error(err)
  process.exit(1)
})
