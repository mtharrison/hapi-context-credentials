'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server({ port: 4000 });

(async () => {

    await server.register([
        { plugin: require('vision') },
        { plugin: require('hapi-auth-basic') },
        { plugin: require('../../index') }
    ]);

    server.views({
        engines: {
            hbs: require('handlebars')
        },
        path: __dirname,
        isCached: false
    });

    const validate = function (request, username, password) {

        // Just authenticate everyone and store username
        // in credentials

        if (username === 'john' && password === 'secret') {
            return { isValid: true, credentials: { username: 'john' } };
        }

        return { isValid: false };
    };

    server.auth.strategy('simple', 'basic', {
        validate
    });

    server.route([
        {
            config: {
                auth: {
                    strategy: 'simple',
                    mode: 'try'
                }
            },
            method: 'GET',
            path: '/',
            handler: function (request, h) {

                return h.view('home');
            }
        },
        {
            config: {
                auth: {
                    strategy: 'simple'
                }
            },
            method: 'GET',
            path: '/login',
            handler: function (request, h) {

                return h.redirect('/');
            }
        }
    ]);

    await server.start();
    console.log('Started serverx');
})();
