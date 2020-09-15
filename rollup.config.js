import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import strip from '@rollup/plugin-strip'
export default {
  input: 'src/index.js',
  plugins: [
    json(),
    nodeResolve({
      customResolveOptions: {
        moduleDirectory: 'node_modules',
      },
    }),
    commonjs({
      include: 'node_modules/**',
    }),
    strip(),
  ],
  external: ['lodash', 'axios'],
  output: [
    {
      file: 'dist/after-axios.cjs.js',
      format: 'cjs',
    },
    {
      file: 'dist/after-axios.esm.js',
      format: 'esm',
    },
    {
      globals: {
        axios: 'axios',
        lodash: '_',
      },
      file: 'dist/after-axios.umd.js',
      format: 'umd',
      name: 'AfterAxios',
    },
    {
      globals: {
        axios: 'axios',
        lodash: '_',
      },
      file: 'examples/after-axios.umd.js',
      format: 'umd',
      name: 'AfterAxios',
    },
  ],
}
