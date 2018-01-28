const request = require('request-promise');
const yargs = require('yargs');
const Promise = require('bluebird');
const validUrl = require('valid-url');
const fwdSplit = require("split-fwd-slash");

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
            ],
            'memes': [
                '{{!}}memes <url> [<top text>][/<bottom text>]'
            ]
        };

        function getErrorResponse(message) {
            return {
                intent: 'notice',
                query: true,
                message: message
            };
        }

        var options = {
            url: config['api-url'],
            method: 'POST',
            headers: {
                'x-api-key': apiKey
            }
        };

        var memes = (function() {
            return function(command) {
                return Promise.try(function() {

                        // They forgot everything
                        if (command.args.length < 1) {
                            throw Error('Invalid number of arguments. Try !help memes');
                        }

                        const url = command.args[0];
                        
                        var requestBody = {
                            url: url
                        }

                        if (!validUrl.isUri(url)) {
                            throw Error('URL Invalid.');
                        }

                        // Start looking for top and bottom text
                        if(command.args.length > 1) {
                            
                            // Remove URL
                            var spliced = command.args.splice(1, command.args.length);
                            
                            // Join back into a message
                            var cleanedMessage = spliced.join(' ');
                            
                            // Split again on slashes
                            var splitMessage = fwdSplit(cleanedMessage);
                            
                            if(splitMessage.length > 2) {
                                throw Error('Parsing of your message failed. We tried to split using "/" but got back > 2 items. Were looking for topText AND/OR bottom text. See !help memes');
                            }
                            
                            if(splitMessage.length >= 1) {
                                requestBody.toptext = splitMessage[0];
                            }
                            
                            if(splitMessage.length > 1) {
                                requestBody.bottomtext = splitMessage[1];
                            }
                            
                        }

                        options.body = JSON.stringify(requestBody);
                        
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

                        options.body = JSON.stringify(argv);
                        
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
                '!meme': meme,
                '!memes': memes
            },

            help: {
                'meme': helps.meme,
                'memes': helps.memes
            },

            commands: ['aseen']
        }
    }
};

module.exports = TennuMemeGenerator;
