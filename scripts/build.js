const webpack = require('webpack');
const config = require('./webpack.config');

function build() {
    return new Promise((resolve, reject) => {
        webpack(config, (err, stats) => {
            if (err) reject(err);
            resolve(stats);
        });
    });
}

build();