'use strict';
// Load modules

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


it('doesn\'t interfere with non view responses', async (done) => {

    const server = new Hapi.Server();
    await server.register(require('../'));

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return 'ok';
        }
    });

    const request = { method: 'GET', url: '/' };

    server.inject(request, (res) => {

        expect(res.result).to.equal('ok');
        done();
    });
});

it('doesn\'t include credentials if not authenticated', async (done) => {

    const server = new Hapi.Server();
    await server.register([require('../'), require('vision')]);

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
        handler: function (request, h) {

            request.auth.credentials = {};
            request.auth.credentials.username = 'john';
            return h.view('test');
        }
    });

    const request = { method: 'GET', url: '/' };

    server.inject(request, (res) => {

        expect(res.result).to.equal('Hello !');
        done();
    });
});

it('includes credentials if authenticated', async (done) => {

    const server = new Hapi.Server();
    await server.register([require('../'), require('vision')]);

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
        handler: function (request, h) {

            request.auth.isAuthenticated = true;
            request.auth.credentials = {};
            request.auth.credentials.username = 'john';
            return h.view('test');
        }
    });

    const request = { method: 'GET', url: '/' };

    server.inject(request, (res) => {

        expect(res.result).to.equal('Hello john!');
        done();
    });
});

it('merges credentials with existing context', async (done) => {

    const server = new Hapi.Server();
    await server.register([require('../'), require('vision')]);

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
        handler: function (request, h) {

            request.auth.isAuthenticated = true;
            request.auth.credentials = {};
            request.auth.credentials.username = 'john';
            return h.view('test', { a: 1 });
        }
    });

    const request = { method: 'GET', url: '/' };

    server.inject(request, (res) => {

        expect(res.result).to.equal('Hello john!');
        done();
    });
});

it('does\'t affect non-variety responses', async (done) => {

    const server = new Hapi.Server();
    await server.register([require('../'), require('vision')]);

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            throw new Error('error');
        }
    });

    const request = { method: 'GET', url: '/' };

    server.inject(request, (res) => {

        expect(res.statusCode).to.equal(500);
        done();
    });
});

internals.header = function (username, password) {

    return 'Basic ' + (new Buffer(username + ':' + password, 'utf8')).toString('base64');
};
