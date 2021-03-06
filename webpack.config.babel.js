import { join } from 'path';
import merge from 'webpack-merge';
// eslint-disable-next-line import/no-extraneous-dependencies
import TerserPlugin from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

const include = join(__dirname, 'src');

const browserConfig = {
  entry: {
    Addon: {
      import: './src/addon',
      filename: 'addon.js',
      library: {
        name: '[name]',
        type: 'var',
      },
    },
    AddonContainer: {
      import: './src/addon-container',
      filename: 'addon-container.js',
      library: {
        name: '[name]',
        type: 'var',
      },
    },
  },
  output: {
    path: join(__dirname, 'dist'),
  },
  optimization: {
    minimize: false,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
      }),
    ],
  },
  mode: 'production',
  module: {
    rules: [
      { test: /\.js$/, loader: 'babel-loader', include },
    ],
  },
};

const browserMinifiedConfig = merge(browserConfig, {
  devtool: 'source-map',
  entry: {
    Addon: {
      filename: 'addon.min.js',
    },
    AddonContainer: {
      filename: 'addon-container.min.js',
    },
  },
  optimization: {
    minimize: true,
  },
});

const commonJsConfig = merge(browserConfig, {
  entry: {
    Addon: {
      library: {
        type: 'commonjs',
      },
    },
    AddonContainer: {
      library: {
        type: 'commonjs',
      },
    },
  },
  plugins: [
    // Have eslint here so it only run once instead of once for each build config
    new ESLintPlugin(),
  ],
  output: {
    path: join(__dirname, 'lib'),
  },
});

module.exports = [browserConfig, browserMinifiedConfig, commonJsConfig];
