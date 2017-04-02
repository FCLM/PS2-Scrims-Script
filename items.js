/**
 * Created by Mono on 04-Apr-16.
 */
var api_key = require('./api_key.js');
var prequest = require('prequest');
var Q = require('q');

var items = {};
var categoryMap = 0;
//N.B: category 0 doesn't exist in the API but i assume it is for being killed by wreckage or terrain and it was annoying me with error messages so its now in the map
// You can edit this bit to have it return whatever points you want, so this can be used for most rulesets
// Briggs Thunderdome (2016) Scoring:
var thunderDomeCategoryMap = {
  '0':   { 'category' : 'Unknown (could be anything', points : 0 },
  '2':   { 'category' : 'Knife',                      points : 2 },
  '3':   { 'category' : 'Pistol',                     points : 2 },
  '4':   { 'category' : 'Shotgun',                    points : 0 },
  '5':   { 'category' : 'SMG',                        points : 2 },
  '6':   { 'category' : 'LMG',                        points : 2 },
  '7':   { 'category' : 'Assault Rifle',              points : 2 },
  '8':   { 'category' : 'Carbine',                    points : 2 },
  '9':   { 'category' : 'AV MAX (Left)',              points : 1 },
  '10':  { 'category' : 'AI MAX (Left)',              points : 1 },
  '11':  { 'category' : 'Sniper Rifle',               points : 2 },
  '12':  { 'category' : 'Scout Rifle',                points : 2 },
  '13':  { 'category' : 'Rocket Launcher',            points : 0 },
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
  '100': { 'category' : 'Infantry',                   points : 1 },
  '101': { 'category' : 'Vehicles',                   points : 0 },
  '102': { 'category' : 'Infantry Weapons',           points : 1 },
  '104': { 'category' : 'Vehicle Weapons',            points : 0 },
  '109': { 'category' : 'Flash Primary Weapon',       points : 0 },
  '110': { 'category' : 'Galaxy Left Weapon',         points : 0 },
  '111': { 'category' : 'Galaxy Tail Weapon',         points : 0 },
  '112': { 'category' : 'Galaxy Right Weapon',        points : 0 },
  '113': { 'category' : 'Galaxy Top Weapon',          points : 0 },
  '114': { 'category' : 'Harasser Top Gunner',        points : 0 },
  '115': { 'category' : 'Liberator Belly Weapon',     points : 0 },
  '116': { 'category' : 'Liberator Nose Cannon',      points : 0 },
  '117': { 'category' : 'Liberator Tail Weapon',      points : 0 },
  '118': { 'category' : 'Lightning Primary Weapon',   points : 0 },
  '119': { 'category' : 'Magrider Gunner Weapon',     points : 0 },
  '120': { 'category' : 'Magrider Primary Weapon',    points : 0 },
  '121': { 'category' : 'Mosquito Nose Cannon',       points : 0 },
  '122': { 'category' : 'Mosquito Wing Mount',        points : 0 },
  '123': { 'category' : 'Prowler Gunner Weapon',      points : 0 },
  '124': { 'category' : 'Prowler Primary Weapon',     points : 0 },
  '125': { 'category' : 'Reaver Nose Cannon',         points : 0 },
  '126': { 'category' : 'Reaver Wing Mount',          points : 0 },
  '127': { 'category' : 'Scythe Nose Cannon',         points : 0 },
  '128': { 'category' : 'Scythe Wing Mount',          points : 0 },
  '129': { 'category' : 'Sunderer Front Gunner',      points : 0 },
  '130': { 'category' : 'Sunderer Rear Gunner',       points : 0 },
  '131': { 'category' : 'Vanguard Gunner Weapon',     points : 0 },
  '132': { 'category' : 'Vanguard Primary Weapon',    points : 0 },
  '139': { 'category' : 'Engineer Turrets',           points : 1 },
  '147': { 'category' : 'Aerial Combat Weapon',       points : 0 }
};

