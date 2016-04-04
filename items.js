var api_key = require('./api_key.js');
var prequest = require('prequest');
var Q = require('q');

var items = {};

var mItemTemplate = JSON.stringify({
  _id :  0,
  name:  'Unknown',
  desc:  '',
  image: 0
});
function initialise() {
  var response = Q.defer();
  var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/item?item_type_id=26&c:limit=5000&c:hide=item_category_id,skill_set_id,is_vehicle_weapon,item_type_id,faction_id,max_stack_size,image_set_id,image_path,is_default_attachment&c:lang=en';
  prequest(url).then(function (body) {
    body.item_list.forEach(function(item) {
      // use item template
      var obj = JSON.parse(mItemTemplate);
      // check if item response from dbg has each json key before updating our template
      if (item.hasOwnProperty('item_id'))
        obj._id = item.item_id;
      if (item.hasOwnProperty('name'))
        obj.name = item.name.en;
      if (item.hasOwnProperty('description'))
        obj.desc = item.description.en;
      if (item.hasOwnProperty('image_id'))
        obj.image = item.image_id;
      // template is populated, add it to items lookup object
      if (obj._id > 0) {
        items['item_' + obj._id] = obj;
      }
    });
    response.resolve(true);
  }).catch(function () {
    response.resolve(false);
  });
  return response.promise;
}

function lookupItem(item_id) {
  if (items.hasOwnProperty('item_' + item_id)) {
    return items['item_' + item_id];
  }
  return JSON.parse(mItemTemplate);
}

exports.initialise = initialise;
exports.lookupItem = lookupItem;