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
  enableAutoChat: true,
  eatThreshold: 16 // eat food when HP < 16
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

  // ===== HELPER FUNCTIONS =====
  function equipBestSword() {
    const swordNames = ['netherite_sword','diamond_sword','iron_sword','stone_sword','wooden_sword']
    const item = bot.inventory.items().filter(i => swordNames.includes(i.name))
      .sort((a,b) => swordNames.indexOf(a.name) - swordNames.indexOf(b.name))[0]
    if (item) bot.equip(item, 'hand').catch(() => {})
  }

  function equipBestArmor() {
    const armorSlots = ['helmet','chestplate','leggings','boots']
    armorSlots.forEach(slot => {
      const current = bot.inventory.slots[bot.getEquipmentDestSlot(slot)]
      const armorPieces = bot.inventory.items().filter(i => i.name.includes(slot))
      if (armorPieces.length > 0) {
        const best = armorPieces.sort((a,b) => b.type - a.type)[0]
        if (!current || current.type !== best.type) {
          bot.equip(best, slot).catch(() => {})
        }
      }
    })
  }

  function eatFood() {
    if (bot.food === 20) return
    const foodItems = bot.inventory.items().filter(i =>
      i.name.includes('apple') || i.name.includes('bread') ||
      i.name.includes('pork') || i.name.includes('beef') ||
      i.name.includes('carrot')
    )
    if (foodItems.length === 0) return
    const bestFood = foodItems[0]
    bot.equip(bestFood, 'hand').then(() => bot.consume()).catch(() => {})
  }

  function dropTrash() {
    const trash = ['dirt','cobblestone','stone','sand','gravel','sticks','wood','cobweb']
    bot.inventory.items().forEach(item => {
      if (trash.includes(item.name)) bot.tossStack(item).catch(() => {})
    })
  }

  // ===== SPAWN EVENTS =====
  bot.once('spawn', () => {
    console.log('✅ Bot Spawned')

    // Load mcData and movements after spawn
    const mcData = mcDataLoader(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    // Auto register/login
    setTimeout(() => {
      bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`)
      bot.chat(`/login ${CONFIG.password}`)
    }, 2000)

    // Anti-AFK movement
    addInterval(() => {
      const actions = ['jump','forward','back']
      const action = actions[Math.floor(Math.random() * actions.length)]
      bot.setControlState(action,true)
      setTimeout(() => bot.setControlState(action,false),1000)
      const yaw = Math.random()*Math.PI*2
      const pitch = (Math.random()-0.5)*0.4
      bot.look(yaw,pitch,true)
    }, CONFIG.antiAfkInterval)

    // Random chat (safe)
    if (CONFIG.enableAutoChat) {
      function randomChat() {
        const messages = ["afk ako","mining ta","brb","lag ba?","anyone online?","xp grind","farm time","online pa?"]
        bot.chat(messages[Math.floor(Math.random()*messages.length)])
        setTimeout(randomChat, 120000+Math.random()*240000)
      }
      setTimeout(randomChat,180000)
    }

    // Auto drop trash
    addInterval(dropTrash,60000)

    // Auto equip armor
    addInterval(equipBestArmor,10000)

    // Auto eat
    addInterval(() => { if(bot.health < CONFIG.eatThreshold) eatFood() },5000)
  })

  // ===== OWNER COMMANDS =====
  bot.on('chat',(username,message)=>{
    if(username!==CONFIG.owner) return
    const player = bot.players[username]?.entity
    if(message==='!follow'){
      if(!player){bot.chat("I can't see you."); return}
      bot.pathfinder.setGoal(new goals.GoalFollow(player,2),true)
      bot.chat("Following you.")
    }
    if(message==='!stop'){
      bot.pathfinder.setGoal(null)
      bot.pvp.stop()
      bot.clearControlStates()
      bot.chat("Stopped.")
    }
    if(message==='!combat on'){combatEnabled=true; bot.chat("Combat enabled.")}
    if(message==='!combat off'){combatEnabled=false; bot.pvp.stop(); bot.chat("Combat disabled.")}
  })

  // ===== COMBAT MODE =====
  bot.on('entityHurt', (entity)=>{
    if(!combatEnabled) return
    if(entity!==bot.entity) return

    const attacker = bot.nearestEntity(e=>{
      if(!e || e===bot.entity) return false
      if(e.type==='player' && e.username!==CONFIG.owner) return true
      const hostileMobs=['zombie','skeleton','creeper','spider','enderman','witch','drowned','husk','pillager','vindicator','evoker','blaze','guardian','phantom','hoglin']
      return e.type==='mob' && hostileMobs.includes(e.name)
    })

    if(!attacker) return
    equipBestSword()
    console.log('⚔ Fighting:',attacker.name||attacker.username)
    bot.pvp.attack(attacker)
  })

  bot.on('entityDead',(entity)=>{
    if(bot.pvp.target===entity){bot.pvp.stop(); console.log('✅ Target eliminated')}
  })

  // ===== AUTO RESPAWN =====
  bot.on('death',()=>{
    console.log('💀 Bot died')
    setTimeout(()=>{
      bot.respawn()
      setTimeout(()=>bot.chat('/spawn'),2000)
    },3000)
  })

  // ===== AUTO RECONNECT =====
  bot.on('end',()=>{
    console.log('🔄 Reconnecting...')
    clearIntervals()
    setTimeout(startBot,CONFIG.reconnectDelay)
  })

  bot.on('kicked',reason=>console.log('⚠ Kicked:',reason))
  bot.on('error',err=>console.log('❌ Error:',err.message))
}

startBot()
