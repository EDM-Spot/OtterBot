const Card = require("./card.js");

class UnoPlayer {
    constructor(member, client) {
        this.channel = "485927387079639051";
        this.client = client;

        this.member = member;
        this.id = member.id;
        this.hand = [];
        this.called = false;
        this.finished = false;
        this.cardsPlayed = 0;
    }

    cardsChanged() {
        this.sortHand();
    }

    sortHand() {
        this.hand.sort((a, b) => {
            return a.value > b.value;
        });
    }

    parseColor(color) {
        switch ((color || '').toLowerCase()) {
            case 'red':
            case 'r':
                color = 'R';
                break;
            case 'yellow':
            case 'y':
                color = 'Y';
                break;
            case 'green':
            case 'g':
                color = 'G';
                break;
            case 'blue':
            case 'b':
                color = 'B';
                break;
            default:
                color = '';
                break;
        }
        return color;
    }

    outputFormat() {
        return {
            id: this.id,
            cardsPlayed: this.cardsPlayed,
            name: this.member.username,
            discriminator: this.member.discriminator
        };
    }

    async getCard(words) {
        let color, id;
        if (words.length === 1) {
            let f = words[0][0].toLowerCase();
            let _c = this.parseColor(f);
            if (_c) {
                color = _c;
                id = words[0].substring(1);
            } else
                id = words[0];
        } else {
            color = words[0];
            id = words[1];
        }
        if (!id) {
            this.client.channels.cache.get(this.channel).send('Something went wrong. Did you provide a proper card?');
            return null;
        }
        let wild = ['WILD', 'WILD+4'];
        let alias = {
            'W': 'WILD', 'W+4': 'WILD+4', 'REV': 'REVERSE',
            'R': 'REVERSE', 'NOU': 'REVERSE', 'S': 'SKIP'
        };

        let _color = this.parseColor(color);
        if (!_color) {
            if (!color && (wild.includes(id.toUpperCase()) || alias[id.toUpperCase()])) {
                let first = true;
                while (!_color) {
                    let msg = this.client.channels.cache.get(this.channel).send(first
                        ? 'You played a **wild card**! In your next message, say just the color you want the **wild card** to be.'
                        : 'Say just the color for your **wild card**. One of: red, yellow, green, or blue.');
                    _color = this.parseColor(msg.content);
                    first = false;
                }
            } else {
                let temp = color;
                color = id;
                id = temp;
                _color = this.parseColor(color);
                if (!_color) {
                    this.client.channels.cache.get(this.channel).send('You have to specify a valid color! Colors are **red**, **yellow**, **green**, and **blue**.\n`uno play <color> <value>`');
                    return null;
                }
            }
        }
        color = _color;
        
        if (alias[id.toUpperCase()]) id = alias[id.toUpperCase()];
        if (['WILD', 'WILD+4'].includes(id.toUpperCase())) {
            let card = this.hand.find(c => c.id === id.toUpperCase());
            if (!card) return undefined;
            card.color = color;
            return card;
        } else {
            return this.hand.find(c => c.id === id.toUpperCase() && c.color === color);
        }
    }

    async send(content) {
        this.client.users.cache.get(this.id).send(content);
    }

    async sendHand(turn = false) {
        this.sortHand();
        await this.send((turn ? "It's your turn! " : '') + 'Here is your hand:\n\n' + this.hand.map(h => `**${h}**`).join(' | ') + `\n\nYou currently have ${this.hand.length} card(s).`);
    }
}

module.exports = UnoPlayer;