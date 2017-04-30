module.exports = {
  entry: './src/app.ts',
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      { test: /.tsx?$/, loader: 'awesome-typescript-loader' },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' }
    ]
  }
}
