const http = require("http");
const url = require("url");
const net = require('net');
const httpProxy = require('http-proxy');
const axios = require('axios');
const WebSocket = require('ws');
const { WS_PORT, PROXY_PORT } = require('./config');

const lists = {
    adaway: 'https://raw.githubusercontent.com/hectorm/hmirror/master/data/adaway.org/list.txt',
    easylist: 'https://raw.githubusercontent.com/hectorm/hmirror/master/data/easylist/list.txt',
    easyprivacy: 'https://raw.githubusercontent.com/hectorm/hmirror/master/data/easyprivacy/list.txt',
    ublock: 'https://raw.githubusercontent.com/hectorm/hmirror/master/data/ublock/list.txt'
};

const wss = new WebSocket.Server({
    port: WS_PORT
});

let blacklist;

const server = http.createServer((req, res) => {
    const { hostname, protocol, host } = url.parse(req.url);
    const target = `${protocol}//${host}`;

    const proxy = httpProxy.createProxyServer({});
    proxy.on("error", (err, req, res) => {
        console.log("proxy error", err);
        res.end();
    });

    if (blacklist.find(l => l === hostname)) {
        console.log('Blacklisted !');
        wss.sendEvent('blocked', { hostname });
        res.destroy();
    }

    proxy.web(req, res, {
        target: target
    });
});

server.on('connect', (req, socket, bodyhead) => {
    const { port, hostname } = url.parse(`https://${req.url}`);

    if (blacklist.find(l => l === hostname)) {
        console.log('Blacklisted !');
        wss.sendEvent('blocked', { hostname });
        socket.destroy();
        return;
    }

    const proxySocket = new net.Socket();
    proxySocket.connect(port, hostname, () => {
        proxySocket.write(bodyhead);
        socket.write("HTTP/" + req.httpVersion + " 200 Connection established\r\n\r\n");
    });

    proxySocket.on('data', chunk => {
        socket.write(chunk);
    });

    proxySocket.on('end', () => {
        socket.end();
    });

    proxySocket.on('error', () => {
        socket.write("HTTP/" + req.httpVersion + " 500 Connection error\r\n\r\n");
        socket.end();
    });

    socket.on('data', chunk => {
        proxySocket.write(chunk);
    });

    socket.on('end', () => {
        proxySocket.end();
    });

    socket.on('error', () => {
        proxySocket.end();
    });
});

wss.on('connection', ws => {
    ws.on('message', message => {
        console.log('received: %s', message);
    });
});

WebSocket.Server.prototype.sendEvent = function(name, payload) {
    const event = {
        name,
        payload
    };
    this.clients.forEach(c => c.send(JSON.stringify(event)));
}

async function start() {
    blacklist = [...new Set(((await Promise.all(Object.values(lists).map(async url => {
        const { data } = await axios.get(url);
        return data.split('\n');
    }))).flat()))];

    server.listen(PROXY_PORT);
}

function stop() {
    server.close();
}

module.exports = {
    start,
    stop
};