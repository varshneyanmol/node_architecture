const mongoose = require('mongoose');
const redisClient = require('../services/redis_connection');
const lm = require('../services/redis_lock');

const queryExec = mongoose.Query.prototype.exec;
const aggregateExec = mongoose.Aggregate.prototype.exec;

mongoose.Query.prototype.cache = function () {
    this._cache = true;
    return this;
};

mongoose.Aggregate.prototype.cache = function () {
    this._cache = true;
    return this;
};

mongoose.Query.prototype.exec = async function () {
    console.log('ABOUT TO EXECUTE QUERY');
    console.log('CACHE PARAMETER: ' + this._cache);
    if (!this._cache) {
        console.log('CACHE DISABLED');
        return queryExec.apply(this, arguments);
    }
    console.log('CACHE ENABLED');

    // const locked = await lm.lock("lk", 50000);
    // console.log('LOCK STATUS: ' + locked);
    // const unlocked = await lm.unlock("lk");
    // console.log('UNLOCK STATUS: ' + unlocked);
    // const unlockedTrayAgain = await lm.unlock("lk");
    // console.log('unlockedTrayAgain STATUS: ' + unlockedTrayAgain);
    // const rr = await lm.retryableLock("lk", 5000, 10, 5);
    // console.log("FINAL LOCK STATUS ALL AFTER: " + rr);


    //Note: This is done for deep cloning the query object.
    // Object.assign() does not deep clone the objects and array of objects.
    const q = JSON.parse(JSON.stringify(this.getQuery()));
    const key = JSON.stringify(Object.assign({}, q, {collection: this.mongooseCollection.name}));
    console.log('KEY: ' + key);

    const cacheValue = await redisClient.get(key);
    if (cacheValue) {
        console.log("SERVING FROM CACHE");
        const docs = JSON.parse(cacheValue);
        console.log('RESULT: ' + docs);
        return Array.isArray(docs) ? docs.map(d => new this.model(d)) : new this.model(docs);
    }

    console.log('SERVING FROM DB');
    const result = await queryExec.apply(this, arguments);
    const r = await redisClient.set(key, JSON.stringify(result));
    console.log('REDIS SAVED: ' + r);


/*
    const d = redisClient.setnx("lock-key", new Date().getTime(), (err, result) => {
        if (err) {
            console.log("ERROR: " + err);
        } else {
            console.log("SETNX: " + result);
        }
    });
    console.log("RETURNED: " + d);
*/
    return result;
};

mongoose.Aggregate.prototype.exec = async function () {

    console.log('ABOUT TO EXECUTE AGGREGATE QUERY');
    console.log('CACHE PARAMETER: ' + this._cache);
    if (!this._cache) {
        console.log('CACHE DISABLED');
        return aggregateExec.apply(this, arguments);
    }
    console.log('CACHE ENABLED');

    /*
    This is done for deep cloning the pipeline array of objects. Object assign does not deep clone the objects and array of objects.
     */
    const pipeline = JSON.parse(JSON.stringify(this.pipeline()));
    const key = JSON.stringify(Object.assign({}, pipeline, {collection: this._model.collection.name}));
    console.log('KEY: ' + key);

    const cacheValue = await redisClient.get(key);
    if (cacheValue) {
        console.log("SERVING FROM CACHE");
        return JSON.parse(cacheValue);
    }

    console.log('SERVING FROM DB');
    const result = await aggregateExec.apply(this, arguments);
    redisClient.set(key, JSON.stringify(result));
    return result;
};