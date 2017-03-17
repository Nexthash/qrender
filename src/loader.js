const phantom = require('phantom');
const Cacher = require('./cacher');

/**
 * @param{cacheInterval} interval in days of caching (0 - disabled)
 * @param{cacheType} : [
 *  'mongodb' - saves cache to mongodb
 *  'json' - saves cache as json
 *  everything else - caching will not occure
 * ]
 * @param{cacheModel} requires three fields to be specified: htmlContent, expirationDate, url
 */
const defaultOptions = {
    cacheOptions: { }
};

module.exports = class Loader {
    constructor(options) {
        this.opts = Object.assign({}, defaultOptions, options);
        this.cacheEnabled = this.opts.cacheOptions.cacheInterval > 0;
        if (this.cacheEnabled) {
            this.cacher = new Cacher(this.opts.cacheOptions);
        }
    }

    getContent(url) {
        if (this.cacheEnabled) {
            return this.cacher.getCachedObj(url).then(
                data => {
                    if (data.isCacheExpired) {
                        return this.loadFromUrl(url).then(
                            content => (cacher.updateCachedObj(url, content), content),
                            error => error
                        );
                    } else {
                        return data.htmlContent
                    }
                },
                error => error
            )
        } else {
            return this.loadFromUrl(url);
        }
    }

    loadFromUrl(url) {
        return new Promise((res, rej) => {
            if (!url) {
                rej('Url should be provided!');
            } else {
                let openedPage;
                let phantomInstance
                phantom.create().then(
                    instance => {
                        phantomInstance = instance;
                        return instance.createPage().then(
                            page => {
                                openedPage = page;
                                return page.open(url).then(status => {
                                    const html = page.property('content');
                                    instance.exit();
                                    res(html);
                                });
                            },
                            error => rej(error)
                        );
                    },
                    error => rej(error)
                );
            }
        });
    }
}