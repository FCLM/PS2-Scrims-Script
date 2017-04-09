/**
 * Created by Mono on 04-Apr-16.
 */
const api_key   = require('./api_key.js'),
      prequest  = require('prequest');

let items = {};

const categoryNumbers = ['0','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24',
    '100','101','102','104','109','110','111','112','113','114','115','116','117','118','119','120','121','122','123','124',
    '125','126','127','128','129','130','131','132','139','147'];

//N.B: category 0 doesn't exist in the API but i assume it is for being killed by wreckage or terrain and it was annoying me with error messages so its now in the map
// You can edit this bit to have it return whatever points you want, so this can be used for most rulesets
// Briggs Thunderdome (2016) Scoring:
const thunderdomeCategoryMap = { '0': 0, '2': 2, '3': 2, '4': 0, '5': 2, '6': 2, '7': 2, '8': 2, '9': 1, '10': 1, '11': 2,
    '12': 2, '13':  0, '14': 1, '15': 1, '16': 1, '17': 2, '18': 0, '19': 2, '20': 1, '21': 1, '22': 1, '23': 1, '24': 2,
    '100': 1, '101': 0, '102': 1, '104': 0, '109': 0, '110': 0, '111': 0, '112': 0, '113': 0, '114': 0, '115': 0, '116': 0,
    '117': 0, '118': 0, '119': 0, '120': 0, '121': 0, '122': 0, '123': 0, '124': 0, '125': 0, '126': 0, '127': 0, '128': 0,
    '129': 0, '130': 0, '131': 0, '132': 0, '139': 1, '147': 0 };

// Emerald "DurdleDome" (2016)
const emeraldCategoryMap = {     '0': 0, '2': 2, '3': 2, '4': 0, '5': 2, '6': 2, '7': 2, '8': 2, '9': 1, '10': 1, '11': 2,
    '12': 2, '13': 0, '14': 0, '15': 1, '16': 1, '17': 2, '18': 0, '19': 2, '20': 0, '21': 0, '22': 0, '23': 0, '24': 2,
    '100': 1, '101': 0, '102': 1, '104': 0, '109': 0, '110': 0, '111': 0, '112': 0, '113': 0, '114': 0, '115': 0, '116': 0,
    '117': 0, '118': 0, '119': 0, '120': 0, '121': 0, '122': 0, '123': 0, '124': 0, '125': 0, '126': 0, '127': 0, '128': 0,
    '129': 0, '130': 0, '131': 0, '132': 0, '139': 0, '147': 0 };

// Briggs OvO (2017)
const ovoCategoryMap = {         '0': 0, '2': 2, '3': 2, '4': 0, '5': 2, '6': 2, '7': 2, '8': 2, '9': 1, '10': 1, '11': 2,
    '12': 2, '13': 0, '14': 0, '15': 0, '16': 0, '17': 2, '18': 0, '19': 2, '20': 0, '21': 0, '22': 0, '23': 0, '24': 2,
    '100': 1, '101': 0, '102': 1, '104': 0, '109': 0, '110': 0, '111': 0, '112': 0, '113': 0, '114': 0, '115': 0, '116': 0,
    '117': 0, '118': 0, '119': 0, '120': 0, '121': 0, '122': 0, '123': 0, '124': 0, '125': 0, '126': 0, '127': 0, '128': 0,
    '129': 0, '130': 0, '131': 0, '132': 0, '139': 0, '147': 0 };

