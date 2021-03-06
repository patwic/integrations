
var convert = require('convert-dates');

/**
 * Map `track`.
 *
 * @param {Track} track
 * @return {Object}
 * @api private
 */

exports.track = function(track){
  return {
    user_id: track.userId(),
    cookie_id: track.sessionId(),
    event: track.event(),
    timestamp: track.timestamp().toISOString(),
    properties: convertDates(track.properties())
  };
};

/**
 * Map `identify`.
 *
 * @param {Identify} msg
 * @return {Object}
 * @api private
 */

exports.identify = function(identify){
  return {
    user_id: identify.userId(),
    cookie_id: identify.sessionId(),
    traits: convertDates(identify.traits())
  };
};

function convertDates(object){
  return convert(object, function(date){ return date.toISOString(); });
}
