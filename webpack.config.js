require("dotenv").config();
const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"], // Add file extensions to resolve
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.tsx?$/, // Match .ts and .tsx files
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/, // For CSS files
        use: [
          "style-loader",
          "css-loader",
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  require("@tailwindcss/postcss"),
                  require("autoprefixer"),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  devServer: {
    historyApiFallback: true,
    static: path.resolve(__dirname, "public"),
    port: 3000,
    hot: true,
  },
  mode: "development",
  plugins: [
    new webpack.DefinePlugin({
      "process.env.REACT_APP_BACKEND_URL": JSON.stringify(
        process.env.REACT_APP_BACKEND_URL || "",
      ),
      "process.env.REACT_APP_GRAPHQL_BACKEND_URL": JSON.stringify(
        process.env.REACT_APP_GRAPHQL_BACKEND_URL || "",
      ),
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    }),
  ],
};
