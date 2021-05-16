const csv = require('csv-parser');
const fs = require('fs');
const locationsUtils = require('./hitlocations.js');
const currencyUtils = require('./currency.js');
const hitLocations = locationsUtils.hitLocations;
const results = [];

/*
fs.createReadStream('data/armors.csv')
  .pipe(csv(['type','name','avc','avp','avb','coverage','qualities','wt','cost']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    let parsed = parseResults(results);
    fs.appendFile('armors.json', JSON.stringify(parsed), (err) => {
      if (err) throw err;
      console.log('Saved!')
    })
  });
*/

  fs.createReadStream('data/helmets.csv')
    .pipe(csv(['type','name','avc','avp','avb','coverage','qualities','wt', 'pp','cost']))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let parsed = parseResults(results);
      //console.log(JSON.stringify(parsed));

      fs.appendFile('helmets.json', JSON.stringify(parsed), (err) => {
        if (err) throw err;
        console.log('Saved!')
      })
    });

function parseResults(readItems) {
  let armors = [];
  readItems.forEach(item => {
    let armor = {
      name: item.name,
      type: item.type,
      avc: item.avc,
      avp: item.avp,
      avb: item.avb,
      coverage: [],
      qualities: [],
      wt: item.wt,
      pp: 0,
      cost: [],
      specials: []
    }
    //console.log(item.coverage);
    let parsedCoverage = {};
    parsedCoverage = parseCoverage(item.coverage.toLowerCase());
    armor.coverage = parsedCoverage.locations;
    armor.specials = parsedCoverage.specials;

    let parsedQualities = [];
    parsedQualities = parseQualities(item.qualities);
    armor.qualities = parsedQualities;

    if (item.hasOwnProperty("pp")) {
      armor.pp = item.pp;
    }

    armor.cost = currencyUtils.parseCurrency(item.cost);

    //console.log(JSON.stringify(armor));
    armors.push(armor);
  })
  return armors;
}


let coverage = {
  location: "",
  special: [{
      type: "WP" //weak points
    }, {
      type: "HalfAVvTh" //half av vs thrust
    },
    {
      type: "NoAVvTH" // no av vs thrust
    }, {
      type: "ThOnly" // thrust only
    }, {
      type: "Spaulder" // spaulder/besagew synergy
    }, {
      type: "bonusAVvSwing", //bonus av from swing from certain direction
      swing: "upward",
      val: 0
    }, {
      type: "GreatHelm" // is a great helm for gh+bascinet puroses
    }, {
      type: "GreatHelmLayer" //can layer with greathelm
    }, {
      type: "Besagew" //spaulder/besagew synergy
    }, {
      type: "NoAVvSwing", //no av vs swing from certain direction
      swing: "upward",
      location: ""
    }
  ]
}

