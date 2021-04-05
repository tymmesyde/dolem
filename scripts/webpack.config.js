const path = require('path');
const CreateFileWebpack = require('create-file-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outDir = path.join(__dirname, '../dist');

module.exports = [
    {
        mode: 'production',
        target: 'electron-main',
        entry: {
            main: path.join(__dirname, '../src/main/index.js')
        },
        output: {
            path: outDir,
            filename: 'main.js'
        },
        node: {
            __dirname: false,
        },
        plugins: [
            new CreateFileWebpack({
                path: outDir,
                fileName: 'package.json',
                content: JSON.stringify({
                    main: 'main.js'
                })
            }),
            new CopyWebpackPlugin([{
                from: path.join(__dirname, '../src/main/res'),
                to: path.join(outDir, 'res')
            }])
        ]
    },
    {
        mode: 'production',
        entry: path.join(__dirname, '../src/main/preload.js'),
        target: 'electron-preload',
        output: {
            path: outDir,
            filename: 'preload.js'
        }
    }
];