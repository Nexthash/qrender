const defaultOptions = {
    connectionString: '',
    cacheInterval: 0
};

/**
 * @class
 * If interval is more than 0 and connectionString is provided - gets data from mongodb
 * Fields required:
 * {
 *  cacheExpirationDate,
 *  htmlContent,
 *  url
 * }
 */
module.exports = class Cacher {
    /**
     * 
     * @param {Object} options should have fields:
     * - {String} connection (mongo conneciton string) 
     * - {Number} cacheInterval (in days, 0 - disabled)
     */
    constructor(options) {
        this.opts = Object.assign({}, defaultOptions, options);
        if (this.opts.cacheInterval > 0 && this.opts.connectionString) {
            this.MongoClient = require('mongodb').MongoClient;
        }
    }

    /**
     * 
     * @param {String} url 
     * @returns {Promise} resolves htmlContent and isCacheExpired flag or rejects if no content
     */
    getCachedObj(url) {
        return new Promise((res, rej) => {
            if (!this.MongoClient) {
                rej('No connection configured');
            } else {
                this.MongoClient.connect(this.opts.connectionString, (err, db) => {
                    if (err) {
                        rej(err);
                    } else {
                        const cacheCollection = db.collection('cache');
                        cacheCollection.findOne({ url }, (err, obj) => {
                            res({
                                isCacheExpired: !err && obj ? this._isCacheExpired(obj.cacheExpirationDate) : true,
                                htmlContent: !err && obj ? obj.htmlContent : null
                            });
                            db.close();
                        });
                    }
                });
            }
        });
    }

    /**
     * 
     * @param {String} url 
     * @param {String} content
     * @returns {Promise} resolves or rejects
     */
    updateCachedObj(url, content) {
        return new Promise((res, rej) => {
            if (!this.MongoClient) {
                rej('No connection configured');
            } else {
                this.MongoClient.connect(this.opts.connectionString, (err, db) => {
                    if (err) {
                        rej(err);
                    } else {
                        const cacheCollection = db.collection('cache');
                        cacheCollection.findOne({ url }, (err, obj) => {
                            const expDate = new Date();
                            expDate.setDate(expDate.getDate() + config.cacheDays || 1);
                            if (err || !obj) {
                                cacheCollection.save({
                                    url,
                                    cacheExpirationDate: expDate,
                                    htmlContent: content
                                }, { w: 1 }, (err, result) => {
                                    db.close();
                                    res();
                                });
                            } else {
                                cacheCollection.update(
                                    { url },
                                    { $set: {
                                        htmlContent: content,
                                        cacheExpirationDate: expDate
                                    }}, { w: 1 },
                                    (err, item) => { db.close(); res(); });
                            }
                        });
                    }
                });
            }
        });
    }

    _isCacheExpired(expirationDate) {
        return (new Date().getTime() - new Date(cacheExpirationDate).getTime()) > 0;
    }
}