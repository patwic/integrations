
/**
 * Return the value passed to it.
 *
 * @api private
 * @param {*} The input value.
 * @return {*} The input value.
 */

var identity = function(val){
  return val;
};

/**
 * Reformat a Facade address object into a string representation.
 *
 * @api private
 * @param {Object} An object, as represented by Facade
 * @return {string} A string representation of the address.
 */

var formatAddress = function(address){
  // Filter out any null values and join them in a address-like format
  return [
    address.street,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ].filter(identity).join(', ');
};

/**
 * Map identify.
 *
 * @api private
 * @param {Identify} identify
 * @param {Object} settings
 * @return {Object}
 */

exports.identify = function(identify){
  var data = identify.traits({
    id: 'external_id',
    firstName: 'first_name',
    lastName: 'last_name'
  });

  if (identify.address()) {
    delete data.address;
    data.addresses = [{ value: formatAddress(identify.address()), type: 'other' }];
  }

  if (identify.email()) {
    delete data.email;
    data.emails = [{ value: identify.email(), type: 'other' }];
  }

  if (identify.phone()) {
    delete data.phone;
    data.phone_numbers = [{ value: identify.phone(), type: 'other' }];
  }

  return data;
};
