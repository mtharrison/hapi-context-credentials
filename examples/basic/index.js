'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server({ port: 4000 });

server.register([
    { register: require('vision') },
    { register: require('hapi-auth-basic') },
    { register: require('../../index') }
], (err) => {

    if (err) {
        throw err;
    }

    server.views({
        engines: {
            hbs: require('handlebars')
        },
        path: __dirname,
        isCached: false
    });

    const validateFunc = function (request, username, password, callback) {

        // Just authenticate everyone and store username
        // in credentials

        if (username === 'john' && password === 'secret') {
            return callback(null, true, { username: 'john' });
        }

        return callback(null, false, {});
    };

    server.auth.strategy('simple', 'basic', {
        validateFunc
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
            handler: function (request, reply) {

                reply.view('home');
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
            handler: function (request, reply) {

                return reply.redirect('/');
            }
        }
    ]);

    server.start(() => {

        console.log('Started serverx');
    });
});
