let intervals = []

module.exports = {
  addInterval: (fn, time) => {
    const id = setInterval(fn, time)
    intervals.push(id)
    return id
  },

  clearAllIntervals: () => {
    intervals.forEach(clearInterval)
    intervals = []
  },

  randomMessage: (messages) => {
    return messages[Math.floor(Math.random() * messages.length)]
  }
}