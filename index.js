exports.register = function (server, options, next) {
    server.ext("onPreResponse", function (request, reply) {

        var response = request.response;
        if (response.variety && response.variety === "view") {
            response.source.context = response.source.context || {};
            response.source.context.credentials = request.auth.credentials;
        }
        return reply.continue();
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};