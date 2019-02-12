const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const prefixer = require('autoprefixer');
const { GenerateSW } = require('workbox-webpack-plugin');

//variable
const distDir = path.join(process.cwd(), 'dist');
const swPath = path.join(distDir, 'sw.js');
const cacheId = 'my-cache-id';

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
      cacheId: cacheId,
      swDest: swPath,
      importWorkboxFrom: 'local',
      clientsClaim: true,
      skipWaiting: true,
      globDirectory: './dist/',
      globPatterns: [],
      runtimeCaching: [
        {
          urlPattern: /.+\.(png|gif|jpg|jpeg|svg|webp)$/,
          handler: "staleWhileRevalidate",
          options: {
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 30,
              maxEntries: 20
            },
            cacheName: `${cacheId}-image-cache`,
            cacheableResponse: {
              statuses: [0, 200]
            }
          },
        },
        {
          urlPattern: /.+\.(js|css|woff)$/,
          handler: "staleWhileRevalidate",
          options: {
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 30,
              maxEntries: 50
            },
            cacheName: `${cacheId}-dependent-cache`,
            cacheableResponse: {
              statuses: [0, 200]
            }
          },
        },
        {
          urlPattern: /.+(\/|.html)$/,
          handler: "staleWhileRevalidate",
          options: {
            expiration: {
              maxAgeSeconds: 60 * 60 * 24 * 7,
              maxEntries: 20
            },
            cacheName: `${cacheId}-html-cache`,
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