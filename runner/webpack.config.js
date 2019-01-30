const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

var nodeModules = {
    './config.json': 'commonjs ./config.json'
};

var plugins = [
    new CopyWebpackPlugin([
        { from: 'config.json' },
        { from: '../drivers/chromedriver.exe' }//,
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

module.exports = {
    //devtool: isProd ? 'hidden-source-map' : 'source-map',
    context: path.join(__dirname, './src'),
    target: 'node',
    entry: {
        runner: ['./runner.ts'],
        testRunner: './test-runner.ts'
    },
    output: {
        path: path.join(__dirname, './dest'),
        filename: '[name].js'
    },
    externals: nodeModules,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.json' ],
        modules: [
            path.resolve('./src'),
            'node_modules'
        ]
    },
    plugins: plugins
};
