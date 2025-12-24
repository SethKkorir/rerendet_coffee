// utils/shippingCalculator.js
export const kenyanCounties = [
  'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa',
  'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi',
  'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu',
  'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa',
  'Muranga', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua',
  'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi',
  'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
];

const COUNTY_RATES = {
  // Nairobi & Central Region
  'Nairobi': 280,
  'Kiambu': 280,
  'Muranga': 320,
  'Nyandarua': 350,
  'Nyeri': 320,
  'Kirinyaga': 350,
  'Meru': 450,
  'Tharaka-Nithi': 450,
  'Embu': 380,

  // Rift Valley
  'Nakuru': 300,
  'Kericho': 250,
  'Bomet': 150,
  'Uasin Gishu': 300,
  'Nandi': 300,
  'Elgeyo-Marakwet': 350,
  'Baringo': 450,
  'Laikipia': 350,
  'Narok': 350,
  'Kajiado': 320,
  'Bungoma': 400,
  'Trans Nzoia': 400,
  'West Pokot': 800,
  'Samburu': 600,
  'Turkana': 1200,

  // Western Kenya
  'Kisumu': 350,
  'Kakamega': 380,
  'Vihiga': 380,
  'Busia': 450,
  'Siaya': 380,
  'Homa Bay': 400,
  'Migori': 400,
  'Kisii': 350,
  'Nyamira': 350,

  // Eastern Region
  'Machakos': 320,
  'Kitui': 450,
  'Makueni': 400,
  'Marsabit': 1200,
  'Isiolo': 800,

  // Coastal Region
  'Mombasa': 500,
  'Kilifi': 550,
  'Kwale': 600,
  'Lamu': 1200,
  'Taita-Taveta': 700,
  'Tana River': 800,

  // Northern Kenya
  'Garissa': 900,
  'Wajir': 1500,
  'Mandera': 1500
};

const URBAN_CENTERS = {
  'Nairobi': true,
  'Mombasa': true,
  'Kisumu': true,
  'Nakuru': true,
  'Eldoret': true,
  'Thika': true,
  'Malindi': true,
  'Kitale': true,
  'Kericho': true,
  'Kakamega': true,
  'Nyeri': true,
  'Embu': true,
  'Meru': true,
  'Machakos': true
};

const DEFAULT_COUNTY_RATE = 500;
const INTERNATIONAL_RATE = 2000;
const RURAL_SURCHARGE = 150;
const EXPRESS_DELIVERY = 300;

export function calculateShipping({ country, county, isRural = false, deliveryOption = 'standard' }) {
  if (country !== 'Kenya') return INTERNATIONAL_RATE;
  
  if (deliveryOption === 'express') return EXPRESS_DELIVERY;
  
  let baseRate = COUNTY_RATES[county] || DEFAULT_COUNTY_RATE;
  
  // Add surcharge for rural areas
  if (isRural && !URBAN_CENTERS[county]) {
    baseRate += RURAL_SURCHARGE;
  }
  
  return baseRate;
}

export function calculateShippingWithWeight({ country, county, weightInGrams = 250, isRural = false, deliveryOption = 'standard' }) {
  if (country !== 'Kenya') return INTERNATIONAL_RATE;
  
  if (deliveryOption === 'express') return EXPRESS_DELIVERY;
  
  let baseRate = COUNTY_RATES[county] || DEFAULT_COUNTY_RATE;
  
  // Adjust for weight
  let weightMultiplier = 1;
  if (weightInGrams > 1000) weightMultiplier = 1.8;
  else if (weightInGrams > 500) weightMultiplier = 1.3;

  if (isRural && !URBAN_CENTERS[county]) {
    baseRate += RURAL_SURCHARGE;
  }
  
  return Math.round(baseRate * weightMultiplier);
}