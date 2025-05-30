const path = require('path');
const common = require('./webpack.common.js');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, 'dist'),
      publicPath: '/',
      serveIndex: true,
      watch: true,
      staticOptions: {
        mimeTypes: { 'json': 'application/manifest+json' },
        extensions: ['json'],
      },
    },
    port: 9013,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
});
