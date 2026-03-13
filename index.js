const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
const pvpPlugin = require('mineflayer-pvp').plugin;

const config = require('./config');
const utils = require('./utils');
const loadEvents = require('./events');
const loadCommands = require('./commands');

const loadCombat = require('./features/combat');
const loadAutoTpa = require('./features/autoTpa');
const loadAutoEat = require('./features/autoEat');


async function pingServer(host, port = 25565, timeoutMs = 5000) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      socket.destroy();
      resolve({ online: false, reason: 'Timeout' });
    }, timeoutMs);

    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      if (timedOut) return;

      const handshake = Buffer.from([
        0x00,
        0x04, 0x09, 0xFE, 0x01,
        host.length, ...Buffer.from(host),
        port >> 8, port & 0xFF,
        0x01
      ]);

      const statusRequest = Buffer.from([0x01, 0x00]);

      socket.write(handshake);
      socket.write(statusRequest);
    });

    let data = Buffer.alloc(0);
    socket.on('data', (chunk) => {
      data = Buffer.concat([data, chunk]);
      if (data.length > 5 && data[0] > 0) {
        clearTimeout(timeout);
        socket.destroy();
        resolve({ online: true });
      }
    });

    socket.on('error', () => {
      clearTimeout(timeout);
      socket.destroy();
      resolve({ online: false, reason: 'Connection error' });
    });

    socket.on('close', () => {
      clearTimeout(timeout);
      if (!timedOut && data.length === 0) {
        resolve({ online: false, reason: 'No response' });
      }
    });
  });
}

async function createAndStartBot(serverConfig) {
  const fullConfig = { ...config.common, ...serverConfig };
  const nickname = fullConfig.nickname || fullConfig.username;

  console.log(`[${nickname}] Checking server status...`);

  const pingResult = await pingServer(fullConfig.host, fullConfig.port || 25565);

  if (!pingResult.online) {
    console.log(`[\( {nickname}] Server appears OFFLINE ( \){pingResult.reason || 'unknown'}). Skipping.`);
    return;
  }

  console.log(`[${nickname}] Server is online. Starting bot as ${fullConfig.username}...`);

  const bot = mineflayer.createBot({
    host: fullConfig.host,
    port: fullConfig.port || 25565,
    username: fullConfig.username,
    version: fullConfig.version,
    checkTimeoutInterval: 60000,
  });

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(pvpPlugin);

  bot.serverNickname = nickname;
  bot.combatEnabled = fullConfig.features?.combat ?? true;

  const originalLog = console.log;
  console.log = (...args) => originalLog(`[${nickname}]`, ...args);

  loadEvents(bot, fullConfig);
  loadCommands(bot, fullConfig);

  if (fullConfig.features?.autoTpa ?? config.common.features.autoTpa) {
    loadAutoTpa(bot, fullConfig);
  }
  if (fullConfig.features?.autoEat ?? config.common.features.autoEat) {
    loadAutoEat(bot);
  }
  if (fullConfig.features?.combat ?? config.common.features.combat) {
    loadCombat(bot, fullConfig);
  }

  bot.on('end', () => {
    console.log('Connection lost. Reconnecting in 5 seconds...');
    utils.clearAllIntervals();
    setTimeout(() => createAndStartBot(serverConfig), fullConfig.reconnectDelay);
  });

  bot.on('kicked', reason => console.log('Kicked:', reason));
  bot.on('error', err => console.log('Error:', err.message));
}

async function startAllBots() {
  for (let i = 0; i < config.servers.length; i++) {
    await createAndStartBot(config.servers[i]);
    if (i < config.servers.length - 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startAllBots().catch(err => console.error('Startup error:', err));