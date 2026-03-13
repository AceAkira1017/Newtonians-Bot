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

module.exports = (bot, config) => {
  bot.on('entityHurt', (entity) => {
    if (!bot.combatEnabled || entity !== bot.entity) return

    const attacker = bot.nearestEntity(e => {
      if (!e || e === bot.entity) return false
      if (e.type === 'player' && e.username === config.owner) return false
      if (e.type === 'player') return true
      return hostileMobs.includes(e.name)
    })

    if (attacker) {
      console.log(`[${bot.serverNickname}] ⚔ Fighting: ${attacker.username || attacker.name}`)
      bot.pvp.attack(attacker)
    }
  })

  bot.on('entityDead', (entity) => {
    if (bot.pvp.target === entity) {
      bot.pvp.stop()
      console.log('✅ Target eliminated')
    }
  })
}