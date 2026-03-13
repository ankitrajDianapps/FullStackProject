const NodeCache = require("node-cache");
const cache = new NodeCache();

const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        if (req.method !== "GET") {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            res.set("Content-Type", "application/json");
            return res.send(cachedResponse);
        } else {
            // Intercept res.send to cache the response before sending
            const originalSend = res.send;
            res.send = (body) => {
                cache.set(key, body, duration);
                originalSend.call(res, body);
            };
            next();
        }
    };
};

const clearCache = (prefix) => {
    if (prefix) {
        const keys = cache.keys();
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                cache.del(key);
            }
        });
    } else {
        cache.flushAll();
    }
};

module.exports = {
    cacheMiddleware,
    clearCache
};
