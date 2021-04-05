const path = require('path');
const packager = require('electron-packager');

function package() {
    return packager({
        dir: 'dist',
        out: 'out',
        overwrite: true,
        asar: true,
        name: 'Dolem',
        icon: path.join(__dirname, '../dist/res/icon.ico')
    });
}

package();