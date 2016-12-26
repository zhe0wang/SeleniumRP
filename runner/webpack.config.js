const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';

const isProd = nodeEnv === 'production';

var presents = isProd ? ["es2015", "stage-3", "babili"] : ["es2015", "stage-3"];

var fs = require('fs');

var nodeModules = {
    './config.js': 'commonjs ./config.js'
};

var plugins = [
    new CopyWebpackPlugin([
        { from: 'config.js' },
        { from: '../drivers/chromedriver.exe'}//,
        //{ from: '../drivers/IEDriverServer.exe'},
        //{ from: '../drivers/MicrosoftWebDriver.exe'}
    ])//,
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     minChunks: Infinity
    // }),
    // new webpack.DefinePlugin({
    //     'process.env': { NODE_ENV: JSON.stringify(nodeEnv) }
    // })
];

// isProd && plugins.push(new webpack.optimize.UglifyJsPlugin({
//         compress: {
//             warnings: false
//         },
//         output: {
//             comments: false
//         },
//         sourceMap: false
// }));

console.log(nodeEnv);

module.exports = {
    //devtool: isProd ? 'hidden-source-map' : 'source-map',
    context: path.join(__dirname, './src'),
    target: 'node',
    entry: {
        runner: ['./runner.js'],
        testRunner: './testRunner.js'
    },
    output: {
        path: path.join(__dirname, './dest'),
        filename: '[name].js'
    },
    externals: nodeModules,
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: presents,
                    plugins: ["transform-runtime"]
                }
            }
        ]
    },
    resolve: {
        extensions: ['', '.js'],
        modules: [
          path.resolve('./src'),
          'node_modules'
        ]
    },
    plugins: plugins
};
