import { defineConfig } from 'vite';
import { join } from 'path';

const mode = process.env.NODE_ENV;
const PROD = mode === 'production';
export const getBaseConfig = (moduleName) => {
  return defineConfig({
    mode,
    root: join(process.cwd(), 'modules', moduleName),
    build: {
      ssr: true,
      outDir: join(process.cwd(), 'dist'),
      minify: PROD,
      lib: {
        entry: 'index.ts',
        formats: ['cjs']
      },
      rollupOptions: {
        output: {
          entryFileNames: `${moduleName}.js`
        }
      },
      emptyOutDir: false
    },
    resolve: {
      alias: {
        '@main': join(process.cwd(), 'modules', 'main'),
        '@renderer': join(process.cwd(), 'modules', 'renderer'),
        '@preload': join(process.cwd(), 'modules', 'preload'),
        '@shared': join(process.cwd(), 'modules', 'shared')
      }
    }
  });
};

export const rendererConfig = defineConfig({
  mode,
  base: '',
  root: join(process.cwd(), 'modules', 'renderer'),
  build: {
    minify: PROD,
    outDir: join(process.cwd(), 'dist'),
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@main': join(process.cwd(), 'modules', 'main'),
      '@renderer': join(process.cwd(), 'modules', 'renderer'),
      '@preload': join(process.cwd(), 'modules', 'preload'),
      '@shared': join(process.cwd(), 'modules', 'shared')
    }
  }
});
