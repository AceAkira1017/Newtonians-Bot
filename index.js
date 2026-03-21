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

async function createAndStartBot(serverConfig) {
  const fullConfig = { ...config.common, ...serverConfig };
  const nickname = fullConfig.nickname || fullConfig.username;

  console.log(`[${nickname}] Starting bot as ${fullConfig.username}...`);

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

config.servers.forEach((server, index) => {
  setTimeout(() => {
    createAndStartBot(server);
  }, index * 3000); 
});