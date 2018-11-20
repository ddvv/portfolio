const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const config = {
    entry: {
        about: './src/scripts/about.js',
        auth: './src/scripts/auth.js',
        works: './src/scripts/works.js',
        blog: './src/scripts/blog.js',
    },
    output: {
        filename: '[name].bandle.js'
    },
    plugins: [
        new UglifyJSPlugin({
            sourceMap: true
        })
    ]
};

module.exports = config;