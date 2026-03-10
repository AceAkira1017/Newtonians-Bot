module.exports = (bot, config) => {
  console.log('📍 AutoTPA module loaded - Will auto-accept all /tpa requests')

  bot.on('chat', (username, message) => {
    if (username === bot.username || username === config.owner) return

    const lowerMsg = message.toLowerCase()

    if (
      lowerMsg.includes('has requested to teleport to you') ||
      lowerMsg.includes('wants to teleport to you') ||
      lowerMsg.includes('requested to teleport') ||
      (lowerMsg.includes('/tpaccept') && lowerMsg.includes('to accept'))
    ) {
      console.log(`✅ Auto accepting TPA from ${username}`)
      bot.chat('/tpaccept')
    }
  })
}