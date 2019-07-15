const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MinicssExtractPlugin = require("mini-css-extract-plugin");
const Optimizecss = require("optimize-css-assets-webpack-plugin");
const PurifycssPlugin = require("purifycss-webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const glob = require("glob");
glob.sync("src/pages/**/*.html");

const HTMLReg = /(.*\/)*([^.]+).html/;
const JSReg = /(.*\/)*([^.]+).js/;

let publicPath = "/static/assets";

let htmlNames = [];
const html = glob.sync("src/pages/**/*.html").map(path => {
  let name = path.replace(HTMLReg, "$2");
  htmlNames.push(name);
  return new HtmlWebpackPlugin({
    template: path,
    filename: name + ".html",
    chunks: ["manifest", 'vender', name],
    chunksSortMode: "dependency",
    inject: true
  });
});
const entries = glob.sync("src/pages/**/*.js").filter(path => {
  const fileName = path.replace(JSReg, "$2");
  return htmlNames.includes(fileName)
}).reduce((prev, next) => {
  let name = next.replace(JSReg, "$2");
  prev[name] = "./" + next;
  return prev;
}, {});
module.exports = {
  mode: "production",
  devtool: '#source-map',
  entry: entries,
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "./js/[name].[hash].js"
  },

  module: {
    rules: [
      {
        test: /\.(htm|html)$/,
        use: [
          {
            loader: "html-withimg-loader"
          }
        ]
      },
      {
        test: /\.css$/,
        use: [MinicssExtractPlugin.loader, "css-loader", "postcss-loader"]
      },
      {
        test: /\.scss$/,
        use: [
          MinicssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "sass-loader"
        ]
      },
      {
        test: /\.less$/,
        use: [
          MinicssExtractPlugin.loader,
          "css-loader",
          "postcss-loader",
          "less-loader"
        ]
      },
      {
        test: /\.js$/,
        use: ["babel-loader"],
        exclude: /node_modules/,
        include: path.resolve(__dirname, "src")
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10240,
              name: "[name].[ext]",
              outputPath: "static/assets/",
              publicPath
            }
          }
        ]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "static/assets/"
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              name: "[name].[ext]",
              outputPath: "static/assets/" // 资源 输出路径
            }
          }
        ]
      }
    ]
  },

  plugins: [
    ...html,
    // 分离 css
    new MinicssExtractPlugin({
      filename: "static/css/[name].[hash:7].css"
    }),
    // 压缩分离后的 css
    new Optimizecss(),
    // 净化 css
    new PurifycssPlugin({
      paths: glob.sync(path.join(__dirname, "src/**/*.html"))
    }),
    // build时删除dist目录
    new CleanWebpackPlugin()
  ],

  devServer: {
    index: "index.html",
    host: "0.0.0.0",
    port: 3000,
    open: true,
    compress: true,
    overlay: true,
    progress: false,
    contentBase: path.resolve(__dirname, "dist"),
    // stats: "normal"
    stats: {
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false,
      entrypoints: false
    }
  },
  optimization: {
    runtimeChunk: {
      name: "manifest"
    },
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vender',
          chunks: "all"
        }
      }
    }
  }
};
