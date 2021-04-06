const http = require('http');
const url = require('url');
const net = require('net');
const util = require('util');
const httpProxy = require('http-proxy');
const axios = require('axios');
const { EventEmitter } = require('events');
const proxySettings = require('proxy-settings-manager');

class Shield extends EventEmitter {

    constructor(port, blocklist) {
        super();

        this.port = port;
        this.blocklist = blocklist;
        this.hostslist = [];
        this.wss = null;
        this.server = null;
    }

    async _createHostsList() {
        return [...new Set(((await Promise.all(Object.values(this.blocklist).map(async url => {
            const { data } = await axios.get(url);
            return data.split('\n');
        }))).flat()))];
    }

    _handleHttpRequest(req, res) {
        const { hostname, protocol, host } = url.parse(req.url);
        const target = `${protocol}//${host}`;

        this._destroyIfBlacklisted(res, hostname);

        const proxy = httpProxy.createProxyServer({});
        proxy.on('error', (err, req, res) => res.end());

        proxy.web(req, res, {
            target
        });
    }

    _handleHttpsRequest(req, socket, bodyhead) {
        const { port, hostname } = url.parse(`https://${req.url}`);

        this._destroyIfBlacklisted(socket, hostname);

        const proxySocket = new net.Socket();

        proxySocket.connect(port, hostname, () => {
            proxySocket.write(bodyhead);
            socket.write(`HTTP/${req.httpVersion} 200 Connection established\r\n\r\n`);
        });

        proxySocket.on('data', chunk => socket.write(chunk));
        proxySocket.on('end', () => socket.end());

        proxySocket.on('error', () => {
            socket.write(`HTTP/${req.httpVersion} 500 Connection error\r\n\r\n`);
            socket.end();
        });

        socket.on('data', chunk => proxySocket.write(chunk));
        socket.on('end', () => proxySocket.end());
        socket.on('error', () => proxySocket.end());
    }

    _destroyIfBlacklisted(stream, hostname) {
        if (this.hostslist.includes(hostname)) {
            this.emit('blocked', { hostname });
            stream.destroy();
        }
    }

    async start() {
        this.hostslist = await this._createHostsList();

        this.server = http.createServer(this._handleHttpRequest.bind(this));
        this.server.on('connect', this._handleHttpsRequest.bind(this));
        this.server.listen(this.port);
    }

    stop() {
        return util.promisify(this.server.close);
    }

    async activate() {
        const proxyUrl = `http://localhost:${this.port}`;

        await proxySettings.setHttp(proxyUrl);
        await proxySettings.setHttps(proxyUrl);
    }

    async disable() {
        await proxySettings.remove();
    }

}

module.exports = Shield;