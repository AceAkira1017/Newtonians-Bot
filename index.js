const mineflayer = require('mineflayer')

const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const pvp = require('mineflayer-pvp').plugin

const mcDataLoader = require('minecraft-data')

// ===== CONFIG =====

const CONFIG = {

host: 'Newtonians-S1.aternos.me',

port: 13207,

username: 'Akiii',

version: '1.16.5',

password: 'Kai172309',

owner: 'itzmeac31017',

reconnectDelay: 5000,

antiAfkInterval: 20000,

enableAutoChat: true

}

// ==================

function startBot() {

const bot = mineflayer.createBot({

host: CONFIG.host,

port: CONFIG.port,

username: CONFIG.username,

version: CONFIG.version

})

bot.loadPlugin(pathfinder)

bot.loadPlugin(pvp)

let intervals = []

let combatEnabled = true

function addInterval(fn, time) {

const id = setInterval(fn, time)

intervals.push(id)

}

function clearIntervals() {

intervals.forEach(clearInterval)

intervals = []

}

bot.once('spawn', () => {

console.log('✅ Bot Spawned')

const mcData = mcDataLoader(bot.version)  

const movements = new Movements(bot, mcData)  

bot.pathfinder.setMovements(movements)  

// Auto register & login  

setTimeout(() => {  

  bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`)  

  bot.chat(`/login ${CONFIG.password}`)  

}, 2000)  

// ===== Anti AFK Movement =====  

addInterval(() => {  

  const actions = ['jump', 'forward', 'back']  

  const action = actions[Math.floor(Math.random() * actions.length)]  

  bot.setControlState(action, true)  

  setTimeout(() => bot.setControlState(action, false), 1000)  

  const yaw = Math.random() * Math.PI * 2  

  const pitch = (Math.random() - 0.5) * 0.4  

  bot.look(yaw, pitch, true)  

}, CONFIG.antiAfkInterval)  

// ===== Auto Chat (Safe Random) =====  

if (CONFIG.enableAutoChat) {  

  addInterval(() => {  

    const messages = [  

      "afk ako boi",  

      "mining ta",  

      "brb guys",  

      "lag ba?",  

      "anyone online?",  

      "grinding xp",  

      "its farm time",  

      "may kayo ba?",  

      "ako lang mareject ha!",  

      "crush kaba ng crush mo?"  

    ]  

    const msg = messages[Math.floor(Math.random() * messages.length)]  

    bot.chat(msg)  

  }, 120000 + Math.random() * 120000) // 2-4 mins  

}

})

// ===== OWNER COMMANDS =====

bot.on('chat', (username, message) => {

if (username !== CONFIG.owner) return

const player = bot.players[username]  

if (message === '!follow') {  

  if (!player || !player.entity) {  

    bot.chat("I can't see you.")  

    return  

  }  

  const goal = new goals.GoalFollow(player.entity, 2)  

  bot.pathfinder.setGoal(goal, true)  

  bot.chat("Following you.")  

}  

if (message === '!stop') {  

  bot.pathfinder.setGoal(null)  

  bot.pvp.stop()  

  bot.clearControlStates()  

  bot.chat("Stopped.")  

}  

if (message === '!combat on') {  

  combatEnabled = true  

  bot.chat("Combat enabled.")  

}  

if (message === '!combat off') {  

  combatEnabled = false  

  bot.pvp.stop()  

  bot.chat("Combat disabled.")  

}

})

// ===== SMART COMBAT (Players + Mobs) =====

bot.on('entityHurt', (entity) => {

if (!combatEnabled) return

if (entity !== bot.entity) return

const attacker = bot.nearestEntity(e => {  

  if (!e) return false  

  if (e === bot.entity) return false  

  // Ignore owner  

  if (e.type === 'player' && e.username === CONFIG.owner) return false  

  // Player attacker  

  if (e.type === 'player') return true  

  // Hostile mobs  

  const hostileMobs = [  

    'zombie',  

    'skeleton',  

    'creeper',  

    'spider',  

    'enderman',  

    'witch',  

    'drowned',  

    'husk',  

    'pillager',  

    'vindicator',  

    'evoker',  

    'blaze',  

    'guardian',  

    'phantom',  

    'hoglin'  

  ]  

  return hostileMobs.includes(e.name)  

})  

if (!attacker) return  

console.log('⚔ Fighting:', attacker.name || attacker.username)  

bot.pvp.attack(attacker)

})

// Stop combat when target dies

bot.on('entityDead', (entity) => {

if (bot.pvp.target === entity) {

bot.pvp.stop()

console.log('✅ Target eliminated')

}

})

// ===== AUTO RESPAWN =====

bot.on('death', () => {

console.log('💀 Bot died')

setTimeout(() => {

bot.chat('/spawn')

}, 3000)

})

// ===== AUTO RECONNECT =====

bot.on('end', () => {

console.log('🔄 Reconnecting...')

clearIntervals()

setTimeout(startBot, CONFIG.reconnectDelay)

})

bot.on('kicked', reason => {

console.log('⚠ Kicked:', reason)

})

bot.on('error', err => {

console.log('❌ Error:', err.message)

})

}

startBot()