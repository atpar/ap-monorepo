const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  output: {
    filename: 'ap.umd.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'AP',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'inline-source-map',
  plugins: [ 
    // new BundleAnalyzerPlugin()
  ],
  optimization: {
    minimizer: [ new TerserPlugin() ]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
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
