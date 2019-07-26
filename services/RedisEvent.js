const events = require('./redis_event_constants');

class RedisEvent extends require('events') {
    constructor(redisClientListener, db = 0) {
        super();
        this.listener = redisClientListener;
        this.events = events;
        this.db = db;
        this.keyPatterns = {};
        this._startLisenting();
    }

    _makeEvent(event, key, addChannel = true) {
        return addChannel
            ? this._getChannel(event) + "-" + key
            : event + "-" + key;
    }

    _getChannel(event) {
        return '__keyevent@' + this.db + '__:' + event;
    }

    _startLisenting() {
        this.listener.on('message', (channel, message) => {
            this._handleMessage(channel, message);
        });
    }

    _handleMessage(channel, key) {
        for (let pattern in this.keyPatterns) {
            if (this.keyPatterns.hasOwnProperty(pattern)) {
                if (this.keyPatterns[pattern].key.test(key)) {
                    this.emit(this._makeEvent(channel, this.keyPatterns[pattern].strRgx, false), key);
                }
            }
        }
        this.emit(this._makeEvent(channel, key, false), key);
    }

    _subscribe(event) {
        const channel = this._getChannel(event);
        this.listener.subscribe(channel, function (err, result) {
            if (err) {
                console.log("subscribe error: " + JSON.stringify(err));
            }
            if (result) {
                console.log('subscribed to : ' + JSON.stringify(result));
            }
        });
    }

    subscribeToEvents(events) {
        if (Array.isArray(events)) {
            for (let i = 0; i < events.length; i++) {
                this._subscribe(events[i]);
            }
        } else {
            this._subscribe(events);
        }
    }

    /*
    parameter 'keys' can be a string, a regex or an array of strings
     */
    register(event, keys, handler, isKeyPattern = false) {
        if (typeof handler !== 'function') {
            throw new Error('handler must be a function');
        }

        if (isKeyPattern) {
            if (Array.isArray(keys)) {
                throw new Error('With isKeyPatterns set to true, keys must be a valid regex. Found keys to be an array.');
            }

            this.on(this._makeEvent(event, keys), handler);
            if (!this.keyPatterns.hasOwnProperty(keys)) {
                this.keyPatterns[keys] = {
                    key: new RegExp(keys),
                    strRgx: keys
                };
            }

        } else if (Array.isArray(keys)) {
            for (let i = 0; i < keys.length; i++) {
                this.on(this._makeEvent(event, keys[i]), handler);
            }

        } else {
            this.on(this._makeEvent(event, keys), handler);
        }
    }
}

module.exports = RedisEvent;