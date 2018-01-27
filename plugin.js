const request = require('request-promise');
const yargs = require('yargs');
const Promise = require('bluebird');
const validUrl = require('valid-url');

var TennuMemeGenerator = {
    configDefaults: {
        'meme': {
            'api-url': 'https://meme.tberra.com/api/create'
        },
    },
    init: function(client, imports) {

        var config = client.config("meme");

        if (!config['api-key'] && !process.env.MEME_API_KEY) {
            throw Error("API Key not found. config: meme.api-key or environment variable MEME_API_KEY");
        }

        const apiKey = config['api-key'] || process.env.MEME_API_KEY;

        const helps = {
            'meme': [
                '{{!}}meme -url -topText -bottomText'
            ]
        };

        function getErrorResponse(message) {
            return {
                intent: 'notice',
                query: true,
                message: message
            };
        }

        var meme = (function() {
            return function(command) {
                return Promise.try(function() {
                        const argv = require('yargs').parse(command.message);

                        if (!argv.url) {
                            throw Error('URL Required.');
                        }

                        if (!validUrl.isUri(argv.url)) {
                            throw Error('URL Invalid.');
                        }

                        // Remove extras before sending
                        delete argv.help;
                        delete argv.version;
                        delete argv._;
                        delete argv['$0'];

                        var options = {
                            url: config['api-url'],
                            method: 'POST',
                            headers: {
                                'x-api-key': apiKey
                            },
                            body: JSON.stringify(argv)
                        };

                        return request(options)
                            .then(function(res) {
                                return JSON.parse(res).url;
                            });

                    })
                    .catch(function(err) {
                        return getErrorResponse(err.message);
                    });
            }
        })();

        return {

            handlers: {
                '!meme': meme
            },

            help: {
                'meme': helps.meme
            },

            commands: ['aseen']
        }
    }
};

module.exports = TennuMemeGenerator;
