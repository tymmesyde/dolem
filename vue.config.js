module.exports = {
    outputDir: 'dist/renderer',
    pages: {
        index: {
            title: 'Dolem',
            entry: 'src/renderer/main.js',
            template: 'src/public/index.html'
        }
    },
    css: {
        loaderOptions: {
            sass: {
                additionalData: `
                    @import "src/renderer/assets/styles/variables.scss";
                `
            }
        }
    },
    chainWebpack: config => {
        config.module
            .rule('vue')
            .use('vue-loader')
            .tap(options => ({
                ...options,
                compilerOptions: {
                    isCustomElement: (tag) => tag === 'ion-icon'
                }
            }));
    }
};