// Default to thunderdome ruleset
let categoryMap  = {
    '0':   { 'category' : 'Unknown (could be anything)',points : 0, id: 'item0'},
    '2':   { 'category' : 'Knife',                      points : 2, id: 'item2'},
    '3':   { 'category' : 'Pistol',                     points : 2, id: 'item3'},
    '4':   { 'category' : 'Shotgun',                    points : 0, id: 'item4'},
    '5':   { 'category' : 'SMG',                        points : 2, id: 'item5'},
    '6':   { 'category' : 'LMG',                        points : 2, id: 'item6'},
    '7':   { 'category' : 'Assault Rifle',              points : 2, id: 'item7'},
    '8':   { 'category' : 'Carbine',                    points : 2, id: 'item8'},
    '9':   { 'category' : 'AV MAX (Left)',              points : 1, id: 'item9'},
    '10':  { 'category' : 'AI MAX (Left)',              points : 1, id: 'item10'},
    '11':  { 'category' : 'Sniper Rifle',               points : 2, id: 'item11'},
    '12':  { 'category' : 'Scout Rifle',                points : 2, id: 'item12'},
    '13':  { 'category' : 'Rocket Launcher',            points : 0, id: 'item13'},
    '14':  { 'category' : 'Heavy Gun',                  points : 1, id: 'item14'},
    '15':  { 'category' : 'Flamethrower MAX',           points : 1, id: 'item15'},
    '16':  { 'category' : 'Flak MAX',                   points : 1, id: 'item16'},
    '17':  { 'category' : 'Grenade',                    points : 2, id: 'item17'},
    '18':  { 'category' : 'Explosive',                  points : 0, id: 'item18'},
    '19':  { 'category' : 'Battle Rifle',               points : 2, id: 'item19'},
    '20':  { 'category' : 'AA MAX (Right)',             points : 1, id: 'item20'},
    '21':  { 'category' : 'AV MAX (Right)',             points : 1, id: 'item21'},
    '22':  { 'category' : 'AI MAX (Right)',             points : 1, id: 'item22'},
    '23':  { 'category' : 'AA MAX (Left)',              points : 1, id: 'item23'},
    '24':  { 'category' : 'Crossbow',                   points : 2, id: 'item24'},
    '100': { 'category' : 'Infantry',                   points : 1, id: 'item100'},
    '101': { 'category' : 'Vehicles',                   points : 0, id: 'item101'},
    '102': { 'category' : 'Infantry Weapons',           points : 1, id: 'item102'},
    '104': { 'category' : 'Vehicle Weapons',            points : 0, id: 'item104'},
    '109': { 'category' : 'Flash Primary Weapon',       points : 0, id: 'item109'},
    '110': { 'category' : 'Galaxy Left Weapon',         points : 0, id: 'item110'},
    '111': { 'category' : 'Galaxy Tail Weapon',         points : 0, id: 'item111'},
    '112': { 'category' : 'Galaxy Right Weapon',        points : 0, id: 'item112'},
    '113': { 'category' : 'Galaxy Top Weapon',          points : 0, id: 'item113'},
    '114': { 'category' : 'Harasser Top Gunner',        points : 0, id: 'item114'},
    '115': { 'category' : 'Liberator Belly Weapon',     points : 0, id: 'item115'},
    '116': { 'category' : 'Liberator Nose Cannon',      points : 0, id: 'item116'},
    '117': { 'category' : 'Liberator Tail Weapon',      points : 0, id: 'item117'},
    '118': { 'category' : 'Lightning Primary Weapon',   points : 0, id: 'item118'},
    '119': { 'category' : 'Magrider Gunner Weapon',     points : 0, id: 'item119'},
    '120': { 'category' : 'Magrider Primary Weapon',    points : 0, id: 'item120'},
    '121': { 'category' : 'Mosquito Nose Cannon',       points : 0, id: 'item121'},
    '122': { 'category' : 'Mosquito Wing Mount',        points : 0, id: 'item122'},
    '123': { 'category' : 'Prowler Gunner Weapon',      points : 0, id: 'item123'},
    '124': { 'category' : 'Prowler Primary Weapon',     points : 0, id: 'item124'},
    '125': { 'category' : 'Reaver Nose Cannon',         points : 0, id: 'item125'},
    '126': { 'category' : 'Reaver Wing Mount',          points : 0, id: 'item126'},
    '127': { 'category' : 'Scythe Nose Cannon',         points : 0, id: 'item127'},
    '128': { 'category' : 'Scythe Wing Mount',          points : 0, id: 'item128'},
    '129': { 'category' : 'Sunderer Front Gunner',      points : 0, id: 'item129'},
    '130': { 'category' : 'Sunderer Rear Gunner',       points : 0, id: 'item130'},
    '131': { 'category' : 'Vanguard Gunner Weapon',     points : 0, id: 'item131'},
    '132': { 'category' : 'Vanguard Primary Weapon',    points : 0, id: 'item132'},
    '139': { 'category' : 'Engineer Turrets',           points : 1, id: 'item139'},
    '147': { 'category' : 'Aerial Combat Weapon',       points : 0, id: 'item147'},
    'name': 'Thunderdome Ruleset'
};

function getCategoryMaps() {
    return categoryMap;
}

function updateCategoryMap(number) {
    categoryNumbers.forEach(function (data) {
        if (number === 0) { categoryMap[data].points = thunderdomeCategoryMap[data]; }
        else if (number === 1) { categoryMap[data].points = emeraldCategoryMap[data]; }
        else if (number === 2) { categoryMap[data].points = ovoCategoryMap[data]; }
    });

    if (number === 0) { categoryMap['name'] = 'Thunderdome'; }
    else if (number === 1) { categoryMap['name'] = 'Emerald'; }
    else if (number === 2) { categoryMap['name'] = 'Briggs OvO'; }
}

