const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

var nodeEnv = process.env.NODE_ENV || 'development'; 
const isProd = nodeEnv === 'production';
var plugins = [
    // new webpack.optimize.CommonsChunkPlugin({
    //     name: 'vendor',
    //     minChunks: Infinity,
    //     filename: 'vendor.js'
    // }),
    new CopyWebpackPlugin([
        { from: 'index.html' },
        { from: 'icon.png' },
        { from: 'icon128.png' },
        { from: 'manifest.json' }
    ]),
    //new webpack.LoaderOptionsPlugin({
    //  minimize: false,
    //  debug: true
    //}),
    new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: JSON.stringify(nodeEnv),
        }
    })
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

console.log(nodeEnv);

module.exports = {
    devtool: isProd ? 'hidden-source-map' : 'source-map',
    context: path.join(__dirname, './src'),
    entry: {
        bundle: './app/main.js',
        content: ['./content/eventConfig.js', './content/events.js', './content/content.js'] ,
        background: './background.js'
        //,
        // vendor: [
        //     'react',
        //     'react-dom',
        //     'rxjs/Subject',
        //     'rxjs/Observable',
        //     'rxjs/add/observable/dom/ajax',
        //     'rxjs/add/operator/mergeMap',
        //     'rxjs/add/operator/merge',
        //     'rxjs/add/operator/map',
        //     'alertify.js/dist/js/alertify']
    },
    output: {
        path: path.join(__dirname, './dest'),
        filename: '[name].js'
    },
    module: {
        loaders: [
          {
              test: /\.html$|\.png$/,
              loader: 'file',
              query: {
                  name: '[name].[ext]'
              }
          },
          {
              test: /\.scss$/,
              loaders: ["style", "css", "sass"]
          },
          {
              test: /\.(js|jsx)$/,
              exclude: /node_modules/,
              loaders: [
                // 'react-hot',
                'babel-loader'
              ]
          },
          {
              test: /\.svg$/,
              loader: 'svg-inline'
          }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
        modules: [
          path.resolve('./src'),
          'node_modules'
        ]
    },
    plugins: plugins
};
