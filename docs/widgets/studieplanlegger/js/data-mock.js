/**
 * Mock data for local development
 * This provides fallback data when real data sources are unavailable
 */

export const mockTimefordeling = {
  studiespesialisering: {
    vg1: [
      { timer: '140', navn: 'Engelsk', fagkode: 'ENG1007' },
      { timer: '56', navn: 'Geografi', fagkode: 'GEO1003' },
      { timer: '56', navn: 'Kroppsøving', fagkode: 'KRO1017' },
      { timer: '140', navn: 'Naturfag', fagkode: 'NAT1007' },
      { timer: '113', navn: 'Norsk', fagkode: 'NOR1260' },
      { timer: '84', navn: 'Samfunnskunnskap', fagkode: 'SAK1001' }
    ],
    vg2: [
      { timer: '112', navn: 'Fremmedspråk, vg2', fagkode: 'FSP6219' },
      { timer: '56', navn: 'Historie', fagkode: 'HIS1009' },
      { timer: '56', navn: 'Kroppsøving', fagkode: 'KRO1018' },
      { timer: '112', navn: 'Norsk', fagkode: 'NOR1264' }
    ],
    vg3: [
      { timer: '113', navn: 'Historie', fagkode: 'HIS1010' },
      { timer: '56', navn: 'Kroppsøving', fagkode: 'KRO1019' },
      { timer: '168', navn: 'Norsk', fagkode: 'NOR1267' },
      { timer: '84', navn: 'Religion og etikk', fagkode: 'REL1003' }
    ]
  },
  musikk: {
    vg1: [
      { timer: '140', navn: 'Engelsk', fagkode: 'ENG1007' },
      { timer: '140', navn: 'Matematikk (1P/1T)', fagkode: 'MAT1019' },
      { timer: '140', navn: 'Naturfag', fagkode: 'NAT1007' },
      { timer: '113', navn: 'Norsk', fagkode: 'NOR1260' }
    ],
    vg2: [
      { timer: '112', navn: 'Fremmedspråk, vg2', fagkode: 'FSP6219' },
      { timer: '56', navn: 'Geografi', fagkode: 'GEO1003' },
      { timer: '56', navn: 'Historie', fagkode: 'HIS1009' },
      { timer: '112', navn: 'Norsk', fagkode: 'NOR1264' },
      { timer: '84', navn: 'Samfunnskunnskap', fagkode: 'SAK1001' }
    ],
    vg3: [
      { timer: '113', navn: 'Historie', fagkode: 'HIS1010' },
      { timer: '168', navn: 'Norsk', fagkode: 'NOR1267' },
      { timer: '84', navn: 'Religion og etikk', fagkode: 'REL1003' }
    ]
  },
  medier: {
    vg1: [
      { timer: '140', navn: 'Engelsk', fagkode: 'ENG1007' },
      { timer: '56', navn: 'Kroppsøving', fagkode: 'KRO1017' },
      { timer: '140', navn: 'Matematikk (1P/1T)', fagkode: 'MAT1019' },
      { timer: '140', navn: 'Naturfag', fagkode: 'NAT1007' },
      { timer: '113', navn: 'Norsk', fagkode: 'NOR1260' }
    ],
    vg2: [
      { timer: '112', navn: 'Fremmedspråk, vg2', fagkode: 'FSP6219' },
      { timer: '56', navn: 'Geografi', fagkode: 'GEO1003' },
      { timer: '56', navn: 'Historie', fagkode: 'HIS1009' },
      { timer: '56', navn: 'Kroppsøving', fagkode: 'KRO1018' },
      { timer: '112', navn: 'Norsk', fagkode: 'NOR1264' },
      { timer: '84', navn: 'Samfunnskunnskap', fagkode: 'SAK1001' }
    ],
    vg3: [
      { timer: '113', navn: 'Historie', fagkode: 'HIS1010' },
      { timer: '56', navn: 'Kroppsøving', fagkode: 'KRO1019' },
      { timer: '168', navn: 'Norsk', fagkode: 'NOR1267' },
      { timer: '84', navn: 'Religion og etikk', fagkode: 'REL1003' }
    ]
  }
};

