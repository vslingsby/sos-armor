const hitLocations = [
  {
    name: "upper head",
    id: 1,
    paired: false
  },
  {
    name: "face",
    id: 2,
    paired: false
  },
  {
    name: "lower head",
    id: 3,
    paired: false
  },
  {
    name: "neck",
    id: 4,
    paired: false
  },
  {
    name: "shoulder",
    id: 5,
    paired: true
  },
  {
    name: "chest",
    id: 6,
    paired: false
  },
  {
    name: "side",
    id: 7,
    paired: true
  },
  {
    name: "belly",
    id: 8,
    paired: false
  },
  {
    name: "hip",
    id: 9,
    paired: true
  },
  {
    name: "groin",
    id: 10,
    paired: false
  },
  {
    name: "upper arm",
    id: 11,
    paired: true
  },
  {
    name: "elbow",
    id: 12,
    paired: true
  },
  {
    name: "forearm",
    id: 13,
    paired: true
  },
  {
    name: "hand",
    id: 14,
    paired: true
  },
  {
    name: "thigh",
    id: 15,
    paired: true
  },
  {
    name: "knee",
    id: 16,
    paired: true
  },
  {
    name: "shin",
    id: 17,
    paired: true
  },
  {
    name: "foot",
    id: 18,
    paired: true
  },
  {
    name: "upper back",
    id: 19,
    paired: false
  },
  {
    name: "lower back",
    id: 20,
    paired: false
  },
]

const compoundLocations = [
  {
    name: "full leg",
    coverage: [
      "thigh", "knee", "shin", "foot"
    ]
  },
  {
    name: "full arm",
    coverage: ["shoulder","upper arm","elbow","forearm", "hand"]
  },
  {
    name: "full head",
    coverage: ["upper head","lower head","face"]
  },
  {
    name: "full torso",
    coverage: ["chest", "side", "hip", "belly"]
  }
];

function pluralLocation(plural) {
  if (plural === "feet") {
    return "foot"
  } else return plural.substr(0, plural.length - 1);
}

function isPlural(string) {
  if (string === "feet") {
    return true;
  } else if (string.endsWith("s")) {
    return true;
  } else return false;
}

module.exports.isPlural = isPlural;
module.exports.pluralLocation = pluralLocation;
module.exports.hitLocations = hitLocations;
module.exports.compoundLocations = compoundLocations;
