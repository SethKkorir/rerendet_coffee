// client/src/utils/kenyaLocations.js

export const KENYA_LOCATIONS = {
    'Nairobi': ['Westlands', 'Dagoretti', 'Langata', 'Kibra', 'Ruaraka', 'Embakasi', 'Kasarani', 'Makadara', 'Kamukunji', 'Starehe'],
    'Mombasa': ['Mvita', 'Nyali', 'Changamwe', 'Jomvu', 'Likoni', 'Kisauni'],
    'Kiambu': ['Thika', 'Kiambu Town', 'Limuru', 'Kikuyu', 'Ruiru', 'Juja', 'Gatundu'],
    'Machakos': ['Machakos Town', 'Athi River', 'Mlolongo', 'Syokimau', 'Kangundo', 'Tala'],
    'Kajiado': ['Ongata Rongai', 'Kitengela', 'Ngong', 'Kajiado Town', 'Isinya'],
    'Nakuru': ['Nakuru Town', 'Naivasha', 'Gilgil', 'Molo', 'Njoro'],
    'Uasin Gishu': ['Eldoret', 'Burnt Forest', 'Turbo'],
    'Kisumu': ['Kisumu City', 'Maseno', 'Ahero'],
    'Trans Nzoia': ['Kitale', 'Endebess'],
    'Kakamega': ['Kakamega Town', 'Mumias', 'Butere'],
    'Bungoma': ['Bungoma Town', 'Webuye', 'Kimilili'],
    'Nyeri': ['Nyeri Town', 'Karatina', 'Othaya'],
    'Meru': ['Meru Town', 'Nanyuki (Meru side)', 'Maua'],
    'Laikipia': ['Nanyuki', 'Nyahururu', 'Rumuruti'],
    'Kilifi': ['Malindi', 'Kilifi Town', 'Watamu', 'Mtwapa', 'Mariakani'],
    'Kwale': ['Diani', 'Ukunda', 'Kwale Town', 'Msambweni'],
    'Taita Taveta': ['Voi', 'Wundanyi', 'Taveta', 'Mwatate'],
    'Garissa': ['Garissa Town', 'Dadaab'],
    'Wajir': ['Wajir Town'],
    'Mandera': ['Mandera Town'],
    'Marsabit': ['Marsabit Town', 'Moyale'],
    'Isiolo': ['Isiolo Town'],
    'Tharaka Nithi': ['Chuka', 'Chogoria'],
    'Embu': ['Embu Town', 'Runyenjes'],
    'Kitui': ['Kitui Town', 'Mwingi'],
    'Makueni': ['Wote', 'Mtito Andei'],
    'Nyandarua': ['Ol Kalou', 'Njabini'],
    'Kirinyaga': ['Kerugoya', 'Kutus', 'Sagana'],
    'Muranga': ['Muranga Town', 'Kenol', 'Kangema'],
    'Turkana': ['Lodwar'],
    'West Pokot': ['Kapenguria'],
    'Samburu': ['Maralal'],
    'Elgeyo Marakwet': ['Iten'],
    'Nandi': ['Kapsabet'],
    'Baringo': ['Kabarnet', 'Eldama Ravine'],
    'Kericho': ['Kericho Town', 'Litein'],
    'Bomet': ['Bomet Town'],
    'Siaya': ['Siaya Town', 'Bondo'],
    'Homa Bay': ['Homa Bay Town', 'Mbita'],
    'Migori': ['Migori Town', 'Kuria'],
    'Kisii': ['Kisii Town'],
    'Nyamira': ['Nyamira Town'],
    'Vihiga': ['Mbale', 'Chavakali'],
    'Busia': ['Busia Town', 'Malaba'],
    'Tana River': ['Hola'],
    'Lamu': ['Lamu Town', 'Mpeketoni']
};

export const getShippingZone = (county) => {
    const zones = {
        'Nairobi': 'Nairobi',
        'Kiambu': 'Metropolitan',
        'Machakos': 'Metropolitan',
        'Kajiado': 'Metropolitan',
        'Mombasa': 'Major City',
        'Kisumu': 'Major City',
        'Nakuru': 'Major City',
        'Uasin Gishu': 'Major City'
    };

    return zones[county] || 'Rest of Kenya';
};

export const calculateShippingByZone = (county) => {
    const zone = getShippingZone(county);
    const costs = {
        'Nairobi': 200,
        'Metropolitan': 350,
        'Major City': 450,
        'Rest of Kenya': 600
    };

    return costs[zone];
};
