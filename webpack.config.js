const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const prefixer = require('autoprefixer');
const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = {
  entry: {
    app: './src/assets/js/index',
  },
  output: {
    path: `${__dirname}/dist`,
    filename: './assets/js/[name].bundle.js',
  },
  devServer: {
    disableHostCheck: true,
  },
  devtool: process.env.NODE_ENV === 'production' ? false : '#eval-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: [
          {
            // loader: process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader,
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                prefixer({ browsers: ['> 0%'] }),
              ],
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              outputStyle: 'compressed',
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(svg|png|jpg|jpeg|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: './assets/images',
            },
          },
        ],
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, './dist/index.html'),
      template: 'ejs-compiled-loader!./src/index.ejs',
    }),

    new CopyWebpackPlugin([{
      from: './src/assets/images/**/*',
      to: './assets/images',
      flatten: true,
    }]),

    new MiniCssExtractPlugin({
      filename: './assets/css/[name].bundle.css',
    }),

    new GenerateSW({
      cacheId: 'cache-v1',
      swDest: 'sw.js',
      importWorkboxFrom: 'local',
      clientsClaim: true,
      skipWaiting: true,
      exclude: [/\.map$/, /^manifest.*\.js(?:on)?$/, /\.html$/],
      runtimeCaching: [
        {
          urlPattern: /\.(png|svg|woff|ttf|eot)/,
          handler: "staleWhileRevalidate",
          options: {
            expiration: {
              maxAgeSeconds: 60 * 60 * 24,
              maxEntries: 20
            },
            cacheName: "images",
            cacheableResponse: {
                statuses: [0, 200]
            }
          },
        },
        {
          urlPattern: /\.(css)/,
          handler: "staleWhileRevalidate",
          options: {
            expiration: {
              maxAgeSeconds: 60 * 60 * 24,
              maxEntries: 20
            },
            cacheName: "css",
            cacheableResponse: {
                statuses: [0, 200]
            }
          },
        },
        {
          urlPattern: /\.(js)/,
          handler: "staleWhileRevalidate",
          options: {
            expiration: {
              maxAgeSeconds: 60 * 60 * 24,
              maxEntries: 20
            },
            cacheName: "js",
            cacheableResponse: {
                statuses: [0, 200]
            }
          },
        }
      ],
    })
  ],

  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 1234,
    historyApiFallback: true,
  },

  resolve: {
    modules: [path.join(__dirname, 'src/assets'), 'node_modules'],
    extensions: ['.js', '.scss', '.css'],
  },
};