// Emerald "DurdleDome" (2016)
var emeraldCategoryMap = {
    '0':   { 'category' : 'Unknown (could be anything', points : 0 },
    '2':   { 'category' : 'Knife',                      points : 2 },
    '3':   { 'category' : 'Pistol',                     points : 2 },
    '4':   { 'category' : 'Shotgun',                    points : 0 },
    '5':   { 'category' : 'SMG',                        points : 2 },
    '6':   { 'category' : 'LMG',                        points : 2 },
    '7':   { 'category' : 'Assault Rifle',              points : 2 },
    '8':   { 'category' : 'Carbine',                    points : 2 },
    '9':   { 'category' : 'AV MAX (Left)',              points : 1 },
    '10':  { 'category' : 'AI MAX (Left)',              points : 1 },
    '11':  { 'category' : 'Sniper Rifle',               points : 2 },
    '12':  { 'category' : 'Scout Rifle',                points : 2 },
    '13':  { 'category' : 'Rocket Launcher',            points : 0 },
    '14':  { 'category' : 'Heavy Gun',                  points : 0 },
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
    '100': { 'category' : 'Infantry',                   points : 1 },
    '101': { 'category' : 'Vehicles',                   points : 0 },
    '102': { 'category' : 'Infantry Weapons',           points : 1 },
    '104': { 'category' : 'Vehicle Weapons',            points : 0 },
    '109': { 'category' : 'Flash Primary Weapon',       points : 0 },
    '110': { 'category' : 'Galaxy Left Weapon',         points : 0 },
    '111': { 'category' : 'Galaxy Tail Weapon',         points : 0 },
    '112': { 'category' : 'Galaxy Right Weapon',        points : 0 },
    '113': { 'category' : 'Galaxy Top Weapon',          points : 0 },
    '114': { 'category' : 'Harasser Top Gunner',        points : 0 },
    '115': { 'category' : 'Liberator Belly Weapon',     points : 0 },
    '116': { 'category' : 'Liberator Nose Cannon',      points : 0 },
    '117': { 'category' : 'Liberator Tail Weapon',      points : 0 },
    '118': { 'category' : 'Lightning Primary Weapon',   points : 0 },
    '119': { 'category' : 'Magrider Gunner Weapon',     points : 0 },
    '120': { 'category' : 'Magrider Primary Weapon',    points : 0 },
    '121': { 'category' : 'Mosquito Nose Cannon',       points : 0 },
    '122': { 'category' : 'Mosquito Wing Mount',        points : 0 },
    '123': { 'category' : 'Prowler Gunner Weapon',      points : 0 },
    '124': { 'category' : 'Prowler Primary Weapon',     points : 0 },
    '125': { 'category' : 'Reaver Nose Cannon',         points : 0 },
    '126': { 'category' : 'Reaver Wing Mount',          points : 0 },
    '127': { 'category' : 'Scythe Nose Cannon',         points : 0 },
    '128': { 'category' : 'Scythe Wing Mount',          points : 0 },
    '129': { 'category' : 'Sunderer Front Gunner',      points : 0 },
    '130': { 'category' : 'Sunderer Rear Gunner',       points : 0 },
    '131': { 'category' : 'Vanguard Gunner Weapon',     points : 0 },
    '132': { 'category' : 'Vanguard Primary Weapon',    points : 0 },
    '139': { 'category' : 'Engineer Turrets',           points : 0 },
    '147': { 'category' : 'Aerial Combat Weapon',       points : 0 }
};

