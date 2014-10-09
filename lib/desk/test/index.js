
var Test = require('segmentio-integration-tester');
var Desk = require('../');
var mapper = require('../mapper');

describe('Desk', function(){
  var desk, message, settings, test;

  beforeEach(function(){
    message = { userId: 12345 };
    settings = {
      email: process.env.DESK_EMAIL,
      password: process.env.DESK_PASSWORD,
      subdomain: process.env.DESK_SUBDOMAIN
    };
    desk = new Desk(settings);
    test = Test(desk, __dirname);
    test.mapper(mapper);
  });

  it('should have the correct settings', function(){
    test
      .name('Desk')
      .channels(['server'])
      .ensure('message.userId')
      .ensure('settings.email')
      .ensure('settings.password')
      .ensure('settings.subdomain')
      .retries(2);
  });

  describe('.validate()', function() {
    it('should not be valid without an email', function(){
      delete settings.email;
      test.invalid(message, settings);
    });

    it('should not be valid without a password', function(){
      delete settings.password;
      test.invalid(message, settings);
    });

    it('should be valid with complete settings', function(){
      test.valid(message, settings);
    });
  });

  describe('mapper', function(){
    describe('identify', function(){
      it('should map basic identify', function(){
        test.maps('identify-basic');
      });
    });
  });

  describe('.identify()', function(){
    it('should send basic identify', function(done){
      var json = test.fixture('identify-basic');
      test
        .identify(json.input)
        .sends(json.output)
        .expects(200)
        .end(done);
    });

    it('should error on invalid key', function(done){
      var json = test.fixture('identify-basic');
      test
        .set({ email: 'test+user@nathanhoule.com', password: 'lolomg' })
        .identify(json.input)
        .error('invalid credentials', done);
    });
  });
});
