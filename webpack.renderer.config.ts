import path from 'path'

import { plugins } from './webpack.plugins'
import { rules } from './webpack.rules'

import type { Configuration } from 'webpack'

rules.push( {
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
} )

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css'],
    alias: {
      '@': path.resolve( __dirname, './src/public' ),
    },
  },
}
