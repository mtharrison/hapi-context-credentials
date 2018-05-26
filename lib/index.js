'use strict';

exports.plugin = {

    pkg: require('../package.json'),
    register: function (server, options) {

        server.ext('onPreResponse', (request, h) => {

            const response = request.response;
            if (response.variety && response.variety === 'view') {
                response.source.context = response.source.context || {};
                response.source.context.credentials = request.auth.isAuthenticated ? request.auth.credentials : null;
            }
            return h.continue;
        });

    }

};
