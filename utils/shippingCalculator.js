export const COUNTY_RATES = {
  Baringo: 600,
  Bomet: 200,
  Bungoma: 500,
  Busia: 500,
  Elgeyo_Marakwet: 500,
  Embu: 450,
  Garissa: 1200,
  Homa_Bay: 500,
  Isiolo: 1200,
  Kajiado: 400,
  Kakamega: 500,
  Kericho: 500,
  Kiambu: 350,
  Kilifi: 700,
  Kirinyaga: 400,
  Kisii: 500,
  Kisumu: 500,
  Kitui: 500,
  Kwale: 800,
  Laikipia: 450,
  Lamu: 1500,
  Machakos: 400,
  Makueni: 500,
  Mandera: 2000,
  Marsabit: 1500,
  Meru: 600,
  Migori: 600,
  Mombasa: 600,
  Muranga: 400,
  Nairobi: 350,
  Nakuru: 400,
  Nandi: 500,
  Narok: 450,
  Nyamira: 500,
  Nyandarua: 450,
  Nyeri: 400,
  Samburu: 900,
  Siaya: 500,
  Taita_Taveta: 900,
  Tana_River: 1000,
  Tharaka_Nithi: 600,
  Trans_Nzoia: 500,
  Turkana: 1800,
  Uasin_Gishu: 400,
  Vihiga: 500,
  Wajir: 2000,
  West_Pokot: 1200
};

const DEFAULT_COUNTY_RATE = 600;
const INTERNATIONAL_RATE = 2000;

export function calculateShipping({ country, city }) {
  if (!country) return DEFAULT_COUNTY_RATE;
  if (country.toLowerCase() !== 'kenya') return INTERNATIONAL_RATE;
  if (!city) return DEFAULT_COUNTY_RATE;

  // Normalize
  const normalized = city.trim();
  if (COUNTY_RATES[normalized]) return COUNTY_RATES[normalized];
  // try case-insensitive match
  const foundKey = Object.keys(COUNTY_RATES).find(k => k.toLowerCase() === normalized.toLowerCase());
  if (foundKey) return COUNTY_RATES[foundKey];

  return DEFAULT_COUNTY_RATE;
}
