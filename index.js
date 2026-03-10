const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const pvpPlugin = require('mineflayer-pvp').plugin

const config = require('./config')
const utils = require('./utils')

const loadEvents = require('./events')
const loadCommands = require('./commands')
const loadCombat = require('./features/combat')
const loadAutoTpa = require('./features/autoTpa')
const loadAutoEat = require('./features/autoEat')

function startBot() {
  const bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    version: config.version
  })

  bot.loadPlugin(pathfinder)
  bot.loadPlugin(pvpPlugin)

  bot.combatEnabled = true

  loadEvents(bot, config)
  loadCommands(bot, config)
  loadCombat(bot, config)
  loadAutoTpa(bot, config)
  loadAutoEat(bot)

  bot.on('end', () => {
    console.log('🔄 Connection lost. Reconnecting in 5 seconds...')
    utils.clearAllIntervals()
    setTimeout(startBot, config.reconnectDelay)
  })

  bot.on('kicked', reason => console.log('⚠ Kicked:', reason))
  bot.on('error', err => console.log('❌ Error:', err.message))
}

startBot();