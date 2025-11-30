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
  Bomet: 200,
  Nairobi: 350,
  Mombasa: 400,
  Kisumu: 350,
  Nakuru: 330,
};

const DEFAULT_RATE = 500;
const INTERNATIONAL_RATE = 2000;
const EXPRESS_DELIVERY = 1500;
const URBAN_CENTERS = ['Nairobi', 'Mombasa', 'Kisumu'];
const RURAL_SURCHARGE = 200;

export function calculateShipping({ country = 'Kenya', city = '' } = {}) {
  if (!country || country.toLowerCase() !== 'kenya') return INTERNATIONAL_RATE;
  const normalized = city?.trim();
  if (!normalized) return DEFAULT_RATE;
  const key = Object.keys(COUNTY_RATES).find(k => k.toLowerCase() === normalized.toLowerCase());
  return key ? COUNTY_RATES[key] : DEFAULT_RATE;
}

export function calculateShippingWithWeight({ country, county, weightInGrams = 250, isRural = false, deliveryOption = 'standard' }) {
  if (country !== 'Kenya') return INTERNATIONAL_RATE;
  
  if (deliveryOption === 'express') return EXPRESS_DELIVERY;
  
  let baseRate = COUNTY_RATES[county] || DEFAULT_RATE;
  
  // Adjust for weight
  let weightMultiplier = 1;
  if (weightInGrams > 1000) weightMultiplier = 1.8;
  else if (weightInGrams > 500) weightMultiplier = 1.3;

  if (isRural && !URBAN_CENTERS[county]) {
    baseRate += RURAL_SURCHARGE;
  }
  
  return Math.round(baseRate * weightMultiplier);
}