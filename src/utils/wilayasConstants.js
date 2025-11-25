/**
 * Constantes pour les wilayas d'Algérie
 * 58 wilayas officielles
 */

export const WILAYAS_ALGERIA = [
  { id: '01', name: 'Adrar', code: '01' },
  { id: '02', name: 'Chlef', code: '02' },
  { id: '03', name: 'Laghouat', code: '03' },
  { id: '04', name: 'Oum El Bouaghi', code: '04' },
  { id: '05', name: 'Batna', code: '05' },
  { id: '06', name: 'Béjaïa', code: '06' },
  { id: '07', name: 'Biskra', code: '07' },
  { id: '08', name: 'Béchar', code: '08' },
  { id: '09', name: 'Blida', code: '09' },
  { id: '10', name: 'Bouira', code: '10' },
  { id: '11', name: 'Tamanrasset', code: '11' },
  { id: '12', name: 'Tébessa', code: '12' },
  { id: '13', name: 'Tlemcen', code: '13' },
  { id: '14', name: 'Tiaret', code: '14' },
  { id: '15', name: 'Tizi Ouzou', code: '15' },
  { id: '16', name: 'Alger', code: '16' },
  { id: '17', name: 'Djelfa', code: '17' },
  { id: '18', name: 'Djijel', code: '18' },
  { id: '19', name: 'Sétif', code: '19' },
  { id: '20', name: 'Saïda', code: '20' },
  { id: '21', name: 'Skikda', code: '21' },
  { id: '22', name: 'Sidi Bel Abbès', code: '22' },
  { id: '23', name: 'Annaba', code: '23' },
  { id: '24', name: 'Guelma', code: '24' },
  { id: '25', name: 'Constantine', code: '25' },
  { id: '26', name: 'Médéa', code: '26' },
  { id: '27', name: 'Mostaganem', code: '27' },
  { id: '28', name: 'M\'Sila', code: '28' },
  { id: '29', name: 'Mascara', code: '29' },
  { id: '30', name: 'Ouargla', code: '30' },
  { id: '31', name: 'Oran', code: '31' },
  { id: '32', name: 'El Bayadh', code: '32' },
  { id: '33', name: 'Illizi', code: '33' },
  { id: '34', name: 'Bordj Bou Arreridj', code: '34' },
  { id: '35', name: 'Boumerdès', code: '35' },
  { id: '36', name: 'El Tarf', code: '36' },
  { id: '37', name: 'Tindouf', code: '37' },
  { id: '38', name: 'Tissemsilt', code: '38' },
  { id: '39', name: 'El Oued', code: '39' },
  { id: '40', name: 'Khenchela', code: '40' },
  { id: '41', name: 'Souk Ahras', code: '41' },
  { id: '42', name: 'Tipaza', code: '42' },
  { id: '43', name: 'Mila', code: '43' },
  { id: '44', name: 'Aïn Defla', code: '44' },
  { id: '45', name: 'Naâma', code: '45' },
  { id: '46', name: 'Aïn Témouchent', code: '46' },
  { id: '47', name: 'Ghardaïa', code: '47' },
  { id: '48', name: 'Relizane', code: '48' },
  { id: '49', name: 'El M\'Ghair', code: '49' },
  { id: '50', name: 'El Menia', code: '50' },
  { id: '51', name: 'Ouled Djellal', code: '51' },
  { id: '52', name: 'El Harrach', code: '52' },
  { id: '53', name: 'El Madania', code: '53' },
  { id: '54', name: 'El Kseur', code: '54' },
  { id: '55', name: 'El Menaâ', code: '55' },
  { id: '56', name: 'El Oued', code: '56' },
  { id: '57', name: 'El Tarf', code: '57' },
  { id: '58', name: 'Tissemsilt', code: '58' }
];

export const getWilayaName = (code) => {
  const wilaya = WILAYAS_ALGERIA.find(w => w.code === code);
  return wilaya ? wilaya.name : code;
};

export const getWilayaCode = (name) => {
  const wilaya = WILAYAS_ALGERIA.find(w => w.name === name);
  return wilaya ? wilaya.code : name;
};

export const WILAYAS_SELECT_OPTIONS = WILAYAS_ALGERIA.map(w => ({
  value: w.code,
  label: `${w.code} - ${w.name}`
}));

export default WILAYAS_ALGERIA;
