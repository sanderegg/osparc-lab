var path = require('path');
var webpack = require('webpack');
var vtkRules = require('vtk.js/Utilities/config/dependency.js').webpack.v2.rules;

var entry = path.join(__dirname, './src/vtkreader.js');
const sourcePath = path.join(__dirname, './src');
const outputPath = path.join(__dirname, './dist');
loaders: [{
  test: /\.(gif|png|jpe?g|svg)$/i,
  use: [
    'file-loader',
    {
      loader: 'image-webpack-loader',
      options: {
        bypassOnDebug: true,
      },
    },
  ],
}]
module.exports = {
  entry,
  output: {
    path: outputPath,
    filename: 'MyWebApp.js',
  },
  devServer: {
    port: 6001,
    host: '0.0.0.0',
  },
  //devtool: 'source-map',
  module: {
    rules: [
        { test: entry, loader: "expose-loader?MyWebApp" },
        { test: /\.html$/, loader: 'html-loader' },
        { test:/\.(css|mcss)$/, use:['style-loader','css-loader'] },
        { test: /\.(gif|png|jpe?g|svg)$/i, use: [ 'file-loader', { loader: 'image-webpack-loader', options: { bypassOnDebug: true, }, }, ], }
    ].concat(vtkRules),    
  },  
  resolve: {
    modules: [
      path.resolve(__dirname, 'node_modules'),
      sourcePath,
    ],
  },
};