const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, './server.js')
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].js'
  },
  plugins: [],
  devtool: 'source-map',
  target: 'node',
  node: {
    __dirname: false,
    __filename: false
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.csv$/i,
        use: 'raw-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.csv', '.js', '.json' ]
  }
}