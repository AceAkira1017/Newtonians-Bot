module.exports = (bot) => {
  console.log(`[${bot.serverNickname}] 🍖 AutoEat module loaded - Will eat when hunger is low`)

  let isEating = false

  setInterval(() => {
    if (isEating || bot.food > 15) return

    const foodItems = bot.inventory.items().filter(item => {
      const name = item.name
      return name.includes('cooked') ||
             name.includes('steak') ||
             name === 'bread' ||
             name === 'apple' ||
             name === 'carrot' ||
             name === 'potato' ||
             name === 'melon_slice' ||
             name === 'sweet_berries'
    })

    if (foodItems.length === 0) /*{
      console.log('⚠ No food in inventory!')*/
      return
    //}

    const food = foodItems[0]

    isEating = true
    console.log(`[${bot.serverNickname}] 🍖 Eating ${food.name} (hunger: ${bot.food}/20)`)

    bot.equip(food, 'hand').then(() => {
      bot.consume().then(() => {
        isEating = false
      }).catch(() => {
        isEating = false
      })
    }).catch(() => {
      isEating = false
    })
  }, 3000)
}