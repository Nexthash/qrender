const Loader = require('./loader');

module.exports = getMiddleware;
/**
 * 
 * @param {Object} options - Options that contain functions:
 * isReqForRender - checks if request should be Rendered
 * getUrlFromReq - gets original url for request
 * And Object loaderOptions - options for loader module 
 */
function getMiddleware(options) {
    const fragmentRegex = /(\?|&)_escaped_fragment_=/;
    const hostToRenderFrom = `http://localhost:${process.env.PORT || 3000}`; // TODO: update host and protocol
    const defaultOptions = {
        isReqForRender: req => fragmentRegex.test(`${hostToRenderFrom}${req.originalUrl}`),
        getUrlFromReq: req => `${hostToRenderFrom}${req.originalUrl}`.replace(fragmentRegex, ''),
        loaderOptions: {}
    };

    const opts = Object.assign({}, defaultOptions, options);

    const loader = new Loader(opts.loaderOptions);

    /**
     * returns expressjs middleware function
     */
    return function (req, res, next) {
        if (opts.isReqForRender(req)) {
            loader.getContent(opts.getUrlFromReq(req)).then(
                htmlContent => {
                    res.send(htmlContent);
                    next('Rendered content has been sent');
                },
                error => {
                    res.send(error);
                    next(error);
                }
            );
        } else {
            next();
        }
    };
}