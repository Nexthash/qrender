const phantom = require('phantom');
const Cacher = require('./cacher');

const defaultOptions = {
    cacheOptions: { }
};

module.exports = class Loader {
    /**
     * @constructor
     * @param {Object} options - Object with cacheOptions field
     */
    constructor(options) {
        this.opts = Object.assign({}, defaultOptions, options);
        this.cacheEnabled = this.opts.cacheOptions.cacheInterval > 0;
        if (this.cacheEnabled) {
            this.cacher = new Cacher(this.opts.cacheOptions);
        }
    }

    /**
     * 
     * @param {String} url - url from which page should be rendered 
     * @returns {Promise} resolves html content from url or from cache based on options
     */
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

    /**
     * 
     * @param {String} url - url from which page should be rendered 
     * @returns {Promise} resolves html content when loaded and executed
     */
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