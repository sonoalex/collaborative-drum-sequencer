// Webpack uses this to work with directories
const path = require('path');
require("babel-polyfill");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


//BACK
const nodeExternals = require('webpack-node-externals');

// This is main configuration object.
// Here you write different options and tell Webpack what to do
const frontConfig= {

  // Path to your entry point. From this file Webpack will begin his work
  entry: ['babel-polyfill' ,'./public/index.js'],

  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'bundle.js',
  },
  watch: true,
  plugins: [
    new MiniCssExtractPlugin()
  ],
  module: {
    rules: [
        {
            test: /\.js$/,
            exclude: 
              [
                /(node_modules)/,
                /(server)/
              ],
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
        },
        {
            test: /\.css$/,
            use: [MiniCssExtractPlugin.loader, 'css-loader']
          }
    ]
  },
  node: {
   fs: "empty"
  },

  // Default mode for Webpack is production.
  // Depending on mode Webpack will apply different things
  // on final bundle. For now we don't need production's JavaScript 
  // minifying and other thing so let's set mode to development
  mode: process.env['NODE_ENV'] || 'development',
};

const backConfig = {
  target: "node",
  entry: {
    app: ['./src/index.js']
  },
  output: {
    path: path.resolve(__dirname, "../back_build"),
    filename: "bundle-back.js"
  },
  externals: [nodeExternals()],
  mode: process.env['NODE_ENV'] || 'development',
};

const testConfig =  {

  entry: './public/test.js',
  // Path and filename of your result bundle.
  // Webpack will bundle all JavaScript into this file
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'test-bundle.js',
  },
};

module.exports = [ frontConfig, backConfig, testConfig];