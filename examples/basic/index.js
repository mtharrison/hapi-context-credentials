var Hapi = require('hapi');
var Path = require('path');

var server = new Hapi.Server();
server.connection({ port: 4000 });

server.register([
    { register: require('vision') },
    { register: require('hapi-auth-basic') },
    { register: require('../../index') }
], function (err) {

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

    var validateFunc = function (request, username, password, callback) {

        // Just authenticate everyone and store username
        // in credentials

        if (username === 'john' && password === 'secret') {
            return callback(null, true, { username: 'john' });
        }

        return callback(null, false, {});
    };

    server.auth.strategy('simple', 'basic', {
        validateFunc: validateFunc
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

    server.start(function () {

        console.log('Started serverx');
    });
});
