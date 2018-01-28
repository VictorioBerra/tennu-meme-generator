const assert = require('assert');
const should = require('should');
const plugin = require('../plugin.js').init({
  config: () => {
    var configDefaults = require('../plugin.js').configDefaults.meme;
    configDefaults['api-url'] = 'https://meme.tberra.com/api-dev/create';
    return configDefaults;
  }
});

function createCommand(message) {
  var splitMessages = message.split(/ +/);
  splitMessages.shift();
  return {
    nick: 'testuser',
    message: message,
    args: splitMessages // https://github.com/Tennu/tennu/blob/master/src/plugin/commands.sjs#L9
  }
}

function getNotice(message) {
  return {
    intent: 'notice',
    query: true,
    message: message
  }
}

var goodUrl = 'https://i.imgur.com/tYGBJ9e.jpg';

describe('Meme Generator', function() {

  describe('#memes()', function() {

    var memeHandler = plugin.handlers['!memes'];

    it('Should deny missing URL', function() {

      var command = createCommand('!memes');

      memeHandler(command)
        .should.eventually.be.deepEqual(getNotice('Invalid number of arguments. Try !help memes'));

    });

    it('Should deny invalid URL', function() {

      var command = createCommand('!memes notvalid');

      memeHandler(command)
        .should.eventually.be.deepEqual(getNotice('URL Invalid.'));

    });

    it('Should fail if split results in > 2 items', function() {

      var command = createCommand(`!memes ${goodUrl} a/b/c`);

      memeHandler(command)
        .should.eventually.be.deepEqual(getNotice('Parsing of your message failed. We tried to split using "/" but got back > 2 items. Were looking for topText AND/OR bottom text. See !help memes'));

    });

    it('Should send a valid request', function(done) {

      var command = createCommand('!memes ' + goodUrl);

      memeHandler(command)
        .then(function(res){
          assert.equal(res.indexOf('://cdn') > -1, true, 'Response did not have expetced URL components.');
          done();
        });

    });

    it('Should send a valid request with top text', function(done) {

      var command = createCommand(`!memes ${goodUrl} a`);

      memeHandler(command)
        .then(function(res){
          assert.equal(res.indexOf('://cdn') > -1, true, 'Response did not have expetced URL components.');
          done();
        });

    });    

    it('Should send a valid request with bottom text', function(done) {

      var command = createCommand(`!memes ${goodUrl} a/b`);

      memeHandler(command)
        .then(function(res){
          assert.equal(res.indexOf('://cdn') > -1, true, 'Response did not have expetced URL components.');
          done();
        });

    });   

  });

  describe('#meme()', function() {

      var memeHandler = plugin.handlers['!meme'];

    it('Should deny missing URL', function() {

      var command = createCommand('!meme --url=');

      memeHandler(command)
        .should.eventually.be.deepEqual(getNotice('URL Required.'));

    });

    it('Should deny invalid URL', function() {

      var command = createCommand('!meme --url=notvalid');

      memeHandler(command)
        .should.eventually.be.deepEqual(getNotice('URL Invalid.'));

    });

    it('Should send a valid request', function(done) {

      var command = createCommand(`!meme --url=${goodUrl}`);

      memeHandler(command)
        .then(function(res){
          assert.equal(res.indexOf('://cdn') > -1, true, 'Response did not have expetced URL components.');
          done();
        });

    });

  });

});
