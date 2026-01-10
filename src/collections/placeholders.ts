import { SCOPES } from "../constants/figmaConstants";
import { FigmaCollection } from "../types";
import { generateVariable } from "../utils/figmaUtils";
import { generateModeJson } from "../utils/jsonUtils";

const variables: { [key: string]: any } = {};

const config = {
  brandName: "WaddleDesign",
  productName: "FigmaDuck",
  slogan: "Design. Quack. Repeat.",
  company: {
    name: "Quack Industries",
    domain: "quackindustries.com",
    email: "contact@quackindustries.com",
    telephone: "+33687654321",
    adress: {
      street: "123 Pond Street",
      city: "Duckburg",
      zip: "12345",
      country: "USA",
    },
  },
  label: "Tagaduck",
  placeholder: "Quackadummy",
  lorem: {
    sentence1: [
      "Duckus caelum spectat, nubibus incerta.",
      "Non omnes duckum flapant sed omnes aquam amant.",
      "Nemo anati imperat, illa simpliciter vivit.",
      "In tenebris noctis, duckus solus natat.",
      "Gutta una in rostro cadit, semel quacat.",
      "Nidus duckum est arx tranquilla ex plumis.",
      "Stagnum argentum speculat dum luna lucet.",
      "Plumae in aere ut vela parva fluitant.",
      "Senex mallardus iuxta iuncos sedet quietus.",
      "Ducklingi de ripa cadit cum sonitu molli.",
    ],
    sentences2: [
      "Lorem quacksum sit amet, pondsectetur waddlit elit. Mallard ipsum dolor waddle amet beaklet.",
      "Preen aute irure duck in reprehenderit in wing velit esse cillum quack dolore eu fugiat nulla duckling. Excepteur sint occaecat beakcat cupidatat non plumage.",
      "Vesper venit cum auro in aqua et silentio inter iuncos. Duckum se componunt in frigore, capita sub alis abscondita.",
      "Duckus caelum spectat, nubibus incerta. Gutta una in rostro cadit, palpebrat, semel quacat.",
      "Non omnes duckum flapant. Quaedam aquas minutas et umbram salicum praeferunt.",
      "Guttae pluviae lente et graviter in stagni superficiem cadunt. Duckus pluviam non curat — plumas ungit, lutum reficit.",
      "Senex mallardus iuxta iuncos sedet, oculis semi-clausis. Insecta iam non persequitur, nec anseres provocat.",
      "Plumae in aere ut vela parva fluitant dum grex duckatum volat. Alae una pulsant, percussionem mollis supra arbores creantes.",
      "Nemo anati imperat. Illa simpliciter vivit — natare, ambulare, quacare cum opus est.",
      "In tenebris noctis, duckus solus sub luce lunari natat. Stagnum argentum speculat, et cor eius pacem invenit.",
    ],
    sentences3: [
      "Lorem quacksum sit amet, pondsectetur waddlit elit. Mallard ipsum dolor waddle amet beaklet. Flap eiusmod tempor incididunt ut paddle et quack magna aliqua.",
      "Vesper venit cum auro in aqua et silentio inter iuncos. Duckum se componunt in frigore, capita sub alis abscondita. Stagnum diem obliviscitur et lunam exspectat.",
      "Duckus caelum spectat, nubibus incerta. Gutta una in rostro cadit. Palpebrat, semel quacat, deinde remigat.",
      "Non omnes duckum flapant. Quaedam aquas minutas et umbram salicum praeferunt. Est etiam fortitudo in statione ubi cor pacem sentit.",
      "Nidus duckum est arx tranquilla ex plumis et ramis. Intus, calor parvis cordibus pulsat, cum pipiationibus mollibus. Mater duckus pennam rostro componit.",
      "Guttae pluviae lente et graviter in stagni superficiem cadunt. Duckus pluviam non curat — plumas ungit, lutum reficit. Mundus iterum novus videtur.",
      "Senex mallardus iuxta iuncos sedet, oculis semi-clausis, stagna antiqua reminiscens. Insecta iam non persequitur, nec anseres provocat. Ventum audit et de pane somniat.",
      "Ducklingi de ripa cadit, in luto cum sonitu molli ploppat. Non perturbata, natat ulterius, libellulam insequens. In mundo duckorum, etiam defectus iucundus est.",
      "Plumae in aere ut vela parva fluitant dum grex duckatum volat. Alae una pulsant, percussionem mollis supra arbores creantes. Subter, stagnum fluctuat, tum tacet.",
      "Quackus necessarius est ad vitam duckorum. Sine quacko, duckus mutus videtur. Ideo quackus est vox animae duckorum.",
    ],
    sentences4: [
      "Lorem quacksum sit amet, pondsectetur waddlit elit. Mallard ipsum dolor waddle amet beaklet. Flap eiusmod tempor incididunt ut paddle et quack magna aliqua. Ut enim ad minim nest, quis nostrud swimming exercitation ullamco waddling nisi.",
      "Preen aute irure duck in reprehenderit in wing velit esse cillum quack dolore eu fugiat nulla duckling. Excepteur sint occaecat beakcat cupidatat non plumage, sunt in culpa qui flock deserunt mollit. Anim id est down et convallis vitae.",
      "Vesper venit cum auro in aqua et silentio inter iuncos. Duckum se componunt in frigore, capita sub alis abscondita. Stagnum diem obliviscitur et lunam exspectat. Nox tranquilla duckorum domicilium est.",
      "Duckus caelum spectat, nubibus incerta. Gutta una in rostro cadit. Palpebrat, semel quacat, deinde remigat. Quaedam mysteria nesciri meliora sunt quam cognita.",
      "Non omnes duckum flapant. Quaedam aquas minutas et umbram salicum praeferunt. Est etiam fortitudo in statione ubi cor pacem sentit. Volare non est necessarium ad esse felix.",
      "Senex mallardus iuxta iuncos sedet, oculis semi-clausis, stagna antiqua reminiscens. Insecta iam non persequitur, nec anseres provocat. Ventum audit, et de pane somniat. Memoria est thesaurus duckorum.",
    ],
    sentences5: [
      "Lorem quacksum sit amet, pondsectetur waddlit elit. Mallard ipsum dolor waddle amet beaklet. Flap eiusmod tempor incididunt ut paddle et quack magna aliqua. Ut enim ad minim nest, quis nostrud swimming exercitation ullamco waddling nisi ut aliquip ex ea feather commodo. Sed do eiusmod tempor duckum in voluptate.",
      "Preen aute irure duck in reprehenderit in wing velit esse cillum quack dolore eu fugiat nulla duckling. Excepteur sint occaecat beakcat cupidatat non plumage, sunt in culpa qui flock deserunt mollit anim id est down. Ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.",
      "Vesper venit cum auro in aqua et silentio inter iuncos. Duckum se componunt in frigore, capita sub alis abscondita. Stagnum diem obliviscitur et lunam exspectat. Nox tranquilla duckorum domicilium est, ubi somnia gentilia volitant. Mane reveniet cum sole et novo ominibus.",
      "Duckus caelum spectat, nubibus incerta. Gutta una in rostro cadit. Palpebrat, semel quacat, deinde remigat. Quaedam mysteria nesciri meliora sunt quam cognita esse. Sapientia duckorum est scire quando tacere debeas.",
      "Non omnes duckum flapant. Quaedam aquas minutas et umbram salicum praeferunt. Est etiam fortitudo in statione ubi cor pacem sentit. Volare non est necessarium ad esse felix et contentus. Paradoxum vitae duckorum est libertas in limitationibus.",
    ],
  },
  citations: [
    '"Tempus fugit, duckus manet."',
    '"Omnis duckus ad suum pondum revertit."',
    '"Quackare non nocere."',
    '"Dux duckus, ergo victus est serenus."',
    '"Vade retro, cattus domesticus!"',
    '"In aqua tranquillus, sub plumis chaos."',
    '"Flappium ergo sum."',
    '"Quackus est verbum sapientis."',
    '"Duckus serenum, paddlus intensus."',
    '"If it walks like a duck, swims like a duck, and quacks like a duck... it probably forgot its password again."',
    '"Mother Ducker knows best."',
    '"With a duck, there\'s no pretense. A duck is just... a duck." — Garrison Keillor',
  ],
  idioms: [
    "Like a sitting duck",
    "This is ducked",
    "Water off a duck's back",
    "Get your ducks in a row",
    "Duck and cover",
    "Wild duck chase",
    "Dead duck",
    "Quack it!",
    "What the quack?",
    "Quack me sideways",
    "Holy quack",
    "Quack yeah!",
    "Quack happens",
    "Full quack mode",
    "Just quack it",
    "For duck's sake",
    "Motherducker",
    "Duck around and find out",
    "That's ducked up",
    "Ducking awesome",
  ],
  words: {
    nouns: {
      canard: "Dusck",
      family: {
        mâle: "Drake",
        femelle: "Hen duck",
        petit: "Duckling",
        oeuf: "Egg",
        Nid: "Nest",
        Groupe: "Raft",
        Vol: "Flock",
      },
      anatomy: {
        Bec: "Beak",
        Ailes: "Wings",
        "Pieds palmés": "Webbed feet",
        Plumes: "Feathers",
        Plumage: "Plumage",
        Queue: "Tail",
      },
      habitat: {
        Étang: "Pond",
        "Point d'eau": "Waterbody",
        Lac: "Lake",
        Marais: "Marsh",
        Marégage: "Wetland",
        Roselière: "Reed bed",
        Elevage: "Duckery",
      },
      species: {
        Colvert: "Mallard",
        "Canard de Pékin": "Pekin duck",
        "Canard noir": "Black duck",
        "Canard branchu": "Wood duck",
        "Canard pilet": "Northern Pintail",
        Sarcelle: "Teal",
        Fuligule: "Canvasback",
        "Canard chipeau": "Gadwall",
        "Canard mandarin": "Mandarin duck",
        "Canard souchet": "Northern Shoveler",
        "Canard siffleur": "Wigeon",
        "Canard de Barbarie": "Muscovy duck",
      },
    },
    verbs: {
      Cancaner: "Quacking",
      Barboter: "Dabbling",
      Nager: "Swimming",
      Plonger: "Diving",
      "Battre des ailes": "Flapping",
      Voler: "Flying",
      "Se dandiner": "Waddling",
      "Se toiletter": "Preening",
      Nidifier: "Nesting",
      Couver: "Brooding",
      Eclore: "Hatching",
      Migrer: "Migrating",
    },
    adjectives: {
      Duveteux: "Fluffy",
      Palmé: "Webbed",
      Gracieux: "Graceful",
      Sauvage: "Wild",
      Migrateur: "Migratory",
      Aquatique: "Aquatic",
      Domestique: "Domestic",
      Coloré: "Colorful",
      Bruyant: "Noisy",
      Timide: "Shy",
      Aventurier: "Adventurous",
      Curieux: "Curious",
    },
    onomatopoeias: {
      "Coin-coin": "Quack",
      "Cri-cri": "Squeak",
      "Flap-flap": "Flap",
      Plouf: "Splash",
      Plop: "Plop",
    },
  },
  characters: {
    Picsou: {
      name: "Scrooge McDuck",
      pseudo: "Picsou",
      function: "Rich uncle",
      email: "scrooge@duckburg.com",
      telephone: "+33612345678",
      adress: {
        street: "124 Duckburg Lane",
        city: "Duckburg",
        zip: "12345",
        country: "USA",
      },
    },
    Donald: {
      name: "Donald Duck",
      pseudo: "Donald",
      function: "Main character",
      email: "donald@duckburg.com",
      telephone: "+33687654321",
      adress: {
        street: "42 Barksdale Street",
        city: "Duckburg",
        zip: "54321",
        country: "USA",
      },
    },
    Daisy: {
      name: "Daisy Duck",
      pseudo: "Daisy",
      function: "Donald's girlfriend",
      email: "daisy@duckburg.com",
      telephone: "+33611223344",
      adress: {
        street: "56 Quack Avenue",
        city: "Duckburg",
        zip: "67890",
        country: "USA",
      },
    },
    Riri: {
      name: "Huey",
      pseudo: "Huey",
      function: "One of Donald's nephews",
      email: "huey@duckburg.com",
      telephone: "+33644332211",
      adress: {
        street: "78 Feather Road",
        city: "Duckburg",
        zip: "98765",
        country: "USA",
      },
    },
    Fifi: {
      name: "Dewey",
      pseudo: "Dewey",
      function: "One of Donald's nephews",
      email: "dewey@duckburg.com",
      telephone: "+33655667788",
      adress: {
        street: "90 Beak Boulevard",
        city: "Duckburg",
        zip: "87654",
        country: "USA",
      },
    },
    Loulou: {
      name: "Louie",
      pseudo: "Louie",
      function: "One of Donald's nephews",
      email: "louie@duckburg.com",
      telephone: "+33699887766",
      adress: {
        street: "23 Wing Street",
        city: "Duckburg",
        zip: "76543",
        country: "USA",
      },
    },
    Zaza: {
      name: "Webby Vanderquack",
      pseudo: "Webby",
      function: "Donald's niece",
      email: "webby@duckburg.com",
      telephone: "+33666554433",
      adress: {
        street: "34 Pond Place",
        city: "Duckburg",
        zip: "65432",
        country: "USA",
      },
    },
    "Flagada Jones": {
      name: "Launchpad McQuack",
      pseudo: "Launchpad",
      function: "Pilot",
      email: "launchpad@duckburg.com",
      telephone: "+33633445566",
      adress: {
        street: "89 Skyway Drive",
        city: "Duckburg",
        zip: "43210",
        country: "USA",
      },
    },
    "Géo Trouvetou": {
      name: "Gyro Gearloose",
      pseudo: "Gyro",
      function: "Inventor",
      email: "gyro@duckburg.com",
      telephone: "+33622113344",
      adress: {
        street: "67 Innovation Lane",
        city: "Duckburg",
        zip: "32109",
        country: "USA",
      },
    },
    "Miss Tick": {
      name: "Magica De Spell",
      pseudo: "Magica",
      function: "Evil magician",
      email: "magica@duckburg.com",
      telephone: "+33677889900",
      adress: {
        street: "45 Dark Alley",
        city: "Duckburg",
        zip: "21098",
        country: "USA",
      },
    },
    "Flintheart McKracken": {
      name: "Flintheart Glomgold",
      pseudo: "Flintheart",
      function: "Rival",
      email: "flintheart@duckburg.com",
      telephone: "+33688776655",
      adress: {
        street: "101 Rival Road",
        city: "Duckburg",
        zip: "10987",
        country: "USA",
      },
    },
    "Gontran Bonheur": {
      name: "Gladstone Gander",
      pseudo: "Gladstone",
      function: "Lucky cousin",
      email: "gladstone@duckburg.com",
      telephone: "+33655443322",
      adress: {
        street: "202 Fortune Street",
        city: "Duckburg",
        zip: "09876",
        country: "USA",
      },
    },
  },
  products: [
    { name: "DuckTales DVD", price: "$19.99", category: "Entertainment" },
    { name: "Donald Duck Plush Toy", price: "$14.99", category: "Toys" },
    { name: "Scrooge McDuck Action Figure", price: "$24.99", category: "Toys" },
    { name: "Duckburg Puzzle", price: "$9.99", category: "Games" },
    {
      name: "Duck-themed Stationery Set",
      price: "$12.99",
      category: "Stationery",
    },
    { name: "Duck Tales Comic Book", price: "$4.99", category: "Books" },
    { name: "Donald Duck T-shirt", price: "$15.99", category: "Clothing" },
    { name: "Duck Pond Playset", price: "$29.99", category: "Toys" },
    { name: "Duck Call Whistle", price: "$7.99", category: "Accessories" },
    {
      name: "Duck-themed Coffee Mug",
      price: "$11.99",
      category: "Kitchenware",
    },
    { name: "Duckling Bath Toys", price: "$8.99", category: "Toys" },
    { name: "Duck Hunt Video Game", price: "$39.99", category: "Games" },
  ],
  timeValues: {
    dates: [
      "15/01/2026",
      "22/01/2026",
      "10/02/2026",
      "20/02/2026",
      "05/03/2026",
      "10/03/2026",
      "05/04/2026",
      "15/04/2026",
      "30/04/2026",
      "25/05/2026",
      "30/06/2026",
      "15/07/2026",
      "25/07/2026",
      "12/08/2026",
      "20/08/2026",
      "10/09/2026",
      "22/09/2026",
      "05/10/2026",
      "15/10/2026",
      "25/11/2026",
      "30/11/2026",
      "10/12/2026",
      "20/12/2026",
      "30/12/2026",
    ],
    times: [
      "08:00",
      "09:30",
      "11:00",
      "12:30",
      "14:00",
      "15:30",
      "17:00",
      "18:30",
      "20:00",
      "21:30",
    ],
    daynames: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    monthNames: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  numericalValues: {
    numbers: [
      "0",
      "1",
      "5",
      "10",
      "15",
      "22",
      "30",
      "42",
      "56",
      "70",
      "112",
      "256",
      "512",
      "750",
      "945",
      "1024",
      "2056",
      "4800",
      "7862",
      "8765",
    ],
    percentages: [
      "0%",
      "5%",
      "10%",
      "15%",
      "22%",
      "30%",
      "42%",
      "56%",
      "70%",
      "85%",
      "92%",
      "100%",
    ],
  },
};

function processConfigRecursively(obj: any, parentKey: string = ""): void {
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = parentKey ? `${parentKey}/${key}` : key;

    if (value === null || value === undefined) {
      continue;
    }

    // Si c'est un tableau, on crée une variable pour chaque élément
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const itemKey = `${fullKey}/${index}`;
        variables[itemKey] = generateVariable("string", item, [
          SCOPES.STRING.TEXT_CONTENT,
        ]);
      });
    }
    // Si c'est une valeur primitive, on crée la variable
    else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      variables[fullKey] = generateVariable("string", value, [
        SCOPES.STRING.TEXT_CONTENT,
      ]);
    }
    // Si c'est un objet, on descend récursivement
    else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      processConfigRecursively(value, fullKey);
    }
  }
}

processConfigRecursively(config);

const mode = "Value";
const collectionName = "Placeholders";
export const placeholdersCollection: FigmaCollection = {
  name: collectionName,
  modes: [mode],
  variables: { [mode]: generateModeJson(collectionName, mode, variables) },
};
