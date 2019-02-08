const homedir = require('os').homedir();
const Server = require('scuttlebot-release');
const config = require('ssb-config');
const ssbkeys = require('ssb-keys');

const keys = ssbkeys.loadOrCreateSync(homedir + '/.ssb/secret');
console.log(keys);
Server.use(require('ssb-server/plugins/master'))
    .use(require('ssb-gossip'))
    .use(require('ssb-replicate'))
    .use(require('ssb-backlinks'))
    .use(require('ssb-friends'))
    .use(require('ssb-about'));



const server = Server(config);
const manifest = server.getManifest();

// console.log(server)

// fs.writeFileSync(path.join(config.path, 'manifest.json'), JSON.stringify(manifest));

server.whoami((err, feed) => {
    console.log(feed);
});

