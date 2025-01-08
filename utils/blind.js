function blind(arg1, arg2, arg3) {
  try {
    const isNul = (val) => val === null;
    const isUnd = (val) => typeof val === "undefined";
    const isArr = (arr) => !isUnd(arr) && arr !== null && arr.constructor === Array;
    const isNum = (num) => typeof num === "number" && !isNaN(num);
    const isObj = (obj) => typeof obj === "object";
    const isStr = (str) => typeof str === "string";
    const isBool = (val) => val === true || val === false;
    const _Float = new RegExp("%.[0-9]+f", "i");
    const random = (min = 0, max = 1, fix = 30) => Number(Math.random() * (max - min) + min).toFixed(fix);

    if (!isNul(arg1) && !isNul(arg2) && !isNul(arg3)) {
      // regular
      if (isUnd(arg1)) return random();

      // boolean
      if (isBool(arg1) && isBool(arg2) && isUnd(arg3)) return random() < 0.5;

      // string
      if (isStr(arg1) && arg1.length > 0 && isUnd(arg2)) return arg1.charAt(random(0, arg1.length - 1, 0));

      // string
      if (isStr(arg1) && arg1.length > 0 && isNum(arg2) && isUnd(arg3)) {
        let str = "";
        while (--arg2) str += arg1.charAt(random(0, arg1.length - 1, 0));
        return str;
      }

      // float from min to max (inclusive of min and exclusive of max)
      if (isNum(arg1) && isNum(arg2) && isStr(arg3) && _Float.test(arg3)) {
        const float = parseInt(arg3.replace(/[^0-9]/g, ""));
        return arg1 > arg2 ? random(arg2, arg1, float) : random(arg1, arg2, float);
      }

      // float from 0 to max OR min to 0 if negative (inclusive of min and exclusive of max)
      if (isNum(arg1) && isStr(arg2) && _Float.test(arg2) && isUnd(arg3)) {
        const float = parseInt(arg2.replace(/[^0-9]/g, ""));
        return arg1 >= 0 ? random(0, arg1, float) : random(arg1, 0, float);
      }

      // int from min through max (inclusive of both min and max)
      if (isNum(arg1) && isNum(arg2) && isUnd(arg3)) {
        return arg1 > arg2 ? random(arg2, arg1, 0) : random(arg1, arg2, 0);
      }

      // int from 0 through max OR min through 0 if negative (inclusive of both min and max)
      if (isNum(arg1) && isUnd(arg2)) {
        return arg1 >= 0 ? random(0, arg1, 0) : random(arg1, 0, 0);
      }

      // array
      if (isArr(arg1) && arg1.length > 0 && isUnd(arg2)) {
        const idx = (random() * arg1.length) << 0;
        return { index: idx, value: arg1[idx] };
      }

      // object
      if (isObj(arg1) && isUnd(arg2)) {
        const keys = Object.keys(arg1);
        if (keys.length > 0) {
          const idx = (random() * keys.length) << 0;
          return { key: keys[idx], value: arg1[keys[idx]] };
        }
      }
    }

    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

function blindTalk() {
  const nouns = ["bird", "clock", "boy", "plastic", "duck", "teacher", "old lady", "professor", "hamster", "dog"];
  const verbs = ["kicked", "ran", "flew", "dodged", "sliced", "rolled", "died", "breathed", "slept", "killed"];
  const adjectives = ["beautiful", "lazy", "professional", "lovely", "dumb", "rough", "soft", "hot", "vibrating", "slimy"];
  const adverbs = ["slowly", "elegantly", "precisely", "quickly", "sadly", "humbly", "proudly", "shockingly", "calmly", "passionately"];
  const preposition = ["down", "into", "up", "on", "upon", "below", "above", "through", "across", "towards"];

  const rand1 = Math.floor(Math.random() * 10);
  const rand2 = Math.floor(Math.random() * 10);
  const rand3 = Math.floor(Math.random() * 10);
  const rand4 = Math.floor(Math.random() * 10);
  const rand5 = Math.floor(Math.random() * 10);
  const rand6 = Math.floor(Math.random() * 10);

  return `The ${adjectives[rand1]} ${nouns[rand2]} ${adverbs[rand3]} ${verbs[rand4]} because some ${nouns[rand1]} ${adverbs[rand1]} ${verbs[rand1]} ${preposition[rand1]} a ${adjectives[rand2]} ${nouns[rand5]} which, became a ${adjectives[rand3]}, ${adjectives[rand4]} ${nouns[rand6]}.`;
}

const dataset = {
  fullNames: ["Justa Ngo", "Tora Hendrick", "Carolyn Taber", "Gilberto Wind", "Daryl Swyers", "Ashlyn Obey", "Julianna Urenda", "Karly Landers", "Blaine Esquivel", "Debroah Gilkey", "Faustino Flagg", "Carol Riggio", "Deandra Hoge", "Chadwick Morelli", "Ryann Hammond", "Will Cyphers", "Jacinda Krasner", "Cory Waechter", "Duane Haran", "Takako Eberhard"],

  coordiates: [
    { address: "Chittorgarh, Rajasthan, India", latitude: "24.879999", longitude: "74.629997" },
    { address: "Ratnagiri, Maharashtra, India", latitude: "16.994444", longitude: "73.300003" },
    { address: "Goregaon, Mumbai, Maharashtra, India", latitude: "19.155001", longitude: "72.849998" },
    { address: "Pindwara, Rajasthan, India", latitude: "24.794500", longitude: "73.055000" },
    { address: "Raipur, Chhattisgarh, India", latitude: "21.250000", longitude: "81.629997" },
    { address: "Gokak, Karnataka, India", latitude: "16.166700", longitude: "74.833298" },
    { address: "Lucknow, Uttar Pradesh, India", latitude: "26.850000", longitude: "80.949997" },
    { address: "Delhi, the National Capital Territory of Delhi, India", latitude: "28.610001", longitude: "77.230003" },
    { address: "Mumbai, Maharashtra, India", latitude: "19.076090", longitude: "72.877426" },
    { address: "Sagar, Karnataka, India", latitude: "14.167040", longitude: "75.040298" },
    { address: "Jalpaiguri, West Bengal, India", latitude: "26.540457", longitude: "88.719391" },
    { address: "Pakur, Jharkhand, India", latitude: "24.633568", longitude: "87.849251" },
    { address: "Sardarshahar, Rajasthan, India", latitude: "28.440554", longitude: "74.493011" },
    { address: "Sirohi, Rajasthan, India", latitude: "24.882618", longitude: "72.858894" },
    { address: "Jaysingpur, Maharashtra, India", latitude: "16.779877", longitude: "74.556374" },
    { address: "Ramanagara, Karnataka, India", latitude: "12.715035", longitude: "77.281296" },
    { address: "Chikkaballapura, Karnataka, India", latitude: "13.432515", longitude: "77.727478" },
    { address: "Channapatna, Karnataka, India", latitude: "12.651805", longitude: "77.208946" },
    { address: "Surendranagar, Gujarat, India", latitude: "22.728392", longitude: "71.637077" },
    { address: "Thiruvalla, Kerala, India", latitude: "9.383452", longitude: "76.574059" },
    { address: "Ranebennur, Karnataka, India", latitude: "14.623801", longitude: "75.621788" },
    { address: "Karaikal, Puducherry, India", latitude: "10.925440", longitude: "79.838005" },
    { address: "Belgaum, Karnataka, India", latitude: "15.852792", longitude: "74.498703" },
    { address: "Chatrapur, Odisha, India", latitude: "19.354979", longitude: "84.986732" },
    { address: "Suri, West Bengal, India", latitude: "23.905445", longitude: "87.524620" },
    { address: "Bhubaneswar, Odisha, India", latitude: "20.296059", longitude: "85.824539" },
    { address: "Mahuva, Gujarat, India", latitude: "21.105001", longitude: "71.771645" },
    { address: "Jagadhri, Haryana, India", latitude: "30.172716", longitude: "77.299492" },
    { address: "Barh, Bihar, India", latitude: "25.477585", longitude: "85.709091" },
    { address: "Bhusawal, Maharashtra, India", latitude: "21.045521", longitude: "75.801094" },
    { address: "Alipurduar, West Bengal, India", latitude: "26.491890", longitude: "89.527100" },
    { address: "Kollam, Kerala, India", latitude: "8.893212", longitude: "76.614143" },
    { address: "Medinipur, West Bengal, India", latitude: "22.430889", longitude: "87.321487" },
    { address: "Patan, Gujarat, India", latitude: "23.849325", longitude: "72.126625" },
    { address: "Mettur, Tamil Nadu, India", latitude: "11.786253", longitude: "77.800781" },
    { address: "Huliyar, Karnataka, India", latitude: "13.583274", longitude: "76.540154" },
    { address: "Harihar, Karnataka, India", latitude: "14.530457", longitude: "75.801094" },
    { address: "Rasayani, Maharashtra, India", latitude: "18.901457", longitude: "73.176132" },
    { address: "Haringhata, West Bengal, India", latitude: "22.960510", longitude: "88.567406" },
    { address: "Kushtagi, Karnataka, India", latitude: "15.756595", longitude: "76.192696" },
    { address: "Jadugora, Jharkhand, India", latitude: "22.656015", longitude: "86.352882" },
    { address: "Orai, Uttar Pradesh, India", latitude: "25.989836", longitude: "79.450035" },
    { address: "Surajpur, Chhattisgarh, India", latitude: "23.223047", longitude: "82.870560" },
    { address: "Ambernath, Maharashtra, India", latitude: "19.186354", longitude: "73.191948" },
    { address: "Malerkotla, Punjab, India", latitude: "30.525005", longitude: "75.890121" },
    { address: "Jorapokhar, Jharkhand, India", latitude: "22.422455", longitude: "85.760651" },
    { address: "Vizianagaram, Andhra Pradesh, India", latitude: "18.106659", longitude: "83.395554" },
    { address: "Durg, Chhattisgarh, India", latitude: "21.190449", longitude: "81.284920" },
    { address: "Himmatnagar, Gujarat, India", latitude: "23.597969", longitude: "72.969818" },
    { address: "Sambhal, Uttar Pradesh, India", latitude: "28.590361", longitude: "78.571762" },
    { address: "Harnaut, Bihar, India", latitude: "25.369179", longitude: "85.530060" },
    { address: "Suti, West Bengal, India", latitude: "24.618393", longitude: "88.024338" },
    { address: "Banswara, Rajasthan, India", latitude: "23.546757", longitude: "74.433830" },
    { address: "Batumi, Adjara, Georgia", latitude: "41.643414", longitude: "41.639900" },
    { address: "Manikchak, West Bengal, India", latitude: "25.077787", longitude: "87.900375" },
    { address: "Roorkee, Uttarakhand, India", latitude: "29.854263", longitude: "77.888000" },
    { address: "Kavali, Andhra Pradesh, India", latitude: "14.913181", longitude: "79.992981" },
    { address: "Dharmavaram, Andhra Pradesh, India", latitude: "14.413745", longitude: "77.712616" },
    { address: "Siddipet, Telangana, India", latitude: "18.101904", longitude: "78.852074" },
    { address: "Dhanpuri, Madhya Pradesh, India", latitude: "23.173939", longitude: "81.565125" },
    { address: "Chirala, Andhra Pradesh, India", latitude: "15.812074", longitude: "80.355377" },
    { address: "Markapur, Andhra Pradesh, India", latitude: "15.764501", longitude: "79.259491" },
    { address: "Chalakudy, Kerala, India", latitude: "10.311879", longitude: "76.331978" },
    { address: "Gondal, Gujarat, India", latitude: "21.961946", longitude: "70.792297" },
    { address: "Bhimavaram, Andhra Pradesh, India", latitude: "16.544893", longitude: "81.521240" },
    { address: "Jalgaon Jamod, Maharashtra, India", latitude: "21.049540", longitude: "76.532028" },
    { address: "Paltan Bazaar, Guwahati, Assam, India", latitude: "26.182245", longitude: "91.754723" },
    { address: "Hodal, Haryana, India", latitude: "27.897551", longitude: "77.384117" },
    { address: "Ausa, Maharashtra, India", latitude: "18.245655", longitude: "76.505356" },
    { address: "Mahidpur, Madhya Pradesh, India", latitude: "23.486839", longitude: "75.659157" },
    { address: "Gurdaspur, Punjab, India", latitude: "32.041943", longitude: "75.405334" },
    { address: "Domchanch, Jharkhand, India", latitude: "24.474380", longitude: "85.688744" },
    { address: "Barjora, West Bengal, India", latitude: "23.427221", longitude: "87.287018" },
    { address: "Sinnar, Maharashtra, India", latitude: "19.853060", longitude: "74.000633" },
    { address: "Guntakal, Andhra Pradesh, India", latitude: "15.167409", longitude: "77.373627" },
    { address: "Lalgola, West Bengal, India", latitude: "24.417534", longitude: "88.250343" },
    { address: "Hoshangabad, Madhya Pradesh, India", latitude: "22.744108", longitude: "77.736969" },
    { address: "Proddatur, Andhra Pradesh, India", latitude: "14.752805", longitude: "78.552757" },
    { address: "RL Infotechh & Solutions, Durgapur, India", latitude: "23.520399", longitude: "87.311897" },
    { address: "Pali, Rajasthan, India", latitude: "25.771315", longitude: "73.323685" },
    { address: "Palwal, Haryana, India", latitude: "28.148735", longitude: "77.332024" },
    { address: "Gohana, Haryana, India", latitude: "29.138407", longitude: "76.693245" },
    { address: "Munger, Bihar, India", latitude: "25.375710", longitude: "86.474373" },
    { address: "Yavatmal, Maharashtra, India", latitude: "20.388794", longitude: "78.120407" },
    { address: "Bokaro Steel City, Jharkhand, India", latitude: "23.669296", longitude: "86.151115" },
    { address: "Jetpur, Gujarat, India", latitude: "21.761524", longitude: "70.627625" },
    { address: "Basirhat, West Bengal, India", latitude: "22.657402", longitude: "88.867180" },
    { address: "Konnagar, Mirpur, West Bengal, India", latitude: "22.700474", longitude: "88.319069" },
    { address: "Ranchi, Jharkhand, India", latitude: "23.344315", longitude: "85.296013" },
    { address: "Gudur, Andhra Pradesh, India", latitude: "14.146319", longitude: "79.850388" },
    { address: "Gola Gokarannath, Uttar Pradesh, India", latitude: "28.078636", longitude: "80.471588" },
    { address: "Shikohabad, Uttar Pradesh, India", latitude: "27.108416", longitude: "78.584602" },
    { address: "Tirumangalam, Tamil Nadu, India", latitude: "9.823619", longitude: "77.986565" },
    { address: "Anakaputhur, Sriperumbudur, Tamil Nadu, India", latitude: "12.946366", longitude: "79.959244" },
    { address: "Suryapet, Telangana, India", latitude: "17.143908", longitude: "79.623924" },
    { address: "Udupi, Karnataka, India", latitude: "13.340881", longitude: "74.742142" },
    { address: "Nandyal, Andhra Pradesh, India", latitude: "15.478569", longitude: "78.483093" },
  ],
};

module.exports = { blind, blindTalk, dataset };
