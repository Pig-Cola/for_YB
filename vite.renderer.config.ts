import path from 'node:path'

import { defineConfig } from 'vite'

import { pluginExposeRenderer } from './vite.base.config'

import type { ConfigEnv, UserConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig( ( env ) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
    },
    plugins: [pluginExposeRenderer( name )],
    resolve: {
      preserveSymlinks: true,
      alias: [{ find: '@', replacement: path.resolve( __dirname, './src/public' ) }],
    },
    clearScreen: false,
  } as UserConfig
} )
