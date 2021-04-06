const path = require('path');
const { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage, dialog  } = require('electron');
const AutoLaunch = require('auto-launch');
const serve = require('electron-serve');
const Positioner = require('electron-positioner')

const Shield = require('./shield.js');
const { APP_NAME, WS_PORT, PROXY_PORT, BLOCKLIST } = require('./config');

const { dev, port } = require('minimist')(process.argv.slice(2));
const loadURL = serve({ scheme: 'dolem', directory: path.join(app.getAppPath(), 'renderer') });
const icon = nativeImage.createFromPath(path.resolve(__dirname, 'res/icon.ico'));

const autoLauncher = new AutoLaunch({
    name: APP_NAME
});

app.setAppUserModelId(APP_NAME);

let win, notifications, tray = null;
const shield = new Shield(PROXY_PORT, BLOCKLIST);

async function createWindow() {
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

    dev ? win.loadURL(`http://localhost:${port}`) : await loadURL(win);

    if (dev) {
        try {
            require('electron-reloader')(module, {
                watchRenderer: false
            });
        } catch (_) {}
        
        win.webContents.openDevTools();
    } else {
        autoLauncher.enable();
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
                    await shield.disable();
                    await shield.stop();

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

function createIpcEvents() {
    ipcMain.on('toggleProxy', async (event, state) => {
        if (state) {
            await shield.activate();
            notifications.on.show();
        } else {
            await shield.disable();
            notifications.off.show();
        }

        event.reply('toggleProxy', state);
    });

    ipcMain.on('toggleWindow', () => toggleWindow());
    ipcMain.on('hideWindow', () => win.hide());
    ipcMain.on('onWindowShow', (event) => win.on('show', () => event.sender.send('onWindowShow')));
    ipcMain.on('onWindowHide', (event) => win.on('close', () => event.sender.send('onWindowHide')));
}

app.whenReady()
    .then(createIpcEvents)
    .then(createNotifications)
    .then(shield.start(WS_PORT))
    .then(createWindow)
    .then(createTray)
    .then(setPosition);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});