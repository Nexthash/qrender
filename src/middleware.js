const Loader = require('./loader');

module.exports = getMiddleware;

function getMiddleware(options) {
    const fragmentRegex = /(\?|&)_escaped_fragment_=/;
    const hostToRenderFrom = 'http://localhost:8080';
    const defaultOptions = {
        isReqForRender: req => fragmentRegex.test(`${hostToRenderFrom}${req.originalUrl}`),
        getUrlFromReq: req => `${hostToRenderFrom}${req.originalUrl}`.replace(fragmentRegex, ''),
        loaderOptions: {}
    };

    const opts = Object.assign({}, defaultOptions, options);

    const loader = new Loader(opts.loaderOptions);

    return function (req, res, next) {
        if (opts.isReqForRender(req)) {
            loader.getContent(opts.getUrlFromReq(req)).then(
                htmlContent => {
                    console.log(htmlContent);
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