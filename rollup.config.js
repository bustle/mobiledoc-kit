import globImport from 'rollup-plugin-glob-import';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import serve from 'rollup-plugin-serve';
import path from 'path';

export default [
  {
    input: 'src/js/index.js',
    plugins: [
      resolve(),
      commonjs(),
      alias({
        entries: [
          {
            find: 'mobiledoc-kit',
            // eslint-disable-next-line no-undef
            replacement: path.join(__dirname, 'src/js')
          }
        ]
      })
    ],
    output: {
      file: 'dist/mobiledoc.js',
      format: 'es',
      sourcemap: true
    }
  },
  {
    input: 'tests/index.js',
    plugins: [
      resolve(),
      commonjs(),
      alias({
        entries: [
          {
            find: 'mobiledoc-kit',
            // eslint-disable-next-line no-undef
            replacement: path.join(__dirname, 'src/js')
          }
        ]
      }),
      globImport(),
      serve({
        contentBase: '',
        port: process.env.PORT || 4200
      })
    ],
    output: {
      file: 'dist/tests.js',
      format: 'es',
      sourcemap: true
    }
  }
];
