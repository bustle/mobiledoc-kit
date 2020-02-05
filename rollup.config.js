import globImport from 'rollup-plugin-glob-import';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';

export default args => {
  if (args.tests) {
    return {
      input: 'tests/index.js',
      plugins: [
        resolve(),
        commonjs(),
        alias({
          entries: [
            {
              find: 'mobiledoc-kit',
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
    };
  } else {
    return {
      input: 'src/js/index.js',
      plugins: [
        resolve(),
        commonjs(),
        alias({
          entries: [
            {
              find: 'mobiledoc-kit',
              replacement: path.join(__dirname, 'src/js')
            }
          ]
        }),
      ],
      output: {
        file: 'dist/index.js',
        format: 'es',
        sourcemap: true
      }
    };
  }
};
