/*
 THIS SECTION IS OWNER COMMAND
*/

const { goals } = require('mineflayer-pathfinder')

module.exports = (bot, config) => {
  bot.on('chat', (username, message) => {
    if (username !== config.owner) return

    const player = bot.players[username]

    switch (message.toLowerCase().trim()) {
      case '!follow':
        if (!player?.entity) {
          bot.chat("I can't see you.")
          return
        }
        const goal = new goals.GoalFollow(player.entity, 2)
        bot.pathfinder.setGoal(goal, true)
        bot.chat('Following you.')
        break

      case '!stop':
        bot.pathfinder.setGoal(null)
        bot.pvp.stop()
        bot.clearControlStates()
        bot.chat('Stopped.')
        break

      case '!combat on':
        bot.combatEnabled = true
        bot.chat('Combat enabled.')
        break

      case '!combat off':
        bot.combatEnabled = false
        bot.pvp.stop()
        bot.chat('Combat disabled.')
        break
    }
  })
}