function individualCategoryUpdate(event) {
    if (event.item0    !== '') { categoryMap['0'].points   = event.item0; }
    if (event.item2    !== '') { categoryMap['2'].points   = event.item2; }
    if (event.item3    !== '') { categoryMap['3'].points   = event.item3; }
    if (event.item4    !== '') { categoryMap['4'].points   = event.item4; }
    if (event.item5    !== '') { categoryMap['5'].points   = event.item5; }
    if (event.item6    !== '') { categoryMap['6'].points   = event.item6; }
    if (event.item7    !== '') { categoryMap['7'].points   = event.item7; }
    if (event.item8    !== '') { categoryMap['8'].points   = event.item8; }
    if (event.item9    !== '') { categoryMap['9'].points   = event.item9; }
    if (event.item10   !== '') { categoryMap['10'].points  = event.item10; }
    if (event.item11   !== '') { categoryMap['11'].points  = event.item11; }
    if (event.item12   !== '') { categoryMap['12'].points  = event.item12; }
    if (event.item13   !== '') { categoryMap['13'].points  = event.item13; }
    if (event.item14   !== '') { categoryMap['14'].points  = event.item14; }
    if (event.item15   !== '') { categoryMap['15'].points  = event.item15; }
    if (event.item16   !== '') { categoryMap['16'].points  = event.item16; }
    if (event.item17   !== '') { categoryMap['17'].points  = event.item17; }
    if (event.item18   !== '') { categoryMap['18'].points  = event.item18; }
    if (event.item19   !== '') { categoryMap['19'].points  = event.item19; }
    if (event.item20   !== '') { categoryMap['20'].points  = event.item20; }
    if (event.item21   !== '') { categoryMap['21'].points  = event.item21; }
    if (event.item22   !== '') { categoryMap['22'].points  = event.item22; }
    if (event.item23   !== '') { categoryMap['23'].points  = event.item23; }
    if (event.item24   !== '') { categoryMap['24'].points  = event.item24; }
    if (event.item100  !== '') { categoryMap['100'].points = event.item100; }
    if (event.item101  !== '') { categoryMap['101'].points = event.item101; }
    if (event.item102  !== '') { categoryMap['102'].points = event.item102; }
    if (event.item104  !== '') { categoryMap['104'].points = event.item104; }
    if (event.item109  !== '') { categoryMap['109'].points = event.item109; }
    if (event.item110  !== '') { categoryMap['110'].points = event.item110; }
    if (event.item111  !== '') { categoryMap['111'].points = event.item111; }
    if (event.item112  !== '') { categoryMap['112'].points = event.item112; }
    if (event.item113  !== '') { categoryMap['113'].points = event.item113; }
    if (event.item114  !== '') { categoryMap['114'].points = event.item114; }
    if (event.item115  !== '') { categoryMap['115'].points = event.item115; }
    if (event.item116  !== '') { categoryMap['116'].points = event.item116; }
    if (event.item117  !== '') { categoryMap['117'].points = event.item117; }
    if (event.item118  !== '') { categoryMap['118'].points = event.item118; }
    if (event.item119  !== '') { categoryMap['119'].points = event.item119; }
    if (event.item120  !== '') { categoryMap['120'].points = event.item120; }
    if (event.item121  !== '') { categoryMap['121'].points = event.item121; }
    if (event.item122  !== '') { categoryMap['122'].points = event.item122; }
    if (event.item123  !== '') { categoryMap['123'].points = event.item123; }
    if (event.item124  !== '') { categoryMap['124'].points = event.item124; }
    if (event.item125  !== '') { categoryMap['125'].points = event.item125; }
    if (event.item126  !== '') { categoryMap['126'].points = event.item126; }
    if (event.item127  !== '') { categoryMap['127'].points = event.item127; }
    if (event.item128  !== '') { categoryMap['128'].points = event.item128; }
    if (event.item129  !== '') { categoryMap['129'].points = event.item129; }
    if (event.item130  !== '') { categoryMap['130'].points = event.item130; }
    if (event.item131  !== '') { categoryMap['131'].points = event.item131; }
    if (event.item132  !== '') { categoryMap['132'].points = event.item132; }
    if (event.item139  !== '') { categoryMap['139'].points = event.item139; }
    if (event.item147  !== '') { categoryMap['147'].points = event.item147; }
    categoryMap.name = 'Custom';
}

const mItemTemplate = JSON.stringify({
    _id :  0,
    category_id: 0,
    name:  'Unknown',
    desc:  '',
    image: 0
});

async function initialise() {
    return new Promise((resolve, reject) => {
        const url = 'https://census.daybreakgames.com/s:' + api_key.KEY + '/get/ps2/item?item_type_id=26&c:limit=5000&c:hide=,skill_set_id,is_vehicle_weapon,item_type_id,faction_id,max_stack_size,image_set_id,image_path,is_default_attachment&c:lang=en';
        prequest(url).then(function (body) {
            body.item_list.forEach(function(item) {
                // use item template
                let obj = JSON.parse(mItemTemplate);
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
            resolve(true);
        }).catch(function (err) {
            console.error(err);
            reject(err);
        });
    })
}

function lookupItem(item_id) {
    if (items.hasOwnProperty('item_' + item_id)) {
        return items['item_' + item_id];
    }
    return JSON.parse(mItemTemplate);
}

function lookupPointsFromCategory(id) {
    if (categoryMap.hasOwnProperty(id)) {
        return categoryMap[id].points;
    } else {
        console.error('missing category: ' + id);
        return 0;
    }
}

exports.initialise               = initialise;
exports.lookupItem               = lookupItem;
exports.lookupPointsfromCategory = lookupPointsFromCategory;
exports.getCategoryMaps          = getCategoryMaps;
exports.updateCategoryMap        = updateCategoryMap;
exports.individualCategoryUpdate = individualCategoryUpdate;