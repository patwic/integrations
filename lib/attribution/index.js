
/**
 * Module dependencies.
 */

var integration = require('segmentio-integration');
var mapper = require('./mapper');

/**
 * Expose `Attribution`
 */

var Attribution = module.exports = integration('Attribution')
  .endpoint('https://track.attributionapp.com')
  .channels(['server', 'mobile', 'client'])
  .ensure('settings.projectId')
  .mapper(mapper)
  .retries(2);

/**
 * Track.
 *
 * @param {Track} track
 * @param {Function} fn
 * @api private
 */

Attribution.prototype.track = function(payload, fn){
  return this
    .post('/track')
    .auth(this.settings.projectId)
    .type('.json')
    .send(payload)
    .end(this.handle(fn));
};

/**
 * Identify.
 *
 * @param {Identify} identify
 * @param {Function} fn
 * @api public
 */

Attribution.prototype.identify = function(payload, fn){
  return this
    .post('/identify')
    .auth(this.settings.projectId)
    .type('.json')
    .send(payload)
    .end(this.handle(fn));
};
