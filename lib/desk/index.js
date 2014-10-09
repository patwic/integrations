
var fmt = require('util').format;
var qsStringify = require('querystring').stringify;

/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Decorates a response handler and modifies 401 errors with a more appropriate error message.
 *
 * @api private
 * @param {Function} fn
 * @return {function(err, res)} A new function that modifies an `err`, invoking `fn` when finished.
 */

var formatCredentialError = function(fn){
  return function(err, res){
    if (err && err.status === 401) {
      err.message = 'invalid credentials';
    }
    fn(err, res);
  };
};

/**
 * Expose `Desk`
 *
 * http://dev.desk.com/API/
 */

var Desk = module.exports = integration('Desk')
  .channels(['server'])
  .ensure('message.userId')
  .ensure('settings.email')
  .ensure('settings.password')
  .ensure('settings.subdomain')
  .retries(2);

/**
 * Initialize.
 *
 * @api private
 */

Desk.prototype.initialize = function(){
  // Alternative to calling `.endpoint`--we need runtime information to populate this
  this.endpoint = fmt('https://%s.desk.com/api/v2', this.settings.subdomain);
};

/**
 * Identify.
 *
 * http://dev.desk.com/API/customers
 *
 * @api public
 * @param {Object} payload
 * @param {Function} fn
 */

Desk.prototype.identify = function(payload, fn){
  return this
    .get('/customers/search')
    .type('json')
    .auth(this.settings.email, this.settings.password)
    // FIXME: The Desk.com API doesn't allow you to search by either
    // `email` or `external_id`--we would need to do two separate
    // queries. Do we want to do that?
    //
    // See notes on https://gist.github.com/ndhoule/74eaa8c9a8b106f64966
    // for more context
    .query({
      external_id: payload.userId(),
    })
    .send()
    .end(this.handle(formatCredentialError(function(err, res){
      if (err) {
        return fn(err);
      }

      // FIXME: This overwrites any addresses/emails/phone numbers in
      // Desk.com. If someone were to add addresses or emails outside
      // of Segment.io, this would overwrite those values. Desk.com's
      // API doesn't really give you a way around this, as far as I
      // can tell--the default is an append operation, which quickly
      // results in duplicate entried and then a 422 error (too many
      // addresses).
      //
      // Should we not set these values? Is the potential for deleting
      // client data acceptable?
      var params = {
        addresses_update_action: 'replace',
        emails_update_action: 'replace',
        phone_numbers_update_action: 'replace'
      };

      // Update the user if it exists, otherwise create a new one
      var user = res.body.total_entries > 0 && res.body._embedded.entries[0];
      var method = user ? 'patch' : 'post';
      var url = user ? fmt('/customers/%s?%s', user.id, qsStringify(params)) : '/customers';
      this[method](url)
        .type('json')
        .auth(this.settings.email, this.settings.password)
        .send(mapper.identify(payload))
        .end(this.handle(formatCredentialError(fn)));
    }.bind(this))));
};
