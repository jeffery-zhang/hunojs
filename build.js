import { nodeExternalsPlugin } from 'esbuild-node-externals'
import esbuild from 'esbuild'

esbuild
  .build({
    entryPoints: ['bin/huno.js'],
    bundle: true,
    outfile: 'huno.bin.cjs',
    platform: 'node',
    minify: true,
    plugins: [
      nodeExternalsPlugin({
        dependencies: false,
      }),
    ],
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
