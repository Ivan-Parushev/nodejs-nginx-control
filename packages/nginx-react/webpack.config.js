const path = require('path');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const CopyPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: isDevelopment ? 'development' : 'production',
    devServer: {
        stats: 'minimal',
    },
    entry: {
        main: './src/index.tsx',
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: path.join(__dirname, 'src'),
                use: [
                    isDevelopment && {
                        loader: 'babel-loader',
                        options: { plugins: ['react-refresh/babel'] },
                    },
                    {
                        loader: 'ts-loader',
                        options: { transpileOnly: true },
                    },
                ].filter(Boolean),
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    plugins: [
        isDevelopment && new ReactRefreshPlugin(),
        new ForkTsCheckerWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: './index.html',
            template: './public/index.html',
        }),
        // new CopyPlugin({
        //     patterns: [{ from: 'src/assets' }],
        // }),
    ].filter(Boolean),
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
    },
};
