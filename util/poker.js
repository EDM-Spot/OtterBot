module.exports = (client) => {
  class aswUtil {
    constructor() {
      this.maxPlayers = 8;
    }
  }

  client.awd = new aswUtil();
};