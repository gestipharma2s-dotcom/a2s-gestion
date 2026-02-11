// Liste complète des 58 wilayas d'Algérie avec leurs codes
export const WILAYAS = [
  { code: '01', name: 'Adrar' },
  { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' },
  { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' },
  { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' },
  { code: '08', name: 'Bechar' },
  { code: '09', name: 'Blida' },
  { code: '10', name: 'Bouira' },
  { code: '11', name: 'Tamanrasset' },
  { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' },
  { code: '14', name: 'Tiaret' },
  { code: '15', name: 'Tizi Ouzou' },
  { code: '16', name: 'Alger' },
  { code: '17', name: 'Djelfa' },
  { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' },
  { code: '20', name: 'Saïda' },
  { code: '21', name: 'Skikda' },
  { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba' },
  { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' },
  { code: '26', name: 'Médéa' },
  { code: '27', name: 'Mostaghanem' },
  { code: '28', name: 'Mascara' },
  { code: '29', name: 'Ouargla' },
  { code: '30', name: 'Oran' },
  { code: '31', name: 'El Asnam' },
  { code: '32', name: 'Aïn Défla' },
  { code: '33', name: 'Boumédes' },
  { code: '34', name: 'Boumerdès' },
  { code: '35', name: 'El Tarf' },
  { code: '36', name: 'Tindouf' },
  { code: '37', name: 'Tissemsilt' },
  { code: '38', name: 'El Oued' },
  { code: '39', name: 'Khenchela' },
  { code: '40', name: 'Souk Ahras' },
  { code: '41', name: 'Tipaza' },
  { code: '42', name: 'Mila' },
  { code: '43', name: 'Aïn Temouchent' },
  { code: '44', name: 'Ghardaïa' },
  { code: '45', name: 'Relizane' },
  { code: '46', name: 'Draa Ben Khedda' },
  { code: '47', name: 'Draa Ben Khelouf' },
  { code: '48', name: 'Khemis Miliana' },
  { code: '49', name: 'Laghouat' },
  { code: '50', name: 'Naâma' },
  { code: '51', name: 'Ouled Djellal' },
  { code: '52', name: 'Bordj Baji Mokhtar' },
  { code: '53', name: 'Ouled Béni Sghir' },
  { code: '54', name: 'Éni Abbès' },
  { code: '55', name: 'In Salah' },
  { code: '56', name: 'In Guezzam' },
  { code: '57', name: 'Touggourt' },
  { code: '58', name: 'Djanet' }
];

// Fonction utilitaire pour obtenir le code d'une wilaya par son nom
export const getWilayaCode = (name) => {
  const wilaya = WILAYAS.find(w => w.name.toLowerCase() === name?.toLowerCase());
  return wilaya?.code || null;
};

// Fonction utilitaire pour obtenir le nom d'une wilaya par son code
export const getWilayaName = (code) => {
  const wilaya = WILAYAS.find(w => w.code === code);
  return wilaya?.name || null;
};

// Fonction utilitaire pour formater "code - nom"
export const formatWilaya = (nameOrCode) => {
  if (!nameOrCode) return null;
  
  // Si c'est déjà au format "code - nom", retourner tel quel
  if (nameOrCode.includes(' - ')) {
    return nameOrCode;
  }
  
  // Si c'est un code (2 chiffres), chercher le nom
  if (/^\d{2}$/.test(nameOrCode)) {
    const name = getWilayaName(nameOrCode);
    return name ? `${nameOrCode} - ${name}` : nameOrCode;
  }
  
  // Si c'est un nom, chercher le code
  const code = getWilayaCode(nameOrCode);
  return code ? `${code} - ${nameOrCode}` : nameOrCode;
};
