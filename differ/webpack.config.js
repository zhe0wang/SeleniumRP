const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

var plugins = [
    new CopyWebpackPlugin([
        { from: './config.js', to: '.' },
        { from: './package.json', to: '.'  },
        { from: './app/app.css', to: '.' },
        { from: './app/index.html', to: '.' }
    ])
];

if (isProd) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            output: {
                comments: false
            },
            sourceMap: false
    }));
}

var fs = require('fs');

var nodeModules = {
    './config.js': 'commonjs ./config.js'
};

// fs.readdirSync('node_modules')
//     .filter(function(x) {
//     return ['.bin'].indexOf(x) === -1;
//     })
//     .forEach(function(mod) {
//     nodeModules[mod] = 'commonjs ' + mod;
//     });

console.log(nodeEnv);

module.exports = {
    devtool: isProd ? 'hidden-source-map' : 'source-map',
    context: __dirname,
    target: 'node',
    entry: {
        index: './index.js',
        app: './app/app.js'
    },
    output: {
        path: path.join(__dirname, './dest'),
        filename: '[name].js'
    },
    externals: nodeModules,
    module: {
        loaders: [
            { test: /\.json$/, loader: "json-loader" },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                query: {
                    presets: ["es2015"]
                }
            },
        ],
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
