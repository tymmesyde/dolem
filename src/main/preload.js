const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron',
    {
        hideWindow: () => ipcRenderer.invoke('hideWindow'),
        toggleWindow: () => ipcRenderer.invoke('toggleWindow'),
        toggleProxy: arg => ipcRenderer.invoke('toggleProxy', arg),
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
        onBlocked: listener => {
            ipcRenderer.on('onBlocked', (event, payload) => listener(payload));
            ipcRenderer.send('onBlocked');
        }
    }
);