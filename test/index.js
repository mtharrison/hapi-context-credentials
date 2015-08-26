// Load modules

var Code = require('code');
var Hapi = require('hapi');
var Lab = require('lab');


// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;
var expect = Code.expect;


it('doesn\'t interfere with non view responses', function (done) {

    var server = new Hapi.Server();
    server.connection();
    server.register(require('../'), function (err) {

        expect(err).to.not.exist();

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                return reply('ok');
            }
        });

        var request = { method: 'GET', url: '/' };

        server.inject(request, function (res) {

            expect(res.result).to.equal('ok');
            done();
        });
    });
});

it('doesn\'t include credentials if not authenticated', function (done) {

    var server = new Hapi.Server();
    server.connection();
    server.register([require('../'), require('vision')], function (err) {

        expect(err).to.not.exist();

        server.views({
            engines: {
                hbs: require('handlebars')
            },
            path: __dirname,
            isCached: false
        });

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                request.auth.credentials = {};
                request.auth.credentials.username = 'john';
                return reply.view('test');
            }
        });

        var request = { method: 'GET', url: '/' };

        server.inject(request, function (res) {

            expect(res.result).to.equal('Hello !');
            done();
        });
    });
});

it('includes credentials if authenticated', function (done) {

    var server = new Hapi.Server();
    server.connection();
    server.register([require('../'), require('vision')], function (err) {

        expect(err).to.not.exist();

        server.views({
            engines: {
                hbs: require('handlebars')
            },
            path: __dirname,
            isCached: false
        });

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                request.auth.isAuthenticated = true;
                request.auth.credentials = {};
                request.auth.credentials.username = 'john';
                return reply.view('test');
            }
        });

        var request = { method: 'GET', url: '/' };

        server.inject(request, function (res) {

            expect(res.result).to.equal('Hello john!');
            done();
        });
    });
});

it('merges credentials with existing context', function (done) {

    var server = new Hapi.Server();
    server.connection();
    server.register([require('../'), require('vision')], function (err) {

        expect(err).to.not.exist();

        server.views({
            engines: {
                hbs: require('handlebars')
            },
            path: __dirname,
            isCached: false
        });

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                request.auth.isAuthenticated = true;
                request.auth.credentials = {};
                request.auth.credentials.username = 'john';
                return reply.view('test', { a: 1 });
            }
        });

        var request = { method: 'GET', url: '/' };

        server.inject(request, function (res) {

            expect(res.result).to.equal('Hello john!');
            done();
        });
    });
});

it('does\'t affect non-variety responses', function (done) {

    var server = new Hapi.Server();
    server.connection();
    server.register([require('../'), require('vision')], function (err) {

        expect(err).to.not.exist();

        server.route({
            method: 'GET',
            path: '/',
            handler: function (request, reply) {

                reply(new Error('error'));
            }
        });

        var request = { method: 'GET', url: '/' };

        server.inject(request, function (res) {

            expect(res.statusCode).to.equal(500);
            done();
        });
    });
});

internals.header = function (username, password) {

    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
};
