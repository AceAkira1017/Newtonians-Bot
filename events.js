const utils = require('./utils')

module.exports = (bot, config) => {
  bot.once('spawn', () => {
    console.log('✅ Bot spawned successfully!')

    const mcData = require('minecraft-data')(bot.version)
    const movements = new (require('mineflayer-pathfinder').Movements)(bot, mcData)
    bot.pathfinder.setMovements(movements)

    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`)
      bot.chat(`/login ${config.password}`)
    }, 2000)

    utils.addInterval(() => {
      const actions = ['jump', 'forward', 'back']
      const action = actions[Math.floor(Math.random() * actions.length)]

      bot.setControlState(action, true)
      setTimeout(() => bot.setControlState(action, false), 1000)

      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.4
      bot.look(yaw, pitch, true)
    }, config.antiAfkInterval)

    if (config.enableAutoChat) {
      utils.addInterval(() => {
        const messages = [
          "afk ako boi", "unang kagat, ginawa ko naman lahat", "unang talsik, bakit ang sakit?",
          "unang salang, saan ako nagkulang?", "unang halo, bakit ka naglaho?", "lag ba?",
          "anyone online?", "May compass ako, pero bat hindi na ikaw yung tinituro?",
          "may bagyo? o may bago?", "may kayo ba?",
          "naka spy glasses na ako pero malabo parin na maging tayo",
          "may protection 4 Naman pero bat ang sakit?",
          "May unbreaking III naman ako, pero bakit sinira mo tiwala ko?",
          "binigyan naman kita ng boots na may Feather Falling IV eh bat ang bilis mo parin mahulog sa iba",
          "kahit locator map ko di mahanap yung lugar ko sa puso mo",
          "Akala ko mas masakit ang full enchanted netherite sword kaso mas masakit pala ang pag alis nya",
          "ano sa feeling mareject?", "crush kaba ng crush mo?"
        ]
        bot.chat(utils.randomMessage(messages))
      }, config.autoChatIntervalMin + Math.random() * (config.autoChatIntervalMax - config.autoChatIntervalMin))
    }
  })

  bot.on('death', () => {
    console.log('💀 Bot died')
    setTimeout(() => bot.chat('/spawn'), 3000)
  })
}