export const mockBlokkskjema = {
  'studiespesialisering_vg2': {
    blocks: {
      'blokk_1': [
        { fagkode: 'MAT1023', navn: 'Matematikk 2P', timer: '84', note: 'Fellesfag' },
        { fagkode: 'MAT1024', navn: 'Matematikk R1', timer: '140', note: 'Erstatter 2P' },
        { fagkode: 'BIO1001', navn: 'Biologi 1', timer: '140' },
        { fagkode: 'ØKO1001', navn: 'Økonomistyring', timer: '140' },
        { fagkode: 'MAR1001', navn: 'Markedsføring og ledelse 1', timer: '140' },
        { fagkode: 'SOS1001', navn: 'Sosiologi og sosialantropologi', timer: '140' },
        { fagkode: 'RET1002', navn: 'Rettslære 2', timer: '140', note: 'Anbefalt: Rettslære 1' },
        { fagkode: 'PSY1001', navn: 'Psykologi 1', timer: '140' },
        { fagkode: 'BIL1001', navn: 'Bilde', timer: '140' }
      ],
      'blokk_2': [
        { fagkode: 'MAT1023', navn: 'Matematikk 2P', timer: '84', note: 'Fellesfag' },
        { fagkode: 'MAT1024', navn: 'Matematikk R1', timer: '140', note: 'Erstatter 2P' },
        { fagkode: 'KJE1001', navn: 'Kjemi 1', timer: '140' },
        { fagkode: 'ENT1001', navn: 'Entreprenørskap og bedriftsutvikling 1', timer: '140' },
        { fagkode: 'POL1001', navn: 'Politikk og menneskerettigheter', timer: '140' },
        { fagkode: 'RET1001', navn: 'Rettslære 1', timer: '140' },
        { fagkode: 'GRA1001', navn: 'Grafisk design', timer: '140' }
      ],
      'blokk_3': [
        { fagkode: 'MAT1023', navn: 'Matematikk 2P', timer: '84', note: 'Fellesfag' },
        { fagkode: 'FYS1001', navn: 'Fysikk 1', timer: '140' },
        { fagkode: 'MAR1001', navn: 'Markedsføring og ledelse 1', timer: '140' },
        { fagkode: 'SOK1001', navn: 'Sosialkunnskap', timer: '140' },
        { fagkode: 'RET1001', navn: 'Rettslære 1', timer: '140' },
        { fagkode: 'GRA1001', navn: 'Grafisk design', timer: '140' }
      ],
      'blokk_4': [
        { fagkode: 'MAT1023', navn: 'Matematikk 2P', timer: '84', note: 'Fellesfag' },
        { fagkode: 'FYS1001', navn: 'Fysikk 1', timer: '140' },
        { fagkode: 'BIO1001', navn: 'Biologi 1', timer: '140' },
        { fagkode: 'ØKL1001', navn: 'Økonomi og ledelse', timer: '140' },
        { fagkode: 'PSY1001', navn: 'Psykologi 1', timer: '140' }
      ]
    }
  },
  'studiespesialisering_vg3': {
    blocks: {
      'blokk_1': [
        { fagkode: 'HIS1010', navn: 'Historie', timer: '113', note: 'Fellesfag' },
        { fagkode: 'MAT1025', navn: 'Matematikk R2', timer: '140' },
        { fagkode: 'BIO1002', navn: 'Biologi 2', timer: '140' },
        { fagkode: 'ØKO1002', navn: 'Økonomistyring 2', timer: '140' },
        { fagkode: 'MAR1002', navn: 'Markedsføring og ledelse 2', timer: '140' },
        { fagkode: 'PSY1002', navn: 'Psykologi 2', timer: '140' }
      ],
      'blokk_2': [
        { fagkode: 'HIS1010', navn: 'Historie', timer: '113', note: 'Fellesfag' },
        { fagkode: 'MAT1025', navn: 'Matematikk R2', timer: '140' },
        { fagkode: 'KJE1002', navn: 'Kjemi 2', timer: '140' },
        { fagkode: 'ENT1002', navn: 'Entreprenørskap og bedriftsutvikling 2', timer: '140' },
        { fagkode: 'SAM1001', navn: 'Samfunnsgeografi', timer: '140' }
      ],
      'blokk_3': [
        { fagkode: 'HIS1010', navn: 'Historie', timer: '113', note: 'Fellesfag' },
        { fagkode: 'FYS1002', navn: 'Fysikk 2', timer: '140' },
        { fagkode: 'MAR1002', navn: 'Markedsføring og ledelse 2', timer: '140' },
        { fagkode: 'SAM1002', navn: 'Samfunnsøkonomi', timer: '140' }
      ],
      'blokk_4': [
        { fagkode: 'HIS1010', navn: 'Historie', timer: '113', note: 'Fellesfag' },
        { fagkode: 'FYS1002', navn: 'Fysikk 2', timer: '140' },
        { fagkode: 'BIO1002', navn: 'Biologi 2', timer: '140' },
        { fagkode: 'INF1001', navn: 'Informasjonsteknologi 1', timer: '140' }
      ]
    }
  }
};
