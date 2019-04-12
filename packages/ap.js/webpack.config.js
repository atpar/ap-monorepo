const path = require('path');
// const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, './dist/esm/index.js')
  },
  output: {
    path: path.resolve(__dirname, './dist/umd'),
    filename: '[name].js',
    library: 'AP',
    libraryTarget: 'umd',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    umdNamedDefine: true
  },
  plugins: [],
  optimization: {
    // minimizer: [ new TerserPlugin() ]
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: true,
            declarationMap: true,
            composite: false
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [ '.ts', '.js', '.json' ]
  }
};
