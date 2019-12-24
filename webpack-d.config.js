const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

process.env.NODE_ENV = 'development'

module.exports = {
    entry: [ 'babel-polyfill', './src/index.js' ],
    mode: 'development',

    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            chunks: 'all',
            maxInitialRequests: Infinity,
            minSize: 0,
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name(module) {
                        // https://medium.com/hackernoon/the-100-correct-way-to-split-your-chunks-with-webpack-f8a9df5b7758
                        const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                        return `npm.${packageName.replace('@', '')}`;
                    },
                },
            },
        },
    },

    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    },

    plugins: [
        new HtmlWebpackPlugin({ hash: true, template: './src/index.html' }),
        new CleanWebpackPlugin(),
        new webpack.EnvironmentPlugin(['NODE_ENV']),
        new CopyWebpackPlugin([ 
            { from:'public', to:'public' }
        ])
    ],

    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env', 
                            { 'plugins': ['@babel/plugin-proposal-class-properties'] }
                        ],
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: ['file-loader']
            },
            {
                test: /\.(vs|fs)$/,
                use: 'raw-loader',
            }
        ]
    }
};
