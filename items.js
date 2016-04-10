/**
 * Created by Mono on 04-Apr-16.
 */
var api_key = require('./api_key.js');
var prequest = require('prequest');
var Q = require('q');

var items = {};

var category_map = {
  '2':   { 'category' : 'Knife',                      points : 2 },
  '3':   { 'category' : 'Pistol',                     points : 2 },
  '4':   { 'category' : 'Shotgun',                    points : 0 },
  '5':   { 'category' : 'SMG',                        points : 2 },
  '6':   { 'category' : 'LMG',                        points : 2 },
  '7':   { 'category' : 'Assault Rifle',              points : 2 },
  '8':   { 'category' : 'Carbine',                    points : 2 },
  '9':   { 'category' : 'AV MAX (Left)',              points : 1 },
  '10':  { 'category' : 'AI MAX (Left)',              points : 1 },
  '11':  { 'category' : 'Sniper Rifle',               points : 1 },
  '12':  { 'category' : 'Scout Rifle',                points : 2 },
  '13':  { 'category' : 'Rocket Launcher',            points : 1 },
  '14':  { 'category' : 'Heavy Gun',                  points : 1 },
  '15':  { 'category' : 'Flamethrower MAX',           points : 1 },
  '16':  { 'category' : 'Flak MAX',                   points : 1 },
  '17':  { 'category' : 'Grenade',                    points : 2 },
  '18':  { 'category' : 'Explosive',                  points : 0 },
  '19':  { 'category' : 'Battle Rifle',               points : 2 },
  '20':  { 'category' : 'AA MAX (Right)',             points : 1 },
  '21':  { 'category' : 'AV MAX (Right)',             points : 1 },
  '22':  { 'category' : 'AI MAX (Right)',             points : 1 },
  '23':  { 'category' : 'AA MAX (Left)',              points : 1 },
  '24':  { 'category' : 'Crossbow',                   points : 2 },
  '99':  { 'category' : 'Camo',                       points : null },
  '100': { 'category' : 'Infantry',                   points : 1 },
  '101': { 'category' : 'Vehicles',                   points : null },
  '102': { 'category' : 'Infantry Weapons',           points : null },
  '103': { 'category' : 'Infantry Gear',              points : null },
  '104': { 'category' : 'Vehicle Weapons',            points : null },
  '105': { 'category' : 'Vehicle Gear',               points : null },
  '106': { 'category' : 'Armor Camo',                 points : null },
  '107': { 'category' : 'Weapon Camo',                points : null },
  '108': { 'category' : 'Vehicle Camo',               points : null },
  '109': { 'category' : 'Flash Primary Weapon',       points : null },
  '110': { 'category' : 'Galaxy Left Weapon',         points : null },
  '111': { 'category' : 'Galaxy Tail Weapon',         points : null },
  '112': { 'category' : 'Galaxy Right Weapon',        points : null },
  '113': { 'category' : 'Galaxy Top Weapon',          points : null },
  '114': { 'category' : 'Harasser Top Gunner',        points : null },
  '115': { 'category' : 'Liberator Belly Weapon',     points : null },
  '116': { 'category' : 'Liberator Nose Cannon',      points : null },
  '117': { 'category' : 'Liberator Tail Weapon',      points : null },
  '118': { 'category' : 'Lightning Primary Weapon',   points : null },
  '119': { 'category' : 'Magrider Gunner Weapon',     points : null },
  '120': { 'category' : 'Magrider Primary Weapon',    points : null },
  '121': { 'category' : 'Mosquito Nose Cannon',       points : null },
  '122': { 'category' : 'Mosquito Wing Mount',        points : null },
  '123': { 'category' : 'Prowler Gunner Weapon',      points : null },
  '124': { 'category' : 'Prowler Primary Weapon',     points : null },
  '125': { 'category' : 'Reaver Nose Cannon',         points : null },
  '126': { 'category' : 'Reaver Wing Mount',          points : null },
  '127': { 'category' : 'Scythe Nose Cannon',         points : null },
  '128': { 'category' : 'Scythe Wing Mount',          points : null },
  '129': { 'category' : 'Sunderer Front Gunner',      points : null },
  '130': { 'category' : 'Sunderer Rear Gunner',       points : null },
  '131': { 'category' : 'Vanguard Gunner Weapon',     points : null },
  '132': { 'category' : 'Vanguard Primary Weapon',    points : null },
  '133': { 'category' : 'Implants',                   points : null },
  '134': { 'category' : 'Consolidated Camo',          points : null },
  '135': { 'category' : 'VO Packs',                   points : null },
  '136': { 'category' : 'Male VO Pack',               points : null },
  '137': { 'category' : 'Female VO Pack',             points : null },
  '138': { 'category' : 'Valkyrie Nose Gunner',       points : null },
  '139': { 'category' : 'Engineer Turrets',           points : 1 }
};

var mItemTemplate = JSON.stringify({
  _id :  0,
  category_id: 0,
  name:  'Unknown',
  desc:  '',
  image: 0
});
function initialise() {
  var response = Q.defer();
  var url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/item?item_type_id=26&c:limit=5000&c:hide=,skill_set_id,is_vehicle_weapon,item_type_id,faction_id,max_stack_size,image_set_id,image_path,is_default_attachment&c:lang=en';
  prequest(url).then(function (body) {
    body.item_list.forEach(function(item) {
      // use item template
      var obj = JSON.parse(mItemTemplate);
      // check if item response from dbg has each json key before updating our template
      if (item.hasOwnProperty('item_id'))
        obj._id = item.item_id;
      if (item.hasOwnProperty('item_category_id'))
        obj.category_id = item.item_category_id;
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
  }).catch(function (err) {
    console.error(err);
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

function lookupPointsFromCategory(id) {
  if (category_map.hasOwnProperty(id)) {
    return category_map[id].points;
  } else {
    console.error('missing category: ' + id);
    return null;
  }
}

exports.initialise = initialise;
exports.lookupItem = lookupItem;
exports.lookupPointsfromCategory = lookupPointsFromCategory;