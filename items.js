/**
 * Created by Mono on 04-Apr-16.
 */
var api_key = require('./api_key.js');
var prequest = require('prequest');
var Q = require('q');

var items = {
    '0':   { 'category' : 'Unknown (could be anything)',    points : 0, id: 'item0'},
    '2':   { 'category' : 'Knife',                          points : 2, id: 'item2'},
    '3':   { 'category' : 'Pistol',                         points : 2, id: 'item3'},
    '4':   { 'category' : 'Shotgun',                        points : 0, id: 'item4'},
    '5':   { 'category' : 'SMG',                            points : 2, id: 'item5'},
    '6':   { 'category' : 'LMG',                            points : 2, id: 'item6'},
    '7':   { 'category' : 'Assault Rifle',                  points : 2, id: 'item7'},
    '8':   { 'category' : 'Carbine',                        points : 2, id: 'item8'},
    '9':   { 'category' : 'AV MAX (Left)',                  points : 1, id: 'item9'},
    '10':  { 'category' : 'AI MAX (Left)',                  points : 1, id: 'item10'},
    '11':  { 'category' : 'Sniper Rifle',                   points : 2, id: 'item11'},
    '12':  { 'category' : 'Scout Rifle',                    points : 2, id: 'item12'},
    '13':  { 'category' : 'Rocket Launcher',                points : 0, id: 'item13'},
    '14':  { 'category' : 'Heavy Gun',                      points : 1, id: 'item14'},
    '15':  { 'category' : 'Flamethrower MAX',               points : 1, id: 'item15'},
    '16':  { 'category' : 'Flak MAX',                       points : 1, id: 'item16'},
    '17':  { 'category' : 'Grenade',                        points : 2, id: 'item17'},
    '18':  { 'category' : 'Explosive',                      points : 0, id: 'item18'},
    '19':  { 'category' : 'Battle Rifle',                   points : 2, id: 'item19'},
    '20':  { 'category' : 'AA MAX (Right)',                 points : 1, id: 'item20'},
    '21':  { 'category' : 'AV MAX (Right)',                 points : 1, id: 'item21'},
    '22':  { 'category' : 'AI MAX (Right)',                 points : 1, id: 'item22'},
    '23':  { 'category' : 'AA MAX (Left)',                  points : 1, id: 'item23'},
    '24':  { 'category' : 'Crossbow',                       points : 2, id: 'item24'},
    '100': { 'category' : 'Infantry',                       points : 1, id: 'item100'},
    '101': { 'category' : 'Vehicles',                       points : 0, id: 'item101'},
    '102': { 'category' : 'Infantry Weapons',               points : 1, id: 'item102'},
    '104': { 'category' : 'Vehicle Weapons',                points : 0, id: 'item104'},
    '109': { 'category' : 'Flash Primary Weapon',           points : 0, id: 'item109'},
    '110': { 'category' : 'Galaxy Left Weapon',             points : 0, id: 'item110'},
    '111': { 'category' : 'Galaxy Tail Weapon',             points : 0, id: 'item111'},
    '112': { 'category' : 'Galaxy Right Weapon',            points : 0, id: 'item112'},
    '113': { 'category' : 'Galaxy Top Weapon',              points : 0, id: 'item113'},
    '114': { 'category' : 'Harasser Top Gunner',            points : 0, id: 'item114'},
    '115': { 'category' : 'Liberator Belly Weapon',         points : 0, id: 'item115'},
    '116': { 'category' : 'Liberator Nose Cannon',          points : 0, id: 'item116'},
    '117': { 'category' : 'Liberator Tail Weapon',          points : 0, id: 'item117'},
    '118': { 'category' : 'Lightning Primary Weapon',       points : 0, id: 'item118'},
    '119': { 'category' : 'Magrider Gunner Weapon',         points : 0, id: 'item119'},
    '120': { 'category' : 'Magrider Primary Weapon',        points : 0, id: 'item120'},
    '121': { 'category' : 'Mosquito Nose Cannon',           points : 0, id: 'item121'},
    '122': { 'category' : 'Mosquito Wing Mount',            points : 0, id: 'item122'},
    '123': { 'category' : 'Prowler Gunner Weapon',          points : 0, id: 'item123'},
    '124': { 'category' : 'Prowler Primary Weapon',         points : 0, id: 'item124'},
    '125': { 'category' : 'Reaver Nose Cannon',             points : 0, id: 'item125'},
    '126': { 'category' : 'Reaver Wing Mount',              points : 0, id: 'item126'},
    '127': { 'category' : 'Scythe Nose Cannon',             points : 0, id: 'item127'},
    '128': { 'category' : 'Scythe Wing Mount',              points : 0, id: 'item128'},
    '129': { 'category' : 'Sunderer Front Gunner',          points : 0, id: 'item129'},
    '130': { 'category' : 'Sunderer Rear Gunner',           points : 0, id: 'item130'},
    '131': { 'category' : 'Vanguard Gunner Weapon',         points : 0, id: 'item131'},
    '132': { 'category' : 'Vanguard Primary Weapon',        points : 0, id: 'item132'},
    '139': { 'category' : 'Engineer Turrets',               points : 1, id: 'item139'},
    '147': { 'category' : 'Aerial Combat Weapon',           points : 0, id: 'item147'},
    'name': 'Thunderdome Ruleset'
};
//N.B: category 0 doesn't exist in the API but i assume it is for being killed by wreckage or terrain and it was annoying me with error messages so its now in the map
// You can edit this bit to have it return whatever points you want, so this can be used for most rulesets
// Briggs Thunderdome (2016) Scoring:
var thunderdomeCategoryMap = {
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

// Emerald "DurdleDome" (2016)
var emeraldCategoryMap = {
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
    '14':  { 'category' : 'Heavy Gun',                  points : 0, id: 'item14'},
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
    '139': { 'category' : 'Engineer Turrets',           points : 0, id: 'item139'},
    '147': { 'category' : 'Aerial Combat Weapon',       points : 0, id: 'item147'},
    'name': 'Emerald Ruleset'
};

// Briggs OvO (2017)
var ovoCategoryMap = {
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
    '14':  { 'category' : 'Heavy Gun',                  points : 0, id: 'item14'},
    '15':  { 'category' : 'Flamethrower MAX',           points : 0, id: 'item15'},
    '16':  { 'category' : 'Flak MAX',                   points : 0, id: 'item16'},
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
    '139': { 'category' : 'Engineer Turrets',           points : 0, id: 'item139'},
    '147': { 'category' : 'Aerial Combat Weapon',       points : 0, id: 'item147'},
    'name': 'Briggs OvO Ruleset'
};

var categoryMap = thunderdomeCategoryMap;

var categoryMaps = {
    current     : categoryMap,
    thunderdome : thunderdomeCategoryMap,
    emerald     : emeraldCategoryMap,
    OvO         : ovoCategoryMap
};

function getCategoryMaps() {
    return categoryMaps;
}

function updateCategoryMap(number) {
    if (number === 0) {
        categoryMap['0'].points   = thunderdomeCategoryMap['0'].points;
        categoryMap['2'].points   = thunderdomeCategoryMap['2'].points;
        categoryMap['3'].points   = thunderdomeCategoryMap['3'].points;
        categoryMap['4'].points   = thunderdomeCategoryMap['4'].points;
        categoryMap['5'].points   = thunderdomeCategoryMap['5'].points;
        categoryMap['6'].points   = thunderdomeCategoryMap['6'].points;
        categoryMap['7'].points   = thunderdomeCategoryMap['7'].points;
        categoryMap['8'].points   = thunderdomeCategoryMap['8'].points;
        categoryMap['9'].points   = thunderdomeCategoryMap['9'].points;
        categoryMap['10'].points  = thunderdomeCategoryMap['10'].points;
        categoryMap['11'].points  = thunderdomeCategoryMap['11'].points;
        categoryMap['12'].points  = thunderdomeCategoryMap['12'].points;
        categoryMap['13'].points  = thunderdomeCategoryMap['13'].points;
        categoryMap['14'].points  = thunderdomeCategoryMap['14'].points;
        categoryMap['15'].points  = thunderdomeCategoryMap['15'].points;
        categoryMap['16'].points  = thunderdomeCategoryMap['16'].points;
        categoryMap['17'].points  = thunderdomeCategoryMap['17'].points;
        categoryMap['18'].points  = thunderdomeCategoryMap['18'].points;
        categoryMap['19'].points  = thunderdomeCategoryMap['19'].points;
        categoryMap['20'].points  = thunderdomeCategoryMap['20'].points;
        categoryMap['21'].points  = thunderdomeCategoryMap['21'].points;
        categoryMap['22'].points  = thunderdomeCategoryMap['22'].points;
        categoryMap['23'].points  = thunderdomeCategoryMap['23'].points;
        categoryMap['24'].points  = thunderdomeCategoryMap['24'].points;
        categoryMap['100'].points = thunderdomeCategoryMap['100'].points;
        categoryMap['101'].points = thunderdomeCategoryMap['101'].points;
        categoryMap['102'].points = thunderdomeCategoryMap['102'].points;
        categoryMap['104'].points = thunderdomeCategoryMap['104'].points;
        categoryMap['109'].points = thunderdomeCategoryMap['109'].points;
        categoryMap['110'].points = thunderdomeCategoryMap['110'].points;
        categoryMap['111'].points = thunderdomeCategoryMap['111'].points;
        categoryMap['112'].points = thunderdomeCategoryMap['112'].points;
        categoryMap['113'].points = thunderdomeCategoryMap['113'].points;
        categoryMap['114'].points = thunderdomeCategoryMap['114'].points;
        categoryMap['115'].points = thunderdomeCategoryMap['115'].points;
        categoryMap['116'].points = thunderdomeCategoryMap['116'].points;
        categoryMap['117'].points = thunderdomeCategoryMap['117'].points;
        categoryMap['118'].points = thunderdomeCategoryMap['118'].points;
        categoryMap['119'].points = thunderdomeCategoryMap['119'].points;
        categoryMap['120'].points = thunderdomeCategoryMap['120'].points;
        categoryMap['121'].points = thunderdomeCategoryMap['121'].points;
        categoryMap['122'].points = thunderdomeCategoryMap['122'].points;
        categoryMap['123'].points = thunderdomeCategoryMap['123'].points;
        categoryMap['124'].points = thunderdomeCategoryMap['124'].points;
        categoryMap['125'].points = thunderdomeCategoryMap['125'].points;
        categoryMap['126'].points = thunderdomeCategoryMap['126'].points;
        categoryMap['127'].points = thunderdomeCategoryMap['127'].points;
        categoryMap['128'].points = thunderdomeCategoryMap['128'].points;
        categoryMap['129'].points = thunderdomeCategoryMap['129'].points;
        categoryMap['130'].points = thunderdomeCategoryMap['130'].points;
        categoryMap['131'].points = thunderdomeCategoryMap['131'].points;
        categoryMap['132'].points = thunderdomeCategoryMap['132'].points;
        categoryMap['139'].points = thunderdomeCategoryMap['139'].points;
        categoryMap['147'].points = thunderdomeCategoryMap['147'].points;
    }
    if (number === 1) {
        categoryMap['0'].points   = emeraldCategoryMap['0'].points;
        categoryMap['2'].points   = emeraldCategoryMap['2'].points;
        categoryMap['3'].points   = emeraldCategoryMap['3'].points;
        categoryMap['4'].points   = emeraldCategoryMap['4'].points;
        categoryMap['5'].points   = emeraldCategoryMap['5'].points;
        categoryMap['6'].points   = emeraldCategoryMap['6'].points;
        categoryMap['7'].points   = emeraldCategoryMap['7'].points;
        categoryMap['8'].points   = emeraldCategoryMap['8'].points;
        categoryMap['9'].points   = emeraldCategoryMap['9'].points;
        categoryMap['10'].points  = emeraldCategoryMap['10'].points;
        categoryMap['11'].points  = emeraldCategoryMap['11'].points;
        categoryMap['12'].points  = emeraldCategoryMap['12'].points;
        categoryMap['13'].points  = emeraldCategoryMap['13'].points;
        categoryMap['14'].points  = emeraldCategoryMap['14'].points;
        categoryMap['15'].points  = emeraldCategoryMap['15'].points;
        categoryMap['16'].points  = emeraldCategoryMap['16'].points;
        categoryMap['17'].points  = emeraldCategoryMap['17'].points;
        categoryMap['18'].points  = emeraldCategoryMap['18'].points;
        categoryMap['19'].points  = emeraldCategoryMap['19'].points;
        categoryMap['20'].points  = emeraldCategoryMap['20'].points;
        categoryMap['21'].points  = emeraldCategoryMap['21'].points;
        categoryMap['22'].points  = emeraldCategoryMap['22'].points;
        categoryMap['23'].points  = emeraldCategoryMap['23'].points;
        categoryMap['24'].points  = emeraldCategoryMap['24'].points;
        categoryMap['100'].points = emeraldCategoryMap['100'].points;
        categoryMap['101'].points = emeraldCategoryMap['101'].points;
        categoryMap['102'].points = emeraldCategoryMap['102'].points;
        categoryMap['104'].points = emeraldCategoryMap['104'].points;
        categoryMap['109'].points = emeraldCategoryMap['109'].points;
        categoryMap['110'].points = emeraldCategoryMap['110'].points;
        categoryMap['111'].points = emeraldCategoryMap['111'].points;
        categoryMap['112'].points = emeraldCategoryMap['112'].points;
        categoryMap['113'].points = emeraldCategoryMap['113'].points;
        categoryMap['114'].points = emeraldCategoryMap['114'].points;
        categoryMap['115'].points = emeraldCategoryMap['115'].points;
        categoryMap['116'].points = emeraldCategoryMap['116'].points;
        categoryMap['117'].points = emeraldCategoryMap['117'].points;
        categoryMap['118'].points = emeraldCategoryMap['118'].points;
        categoryMap['119'].points = emeraldCategoryMap['119'].points;
        categoryMap['120'].points = emeraldCategoryMap['120'].points;
        categoryMap['121'].points = emeraldCategoryMap['121'].points;
        categoryMap['122'].points = emeraldCategoryMap['122'].points;
        categoryMap['123'].points = emeraldCategoryMap['123'].points;
        categoryMap['124'].points = emeraldCategoryMap['124'].points;
        categoryMap['125'].points = emeraldCategoryMap['125'].points;
        categoryMap['126'].points = emeraldCategoryMap['126'].points;
        categoryMap['127'].points = emeraldCategoryMap['127'].points;
        categoryMap['128'].points = emeraldCategoryMap['128'].points;
        categoryMap['129'].points = emeraldCategoryMap['129'].points;
        categoryMap['130'].points = emeraldCategoryMap['130'].points;
        categoryMap['131'].points = emeraldCategoryMap['131'].points;
        categoryMap['132'].points = emeraldCategoryMap['132'].points;
        categoryMap['139'].points = emeraldCategoryMap['139'].points;
        categoryMap['147'].points = emeraldCategoryMap['147'].points;
    }
    if (number === 2) {
        categoryMap['0'].points   = ovoCategoryMap['0'].points;
        categoryMap['2'].points   = ovoCategoryMap['2'].points;
        categoryMap['3'].points   = ovoCategoryMap['3'].points;
        categoryMap['4'].points   = ovoCategoryMap['4'].points;
        categoryMap['5'].points   = ovoCategoryMap['5'].points;
        categoryMap['6'].points   = ovoCategoryMap['6'].points;
        categoryMap['7'].points   = ovoCategoryMap['7'].points;
        categoryMap['8'].points   = ovoCategoryMap['8'].points;
        categoryMap['9'].points   = ovoCategoryMap['9'].points;
        categoryMap['10'].points  = ovoCategoryMap['10'].points;
        categoryMap['11'].points  = ovoCategoryMap['11'].points;
        categoryMap['12'].points  = ovoCategoryMap['12'].points;
        categoryMap['13'].points  = ovoCategoryMap['13'].points;
        categoryMap['14'].points  = ovoCategoryMap['14'].points;
        categoryMap['15'].points  = ovoCategoryMap['15'].points;
        categoryMap['16'].points  = ovoCategoryMap['16'].points;
        categoryMap['17'].points  = ovoCategoryMap['17'].points;
        categoryMap['18'].points  = ovoCategoryMap['18'].points;
        categoryMap['19'].points  = ovoCategoryMap['19'].points;
        categoryMap['20'].points  = ovoCategoryMap['20'].points;
        categoryMap['21'].points  = ovoCategoryMap['21'].points;
        categoryMap['22'].points  = ovoCategoryMap['22'].points;
        categoryMap['23'].points  = ovoCategoryMap['23'].points;
        categoryMap['24'].points  = ovoCategoryMap['24'].points;
        categoryMap['100'].points = ovoCategoryMap['100'].points;
        categoryMap['101'].points = ovoCategoryMap['101'].points;
        categoryMap['102'].points = ovoCategoryMap['102'].points;
        categoryMap['104'].points = ovoCategoryMap['104'].points;
        categoryMap['109'].points = ovoCategoryMap['109'].points;
        categoryMap['110'].points = ovoCategoryMap['110'].points;
        categoryMap['111'].points = ovoCategoryMap['111'].points;
        categoryMap['112'].points = ovoCategoryMap['112'].points;
        categoryMap['113'].points = ovoCategoryMap['113'].points;
        categoryMap['114'].points = ovoCategoryMap['114'].points;
        categoryMap['115'].points = ovoCategoryMap['115'].points;
        categoryMap['116'].points = ovoCategoryMap['116'].points;
        categoryMap['117'].points = ovoCategoryMap['117'].points;
        categoryMap['118'].points = ovoCategoryMap['118'].points;
        categoryMap['119'].points = ovoCategoryMap['119'].points;
        categoryMap['120'].points = ovoCategoryMap['120'].points;
        categoryMap['121'].points = ovoCategoryMap['121'].points;
        categoryMap['122'].points = ovoCategoryMap['122'].points;
        categoryMap['123'].points = ovoCategoryMap['123'].points;
        categoryMap['124'].points = ovoCategoryMap['124'].points;
        categoryMap['125'].points = ovoCategoryMap['125'].points;
        categoryMap['126'].points = ovoCategoryMap['126'].points;
        categoryMap['127'].points = ovoCategoryMap['127'].points;
        categoryMap['128'].points = ovoCategoryMap['128'].points;
        categoryMap['129'].points = ovoCategoryMap['129'].points;
        categoryMap['130'].points = ovoCategoryMap['130'].points;
        categoryMap['131'].points = ovoCategoryMap['131'].points;
        categoryMap['132'].points = ovoCategoryMap['132'].points;
        categoryMap['139'].points = ovoCategoryMap['139'].points;
        categoryMap['147'].points = ovoCategoryMap['147'].points;
    }
}

function individualCategoryUpdate(updates) {
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

var mItemTemplate = JSON.stringify({
    _id :  0,
    category_id: 0,
    name:  'Unknown',
    desc:  '',
    image: 0
});

function initialise() {
  if (categoryMap === 0) { categoryMap = thunderdomeCategoryMap;}
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