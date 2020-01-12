const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const webpack = require('webpack')

const resolve = (_path) => path.resolve(__dirname, _path)

module.exports = {
    mode: 'development',
    entry: [
        'webpack-hot-middleware/client?noInfo=true&reload=true' , resolve('src')
    ],
    output: {
        path: resolve('dist'),
        filename: '[name].bundle.js',
        publicPath: '/'
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: [
            '.ts', '.js', '.sass', '.css'
        ],
        alias: {
            '@': resolve('src'),
            'helper': resolve('src/helper'),
            'core': resolve('src/core'),
            'public': resolve('src/public'),
            'style': resolve('src/style')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                enforce: 'pre', //  加载器的执行顺序，不设置为正常执行。可选值 'pre | post' (前 | 后)
                use: [
                    {
                        loader: 'tslint-loader'
                    }
                ]
            },
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use:[
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]'
                }
            },
            {
                test: /\.(png|jpg|gif)$/i,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 1024,
                            name: 'public/images/[name].[hash:7].[ext]'
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Canvas',
            template: './index.html'
        }),
        new CleanWebpackPlugin(),
        // OccurrenceOrderPlugin is needed for webpack 1.x only
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        // Use NoErrorsPlugin for webpack 1.x
        new webpack.NoEmitOnErrorsPlugin()
    ]
}