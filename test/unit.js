const assert = require('assert');
const should = require('should');
const plugin = require('../plugin.js').init({
  config: () => {
    return require('../plugin.js').configDefaults.meme;
  }
});

function createCommand(message) {
  return {
    nick: 'testuser',
    message: message
  }
}

function getNotice(message) {
  return {
    intent: 'notice',
    query: true,
    message: message
  }
}

describe('Meme Generator', function() {

  describe('#meme()', function() {

    it('Should deny missing URL', function() {

      var memeHandler = plugin.handlers['!meme'];

      var command = createCommand('!meme --url=');

      memeHandler(command)
        .should.eventually.be.deepEqual(getNotice('URL Required.'));

    });

    it('Should deny invalid URL', function() {

      var memeHandler = plugin.handlers['!meme'];

      var command = createCommand('!meme --url=notvalid');

      memeHandler(command)
        //.then((r) => {console.log(r)})
        .should.eventually.be.deepEqual(getNotice('URL Invalid.'));

    });

    it('Should send a valid request', function(done) {

      var memeHandler = plugin.handlers['!meme'];

      var command = createCommand('!meme --url=https://i.imgur.com/tYGBJ9e.jpg');

      memeHandler(command)
        .then(function(res){
          assert.equal(res.indexOf('://cdn') > -1, true, 'Response did not have expetced URL components.');
          done();
        });

    });

  });

});
