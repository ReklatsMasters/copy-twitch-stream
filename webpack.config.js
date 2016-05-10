'use strict'

const path = require('path')
const webpack = require("webpack")

module.exports = {
  entry: path.join(__dirname, 'js/page.js'),
  output: {
    path: path.join(__dirname, 'js'),
    filename: "out.js"
  },
  plugins: [
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false
    //   },
    //   sourceMap: false
    // }),
    new webpack.optimize.DedupePlugin()
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        presets: ["es2015"],
        plugins: [
          "transform-runtime",
          "syntax-async-generators",
          "check-es2015-constants",
          "transform-es2015-block-scoping",
          "transform-es2015-for-of"
        ]
      }
    }]
  }
}
