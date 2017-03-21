module.exports = {
  entry: ["babel-polyfill", "./src/index.js"],
  output: {
    path: __dirname,
    filename: "./build/bundle.js"
  },
  resolve: {
    extensions: [".js", ".json"]
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: "style-loader!css-loader",
    }, {
      test: /\.js?$/,
      exclude: /node_modules/,
      //loaders: ["babel-loader"],
    }]
  }
};