function parseCoverage(coverageString) {
  let coverageLocations = [];
  let specials = [];
  let bonusChunk = ''
  let bonusAVRegex = /\+([0-9]) av on ([a-z ,]+)/
  let bonusAVLocation = coverageString.match(bonusAVRegex);
  if (bonusAVLocation) {
    bonusChunk = bonusAVLocation[0];
    coverageString = coverageString.substr(0, coverageString.length - (bonusChunk.length + 2));
    //console.log("String:" + coverageString);
  }

  let chunks = coverageString.split(", ");
  if (bonusChunk != '') {
    chunks.push(bonusChunk);
  }
  //console.log(chunks);
  chunks.forEach( chunk => {
    //console.log("");
    //console.log("Chunk: " + chunk);
    let coverageLocation = {
      location: '',
      special: []
    };

    //find hit location from chunk
    let chunkLocation = '';
    let weakPoints = false;
    let halfAV = false;
    let thrustOnly = false;
    //chunk starts with "Half AV"
    if (chunk.startsWith("half av")) {
      let regex = /half av against ([a-z]+) to ([a-z]+)/;
      let match = chunk.match(regex);
      let damageType = match[1];
      let halfLocation = match[2];

      if (locationsUtils.isPlural(halfLocation)) {
        halfLocation = locationsUtils.pluralLocation(halfLocation);
      }

      specials.push( {
        type: "HalfAVonLocation",
        damage: damageType,
        location: halfLocation
      })

    } else if (chunk.startsWith("no av against th")) {
      //console.log("No AV Against TH")
      specials.push({
        type: "NoAVvTH" // no av vs thrust
      });

    } else if (chunk.startsWith("when layered with spaulders")) {
      //console.log("Spaulder layer")
      specials.push( {
        type: "Besagew" // spaulder/besagew synergy
      });

    } else if (chunk.startsWith("no av against th")) {
      //console.log("NO av vs th")
      specials.push({
        type: "NoAVvTH" // no av vs thrust
      })
    }
    //helmet chunks
    else if (chunk.startsWith("wear skullcap or")) {
      specials.push({
        type: "GreatHelm" // is a great helm for gh+bascinet puroses
      })
    }
    else if (chunk.startsWith("wear great helm")) {
      specials.push({
        type: "GreatHelmLayer" //can layer with greathelm
      })
    }
    else if (chunk.startsWith("no av on")) {
      let regex = /no av on ([a-z]+) vs ([a-z]+) swings/;
      let match = chunk.match(regex);
      let specialLocation = match[1];
      let specialDirection = match[2];
      specials.push({
        type: "NoAVvSwing", //no av vs swing from certain direction
        swing: specialDirection,
        location: specialLocation
      })

    }
    else if (chunk.startsWith("no av vs")) {
      let regex = /no av vs ([a-z]+) swings/;
      let match = chunk.match(regex);
      let specialDirection = match[1];
      specials.push({
        type: "NoAVvSwing", //no av vs swing from certain direction
        swing: specialDirection,
        location: ""
      })
    }
    else if (chunk.startsWith("+")) {
      //+x av on [location, location]
      if (chunk.search(/\+[0-9] av on/) != -1) {
        let regex = /\+([0-9]) av on ([a-z ,]+)/
        let match = chunk.match(regex);
        let avBonus = match[1];
        let avLocations = match[2];
        //console.log(chunk);
        //console.log(match);
        avLocations = avLocations.split(", ");
        //console.log(avLocations);
        if (avLocations.length > 1) {
          avLocations.forEach( avLocation => { //this could be slightly more efficient
            if (avLocation.startsWith("and ")) {
              avLocation = avLocation.substr(4, avLocation.length);
            }
          })
        }

        specials.push( {
          type: "BonusAVonLocations",
          value: avBonus,
          locations: avLocations
        });

      } else if (chunk.search(/\+[0-9] av vs/) != -1) {//+x av vs downward swings
        let regex = /\+([0-9]) av vs ([a-z]+) swings/
        let match = chunk.match(regex);
        let avBonus = match[1];
        let swingDirection = match[2];

        specials.push( {
          type: "BonusAVonSwing",
          value: avBonus,
          swing: swingDirection
        })
      }
    }
    else hitLocations.forEach( hitLocation => { //each location in the hit locations list
      if (chunkLocation === '') { //while not found
        if (chunk.search(hitLocation.name) != -1) { //if true, location is in the chunk
          chunkLocation = hitLocation.name;
          //console.log("Found location: " + chunkLocation)
        }
        if (chunk.search("feet") != -1) {
          chunkLocation = "foot";
        }
      }
    })

    if (chunkLocation ==='') {
      locationsUtils.compoundLocations.forEach( compound => {
        if (chunkLocation === '') {
          if (chunk.search(compound.name) != -1) {
            chunkLocation = "compound:" + compound.name;
          }
        }
      })
    }

    if (chunkLocation != '') { //hit location has been found
      //check for weak points
      if (chunk.search("‡") != -1) {
        weakPoints = true;
      }
      //check for flat half av
      if (chunk.search("½") != -1) {
        halfAV = true;
      }

      if (chunk.search(/\(th\)/) != -1) {
        thrustOnly = true;
      }
    }

    //if chunk was a compound location
      // push coverage locations w/ special tags

    //if chunk was a single location
    //  push coverage location w/ special tags
    if (chunkLocation != '' && !chunkLocation.startsWith("compound:")) {
      coverageLocation.location = chunkLocation
      coverageLocations.push(coverageLocation);

      if (weakPoints) {
        coverageLocation.special.push(
          {
              type: "WP" //weak points
            }
        )
      }

      if (thrustOnly) {
        coverageLocation.special.push(
          {
              type: "ThrustOnly" //weak points
            })
      }

      if (halfAV) {
        coverageLocation.special.push(
          {
              type: "HalfAV" //weak points
            })
      }
    } else if (chunkLocation.startsWith("compound:")) {
      chunkLocation = chunkLocation.substr(9, chunkLocation.length);
      let locationList = [];
      //console.log("Compound: " + chunkLocation)
      locationsUtils.compoundLocations.forEach( compound => {
        if (locationList.length == 0) {
          if (chunkLocation === compound.name) {
            //console.log("Found: " + compound.coverage)
            locationList = compound.coverage;
          }
        }
      })
      locationList.forEach( coverageLocation => {
        let obj = {
          location: coverageLocation,
          special: []
        }
        coverageLocations.push(obj);
      })
    }
  })



  return {
    locations: coverageLocations,
    specials: specials
  };

}

function parseQualities(qualitiesString) {
  qualities = [];
  let chunks = qualitiesString.split(", ");
  //console.log(chunks);
  chunks.filter(chunk => chunk != "-" && chunk).forEach( chunk => {
    let regex = /([A-z]+) ?([0-9]+)?/
    let match = chunk.match(regex);
    //console.log(chunk);
    //console.log(match)
    let quality = match[1];
    let value = 0;
    if (typeof match[2] !== undefined) {
      value = match[2];
    }
    let obj = {
      name: quality
    }
    if (value > 0) {
      obj.level = value;
    }
    qualities.push(obj);
})
return qualities;
}
/*
For each armor piece:
  get type, name, avc/p/b, wt, pp(if exists), cost []
  parse coverage:
    coverage locations
      match location from list
      break down compound locations
      weak points + half av
      half av vs [attack type]
    no av on [location] vs [direction] swings
    No av against [attack type] of any damage type
    half av against [attack type] to [location]
    when layered with spaulders use besagews value against [attack type]
    wear great helm for layer 2
    wear skullcap or bascinet for layer 1
    +x av on [location]
    +x av vs [direction] swings

  parse qualities
    quality
    quality (x)



*/
