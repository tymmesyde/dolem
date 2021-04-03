const path = require('path');
const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage, dialog  } = require('electron');
const AutoLaunch = require('auto-launch');
const serve = require('electron-serve');
const proxySettings = require('proxy-settings-manager');
const Positioner = require('electron-positioner')
const server = require('./server.js');
const { APP_NAME, PROXY_PORT } = require('./config');

const args = process.argv.slice(1),
    dev = args.some(val => val === '--dev');

const autoLauncher = new AutoLaunch({
    name: APP_NAME
});

serve({ scheme: 'dolem', directory: path.join(__dirname, 'dist') });

const icon = nativeImage.createFromPath(path.resolve(__dirname, '../public/favicon.ico'));

const proxyUrl = `http://localhost:${PROXY_PORT}`;
let win, notifications, tray = null;

function createWindow() {
    win = new BrowserWindow({
        height: 530,
        width: 350,
        resizable: false,
        movable: false,
        maximizable: false,
        icon,
        transparent: true,
        frame: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    win.setMenu(null);
    win.on('close', event => event.preventDefault());

    const url = dev ? 'http://localhost:9000' : 'dolem://-';
    win.loadURL(url);

    if (dev) {
        try {
            require('electron-reloader')(module, {
                watchRenderer: false
            });
        } catch (_) {}
        
        win.webContents.openDevTools();
    }
}

function createNotifications() {
    notifications = {
        on: new Notification({
            title: APP_NAME,
            icon,
            body: 'Protected'
        }),
        off: new Notification({
            title: APP_NAME,
            icon,
            body: 'Disabled'
        })
    };
}

function createTray() {
    tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click: async () => {
                const { response } = await warnBeforeQuit();
                if (response === 0) {
                    await proxySettings.remove();
                    server.stop();
                    notifications.off.show();
                    app.exit();
                }
            }
        }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => toggleWindow());
}

function setPosition() {
    const positioner = new Positioner(win);
    positioner.move('bottomRight');
}

function toggleWindow() {
    if (!win.isVisible()) {
        setPosition();
        win.show();
    } else win.close();
}

function warnBeforeQuit() {
    return dialog.showMessageBox(win, {
        type: 'warning',
        title: APP_NAME,
        message: `Are you sure ?`,
        detail: `Quitting ${APP_NAME} will remove the shield protection.`,
        buttons: ['Yes', 'Cancel'],
        defaultId: 1,
        cancelId: 1
    });
}

app.whenReady().then(createNotifications).then(server.start).then(createWindow).then(createTray).then(setPosition);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

ipcMain.on('toggleProxy', async (event, state) => {
    if (state) {
        await proxySettings.setHttp(proxyUrl);
        await proxySettings.setHttps(proxyUrl);

        notifications.on.show();
    } else {
        await proxySettings.remove();

        notifications.off.show();
    }
    
    event.reply('toggleProxy', state);
})

ipcMain.on('toggleAutoLaunch', async (event, state) => {
    state ? autoLauncher.enable() : autoLauncher.disable();
    event.reply('toggleAutoLaunch', state);
})

ipcMain.on('toggleWindow', () => toggleWindow());
ipcMain.on('hideWindow', () => win.hide());
ipcMain.on('onWindowShow', (event) => win.on('show', () => event.sender.send('onWindowShow')));
ipcMain.on('onWindowHide', (event) => win.on('close', () => event.sender.send('onWindowHide')));