// Briggs OvO (2017)
var ovoCategoryMap = {
    '0':   { 'category' : 'Unknown (could be anything', points : 0 },
    '2':   { 'category' : 'Knife',                      points : 2 },
    '3':   { 'category' : 'Pistol',                     points : 2 },
    '4':   { 'category' : 'Shotgun',                    points : 0 },
    '5':   { 'category' : 'SMG',                        points : 2 },
    '6':   { 'category' : 'LMG',                        points : 2 },
    '7':   { 'category' : 'Assault Rifle',              points : 2 },
    '8':   { 'category' : 'Carbine',                    points : 2 },
    '9':   { 'category' : 'AV MAX (Left)',              points : 1 },
    '10':  { 'category' : 'AI MAX (Left)',              points : 1 },
    '11':  { 'category' : 'Sniper Rifle',               points : 2 },
    '12':  { 'category' : 'Scout Rifle',                points : 2 },
    '13':  { 'category' : 'Rocket Launcher',            points : 0 },
    '14':  { 'category' : 'Heavy Gun',                  points : 0 },
    '15':  { 'category' : 'Flamethrower MAX',           points : 0 },
    '16':  { 'category' : 'Flak MAX',                   points : 0 },
    '17':  { 'category' : 'Grenade',                    points : 2 },
    '18':  { 'category' : 'Explosive',                  points : 0 },
    '19':  { 'category' : 'Battle Rifle',               points : 2 },
    '20':  { 'category' : 'AA MAX (Right)',             points : 1 },
    '21':  { 'category' : 'AV MAX (Right)',             points : 1 },
    '22':  { 'category' : 'AI MAX (Right)',             points : 1 },
    '23':  { 'category' : 'AA MAX (Left)',              points : 1 },
    '24':  { 'category' : 'Crossbow',                   points : 2 },
    '100': { 'category' : 'Infantry',                   points : 1 },
    '101': { 'category' : 'Vehicles',                   points : 0 },
    '102': { 'category' : 'Infantry Weapons',           points : 1 },
    '104': { 'category' : 'Vehicle Weapons',            points : 0 },
    '109': { 'category' : 'Flash Primary Weapon',       points : 0 },
    '110': { 'category' : 'Galaxy Left Weapon',         points : 0 },
    '111': { 'category' : 'Galaxy Tail Weapon',         points : 0 },
    '112': { 'category' : 'Galaxy Right Weapon',        points : 0 },
    '113': { 'category' : 'Galaxy Top Weapon',          points : 0 },
    '114': { 'category' : 'Harasser Top Gunner',        points : 0 },
    '115': { 'category' : 'Liberator Belly Weapon',     points : 0 },
    '116': { 'category' : 'Liberator Nose Cannon',      points : 0 },
    '117': { 'category' : 'Liberator Tail Weapon',      points : 0 },
    '118': { 'category' : 'Lightning Primary Weapon',   points : 0 },
    '119': { 'category' : 'Magrider Gunner Weapon',     points : 0 },
    '120': { 'category' : 'Magrider Primary Weapon',    points : 0 },
    '121': { 'category' : 'Mosquito Nose Cannon',       points : 0 },
    '122': { 'category' : 'Mosquito Wing Mount',        points : 0 },
    '123': { 'category' : 'Prowler Gunner Weapon',      points : 0 },
    '124': { 'category' : 'Prowler Primary Weapon',     points : 0 },
    '125': { 'category' : 'Reaver Nose Cannon',         points : 0 },
    '126': { 'category' : 'Reaver Wing Mount',          points : 0 },
    '127': { 'category' : 'Scythe Nose Cannon',         points : 0 },
    '128': { 'category' : 'Scythe Wing Mount',          points : 0 },
    '129': { 'category' : 'Sunderer Front Gunner',      points : 0 },
    '130': { 'category' : 'Sunderer Rear Gunner',       points : 0 },
    '131': { 'category' : 'Vanguard Gunner Weapon',     points : 0 },
    '132': { 'category' : 'Vanguard Primary Weapon',    points : 0 },
    '139': { 'category' : 'Engineer Turrets',           points : 0 },
    '147': { 'category' : 'Aerial Combat Weapon',       points : 0 }
};

var mItemTemplate = JSON.stringify({
  _id :  0,
  category_id: 0,
  name:  'Unknown',
  desc:  '',
  image: 0
});

function initialise() {
  if (categoryMap === 0) { categoryMap = thunderDomeCategoryMap;}
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
    return 0;
  }
}

function getCategoryMap() {
  return category_map;
}

function updateCategoryMap(categoryMap) {
  category_map = categoryMap;
}

exports.initialise = initialise;
exports.lookupItem = lookupItem;
exports.lookupPointsfromCategory = lookupPointsFromCategory;