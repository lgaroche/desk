const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const path = require('path')
const webpack = require('webpack')

const analyze = !!process.env.ANALYZE_ENV
const env = process.env.NODE_ENV || 'development'

const webpackConfig = {
  name: 'client',
  target: 'web',

  entry: {
    app: path.resolve('src/index.js'),
  },

  module: {
    rules: [{
      test: /\.(js|jsx)$/,
      exclude: /(node_modules|forge)/,
      loaders: ['babel-loader?presets=react'], //, 'imports-loader?define=false'

    }, {
      test: /\.css$/,
      use: [
        {loader: 'style-loader'},
        {loader: 'css-loader'}
      ]
    }, {
      test: /\.(jpg|png|webp|gif|otf|ttf|woff|woff2|cur|ani|svg|eot)$/,
      loader: 'url-loader?name=[name].[ext]' //?name=[name].[hash:20].[ext]&limit=10000'
    },
    {
      test: /\.(html|htm)$/,
      loader: 'html-loader'
    }
  ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(env),
      },
    })
  ],

  output: {
    filename: '[name].js',
    path: path.resolve('public/dist'),
    publicPath: '/',
  },

  devtool: "source-map",

  resolve: {
    modules: [
      path.resolve('src'),
      'node_modules',
    ],
    alias: {
      forge: 'forge.js'
    },
    extensions: ['.js', '.jsx'],
  },

}

if (analyze) {
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

if (env === 'production') {
  webpackConfig.plugins.push(
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false,
      },
    })
  )
}

module.exports = webpackConfig
