module.exports = {
  entry: ["./src/index.js"],
  devtool: "source-map",
  mode: "development",
  output: {
    path: __dirname,
    filename: "./build/bundle.js",
  },
  resolve: {
    extensions: [".js"],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
