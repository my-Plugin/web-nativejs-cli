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

let publicPath = "";
const isProduction = true; // 是否是生产环境

publicPath = "/static/assets";
// if (!isProduction) {
//   publicPath = "/static/assets";
// } else {
//   // 将 publicPath 设置为线上发布地址
// }

const html = glob.sync("src/pages/**/*.html").map(path => {
    
  let name = path.replace(HTMLReg, "$2"); // 从路径中提取出文件名
  
  return new HtmlWebpackPlugin({
    template: path,
    filename: name + ".html",
    chunks: ["manifest", 'vender', name],
    chunksSortMode: "dependency",
    inject: true
  });
});

const entries = glob.sync("src/pages/**/*.js").reduce((prev, next) => {
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
    path: path.resolve(__dirname, "dist"), // 打包后项目 输出到项目根目录下 dist 文件夹
    filename: "./js/[name].[hash].js" // 输出的 入口JS文件名称
  },

  // loader 相关配置
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
        exclude: /node_modules/, // 排除不要加载的文件夹
        include: path.resolve(__dirname, "src") // 指定需要加载的文件夹
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192, // 文件体积小于 8192kb 时，将被转为 base64 资源
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
              outputPath: "static/assets/" // 资源 输出路径
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

  // 插件 相关配置
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
    index: "index.html", // 服务器启动的页面（同 html-webpack-plugin 中 filename 选项）; 默认值为 index.html
    host: "localhost", // 指定host; 默认 localhost
    port: 3000, // 指定端口号; 默认 8080

    open: true, // 启动本地服务后，自动打开页面
    compress: true, // 是否启用 gzip 压缩
    overlay: true, // 编译器错误或警告时, 在浏览器中显示全屏覆盖; 默认false
    progress: false, // 是否将运行进度输出到控制台; 默认 false

    contentBase: path.resolve(__dirname, "dist"), // 告诉服务器从哪里提供内容。只有在你想要提供静态文件时才需要

    // 精简 终端输出（本地运行时）
    stats: {
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
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
