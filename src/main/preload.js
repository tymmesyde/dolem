const { contextBridge, ipcRenderer } = require('electron');
const { EventEmitter } = require('events');

const shieldEvents = new EventEmitter();
const ws = new WebSocket('ws://localhost:7777');

ws.onmessage = ({ data }) => {
    const { name, payload } = JSON.parse(data);
    shieldEvents.emit(name, payload);
};

function sendEvent(name, arg) {
    return new Promise(resolve => {
        ipcRenderer.send(name, arg);
        ipcRenderer.on(name, (event, arg) => {
            resolve(arg);
        });
    });
}

contextBridge.exposeInMainWorld('electron',
    {
        hideWindow: () => sendEvent('hideWindow'),
        toggleWindow: () => sendEvent('toggleWindow'),
        toggleProxy: (arg) => sendEvent('toggleProxy', arg),
        onWindowShow: listener => {
            ipcRenderer.on('onWindowShow', listener);
            ipcRenderer.send('onWindowShow');
        },
        onWindowHide: listener => {
            ipcRenderer.on('onWindowHide', listener);
            ipcRenderer.send('onWindowHide');
        }
    }
);

contextBridge.exposeInMainWorld('shield',
    {
        onBlocked: (listener) => shieldEvents.on('blocked', listener)
    }
);