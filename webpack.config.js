require("dotenv").config();
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src", "index.tsx"),
  output: {
    // Hashed, so a deploy cannot serve last week's JavaScript out of a CDN
    // cache. The HTML is generated with the right name, so nothing has to
    // reference these by hand.
    filename: "[name].[contenthash:8].js",
    chunkFilename: "[name].[contenthash:8].chunk.js",
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
    // Deliberately no `static: public`. It used to serve public/index.html
    // verbatim, which shadowed the one HtmlWebpackPlugin generates - and that
    // template no longer carries a script tag, so the dev server handed back a
    // page with no JavaScript in it. CopyWebpackPlugin puts the same files in
    // the output, which the dev server serves from memory.
    port: 3000,
    hot: true,
  },
  plugins: [
    // NODE_ENV is deliberately not defined here: webpack's `mode` already
    // defines it, and defining it twice made the two collide so React was
    // bundled in development mode even for a production build.
    new webpack.DefinePlugin({
      "process.env.REACT_APP_BACKEND_URL": JSON.stringify(
        process.env.REACT_APP_BACKEND_URL || "",
      ),
      "process.env.REACT_APP_GRAPHQL_BACKEND_URL": JSON.stringify(
        process.env.REACT_APP_GRAPHQL_BACKEND_URL || "",
      ),
      // Mapbox's *public* token (pk.), which every web map exposes by
      // design — there is no way to draw tiles in a browser without one. It
      // is protected by a URL restriction set on the token in the Mapbox
      // account, not by hiding it. A secret token (sk.) must never be
      // defined here: those can edit styles, read the account and mint more
      // tokens. Absent, the app simply does not offer a map.
      "process.env.REACT_APP_MAPBOX_TOKEN": JSON.stringify(
        process.env.REACT_APP_MAPBOX_TOKEN || "",
      ),
    }),

    // Without this the build emitted JavaScript and no page at all. It worked
    // locally only because the dev server serves `public/` alongside it; a
    // static host gets the bundles and nothing to load them.
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      favicon: path.resolve(__dirname, "public", "favicon.ico"),
    }),

    // Everything else in `public/` that the HTML does not reference itself:
    // the manifest and the icons. Client-side routing is handled by
    // `not_found_handling` in wrangler.jsonc, not by a `_redirects` file -
    // Workers validates that file strictly and reads `/* /index.html 200` as a
    // rule that redirects to itself forever.
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
          to: path.resolve(__dirname, "dist"),
          globOptions: { ignore: ["**/index.html", "**/favicon.ico"] },
        },
      ],
    }),
  ],
};
