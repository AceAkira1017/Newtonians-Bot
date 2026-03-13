module.exports = {
  common: {
    version: '1.16.5',
    reconnectDelay: 5000,
    antiAfkInterval: 20000,
    enableAutoChat: true,
    autoChatIntervalMin: 120000,
    autoChatIntervalMax: 240000,
    owner: '.itzmeac31017',
    features: {
      autoTpa: true,
      autoEat: true,
      combat: true,
    }
  },

  servers: [
    {
      nickname: 'Newtonians',
      host: 'Newtonians-S1.aternos.me',
      port: 13207,
      username: 'Akiii',
      password: 'Kai172309',
      features: {
        autoTpa: true,
        autoEat: true,
        combat: true
      }
    },

    // Example of another server 
    // {
    //   nickname: 'TestServer',
    //   host: 'server.address',
    //   port: 25565,
    //   username: 'Bot',
    //   password: 'pass123',
    //   features: {
    //     autoTpa: false,
    //     autoEat: true,
    //     combat: false
    //   }
    // }
  ]
};