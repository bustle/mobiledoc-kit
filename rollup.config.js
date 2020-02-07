import globImport from 'rollup-plugin-glob-import';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default [
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
      globImport()
    ],
    output: {
      file: 'dist/tests.js',
      format: 'es',
      sourcemap: true
    }
  },
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
      file: 'dist/index.js',
      format: 'es',
      sourcemap: true
    }
  }
];
