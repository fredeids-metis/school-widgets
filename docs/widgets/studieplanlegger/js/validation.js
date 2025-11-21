/**
 * Validation Module - Validates study plan selections
 * Based on rules from REGLER.md and TIMEFORDELING.md
 */

export class StudieValidator {
  constructor(dataHandler) {
    this.dataHandler = dataHandler;

    // Fagområde mapping for common subjects
    this.fagomradeMap = {
      // Matematikk
      'matematikk-r1': 'MAT',
      'matematikk-r2': 'MAT',
      'matematikk-s1': 'MAT',
      'matematikk-s2': 'MAT',
      'matematikk-x': 'MAT',

      // Fysikk
      'fysikk-1': 'FYS',
      'fysikk-2': 'FYS',

      // Kjemi
      'kjemi-1': 'KJE',
      'kjemi-2': 'KJE',

      // Biologi
      'biologi-1': 'BIO',
      'biologi-2': 'BIO',

      // Geofag
      'geofag-1': 'GEO',
      'geofag-2': 'GEO',
      'geofag-x': 'GEO',

      // Informasjonsteknologi
      'informasjonsteknologi-1': 'IT',
      'informasjonsteknologi-2': 'IT',

      // Teknologi og forskningslære
      'teknologi-og-forskningslare-1': 'TOF',
      'teknologi-og-forskningslare-2': 'TOF',
      'teknologi-og-forskningslare-x': 'TOF',

      // Samfunnsøkonomi
      'samfunnsokonomi-1': 'SOK',
      'samfunnsokonomi-2': 'SOK',

      // Sosiologi og sosialantropologi
      'sosiologi-og-sosialantropologi': 'SOS',

      // Politikk og menneskerettigheter
      'politikk-og-menneskerettigheter': 'POM',

      // Psykologi
      'psykologi-1': 'PSY',
      'psykologi-2': 'PSY',

      // Rettslære
      'rettslare-1': 'RET',
      'rettslare-2': 'RET',

      // Historie og filosofi
      'historie-og-filosofi-1': 'HIF',
      'historie-og-filosofi-2': 'HIF',

      // Fremmedspråk
      'spansk-1': 'FSP',
      'spansk-2': 'FSP',
      'spansk-3': 'FSP',
      'tysk-1': 'FSP',
      'tysk-2': 'FSP',
      'tysk-3': 'FSP',
      'fransk-1': 'FSP',
      'fransk-2': 'FSP',
      'fransk-3': 'FSP',
      'kinesisk-1': 'FSP',
      'kinesisk-2': 'FSP',
      'kinesisk-3': 'FSP',

      // Entreprenørskap
      'entreprenorskap-og-bedriftsutvikling-1': 'ENT',
      'entreprenorskap-og-bedriftsutvikling-2': 'ENT',

      // Kommunikasjon og kultur
      'kommunikasjon-og-kultur-1': 'KOK',
      'kommunikasjon-og-kultur-2': 'KOK',
      'kommunikasjon-og-kultur-3': 'KOK',

      // Markedsføring og ledelse
      'markedsforing-og-ledelse-1': 'MOL',
      'markedsforing-og-ledelse-2': 'MOL',

      // Internasjonal engelsk
      'internasjonal-engelsk': 'ENG',
      'samfunnsfaglig-engelsk': 'ENG',
      'engelskspraklig-litteratur-og-kultur': 'ENG'
    };

    // Fremmedspråk IDs for exception handling
    this.fremmedsprakIds = [
      'spansk-1', 'spansk-2', 'spansk-3',
      'tysk-1', 'tysk-2', 'tysk-3',
      'fransk-1', 'fransk-2', 'fransk-3',
      'kinesisk-1', 'kinesisk-2', 'kinesisk-3'
    ];
  }

  /**
   * Get fagområde from fag-ID
   * @param {string} fagId - Subject ID (e.g., 'fysikk-1')
   * @returns {string|null} Fagområde code (e.g., 'FYS') or null if not found
   */
  getFagomrade(fagId) {
    if (!fagId) return null;

    const normalizedId = fagId.toLowerCase().replace(/\s+/g, '-');
    return this.fagomradeMap[normalizedId] || null;
  }

  /**
   * Check if a subject is a fremmedspråk
   * @param {string} fagId - Subject ID
   * @returns {boolean}
   */
  isFremmedsprak(fagId) {
    if (!fagId) return false;
    const normalizedId = fagId.toLowerCase().replace(/\s+/g, '-');
    return this.fremmedsprakIds.includes(normalizedId);
  }

  /**
   * Validate fordypning requirements (only for studiespesialisering)
   * Requires 560 hours from 2 subject areas (2 subjects x 140h per area)
   * Exception: Two foreign languages can be from the same subject area
   *
   * @param {Array} vg2Programfag - VG2 programfag selections
   * @param {Array} vg3Programfag - VG3 programfag selections
   * @returns {Object} { valid: boolean, errors: [], warnings: [] }
   */
  validateFordypning(vg2Programfag, vg3Programfag) {
    const result = { valid: true, errors: [], warnings: [] };

    // Combine all programfag
    const alleProgramfag = [...(vg2Programfag || []), ...(vg3Programfag || [])];

    // Group subjects by fagområde
    const fagomradeCount = {};
    const fagomradeFag = {};
    const fremmedsprakCount = {};

    alleProgramfag.forEach(fag => {
      const fagId = fag.id || fag.fagId || fag.fagkode;
      const fagomrade = this.getFagomrade(fagId);
      const timer = parseInt(fag.timer) || 140;

      if (fagomrade) {
        if (!fagomradeCount[fagomrade]) {
          fagomradeCount[fagomrade] = 0;
          fagomradeFag[fagomrade] = [];
        }
        fagomradeCount[fagomrade] += timer;
        fagomradeFag[fagomrade].push(fagId);

        // Track fremmedspråk separately
        if (this.isFremmedsprak(fagId)) {
          if (!fremmedsprakCount[fagomrade]) {
            fremmedsprakCount[fagomrade] = [];
          }
          fremmedsprakCount[fagomrade].push(fagId);
        }
      }
    });

    // Check fordypning: need 280 hours (2 subjects) from each of 2 different areas
    const fagomraderMedFordypning = Object.entries(fagomradeCount)
      .filter(([_, timer]) => timer >= 280)
      .map(([fagomrade]) => fagomrade);

    // Exception: Two different foreign languages count as fordypning even if same fagområde
    const harToFremmedsprak = Object.values(fremmedsprakCount)
      .some(fag => {
        // Check if there are two different language types (not just levels)
        const languages = new Set(fag.map(id => id.split('-')[0]));
        return languages.size >= 2;
      });

    if (fagomraderMedFordypning.length < 2 && !harToFremmedsprak) {
      result.valid = false;
      result.errors.push(
        'Fordypningskrav ikke oppfylt: Du må ha minst 280 timer (2 fag) fra hvert av 2 fagområder.'
      );
    } else if (fagomraderMedFordypning.length === 1 && harToFremmedsprak) {
      // One area from normal subjects + two foreign languages is valid
      result.valid = true;
      result.warnings.push(
        'Fordypning i to fremmedspråk godtas som ett av to fagområder.'
      );
    }

    // Check total hours from fordypning (should be at least 560)
    const totalFordypningTimer = fagomraderMedFordypning
      .slice(0, 2)
      .reduce((sum, fagomrade) => sum + Math.min(fagomradeCount[fagomrade], 280), 0);

    if (totalFordypningTimer < 560 && !harToFremmedsprak) {
      result.valid = false;
      result.errors.push(
        `Fordypningstimer: ${totalFordypningTimer}/560 timer. Du trenger ${560 - totalFordypningTimer} timer til.`
      );
    }

    return result;
  }

  /**
   * Validate spansk requirement for students without fremmedspråk from grunnskole
   * If harFremmedsprak=false, Spansk I+II (or equivalent) is required on VG3
   *
   * @param {boolean} harFremmedsprak - Whether student had fremmedspråk in grunnskole
   * @param {Array} vg3Programfag - VG3 programfag selections
   * @returns {Object} { valid: boolean, errors: [], warnings: [] }
   */
  validateSpansk(harFremmedsprak, vg3Programfag) {
    const result = { valid: true, errors: [], warnings: [] };

    // If student had fremmedspråk in grunnskole, no additional requirement
    if (harFremmedsprak) {
      return result;
    }

    // Check if VG3 includes fremmedspråk nivå II (140 timer)
    const vg3Fag = vg3Programfag || [];
    const harFremmedsprakNivaII = vg3Fag.some(fag => {
      const fagId = (fag.id || fag.fagId || fag.fagkode || '').toLowerCase();
      // Check for level 2 foreign language
      return fagId.includes('-2') && this.isFremmedsprak(fagId);
    });

    if (!harFremmedsprakNivaII) {
      result.valid = false;
      result.errors.push(
        'Du hadde ikke fremmedspråk på ungdomstrinnet. Du må ha fremmedspråk nivå II (140 timer) som fellesfag på VG3.'
      );
      result.warnings.push(
        'OBS: Dette reduserer dine valgfrie programfag med 140 timer.'
      );
    }

    return result;
  }

  /**
   * Validate matematikk exclusions
   * S1 cannot be combined with R2
   * R1 cannot be combined with S2
   * S and R cannot be on the same vitnemål
   *
   * @param {Array} alleProgramfag - All programfag across all years
   * @returns {Object} { valid: boolean, errors: [], warnings: [] }
   */
  validateMatematikk(alleProgramfag) {
    const result = { valid: true, errors: [], warnings: [] };

    const fag = (alleProgramfag || []).map(f =>
      (f.id || f.fagId || f.fagkode || '').toLowerCase()
    );

    const harS1 = fag.some(id => id.includes('matematikk-s1') || id === 's1');
    const harS2 = fag.some(id => id.includes('matematikk-s2') || id === 's2');
    const harR1 = fag.some(id => id.includes('matematikk-r1') || id === 'r1');
    const harR2 = fag.some(id => id.includes('matematikk-r2') || id === 'r2');

    // S1 + R2 is invalid
    if (harS1 && harR2) {
      result.valid = false;
      result.errors.push(
        'Ugyldig kombinasjon: Matematikk S1 kan ikke kombineres med Matematikk R2.'
      );
    }

    // R1 + S2 is invalid
    if (harR1 && harS2) {
      result.valid = false;
      result.errors.push(
        'Ugyldig kombinasjon: Matematikk R1 kan ikke kombineres med Matematikk S2.'
      );
    }

    // S and R cannot be combined at all
    const harS = harS1 || harS2;
    const harR = harR1 || harR2;

    if (harS && harR) {
      result.valid = false;
      result.errors.push(
        'Ugyldig kombinasjon: Matematikk S og Matematikk R kan ikke stå på samme vitnemål.'
      );
    }

    return result;
  }

  /**
   * Validate X-fag exclusions
   * Geofag X cannot be combined with Geofag 1
   * Teknologi og forskningslære X cannot be combined with Teknologi og forskningslære 1
   *
   * @param {Array} alleProgramfag - All programfag across all years
   * @returns {Object} { valid: boolean, errors: [], warnings: [] }
   */
  validateXFag(alleProgramfag) {
    const result = { valid: true, errors: [], warnings: [] };

    const fag = (alleProgramfag || []).map(f =>
      (f.id || f.fagId || f.fagkode || '').toLowerCase()
    );

    // Geofag X + Geofag 1
    const harGeofagX = fag.some(id => id.includes('geofag-x'));
    const harGeofag1 = fag.some(id => id.includes('geofag-1'));

    if (harGeofagX && harGeofag1) {
      result.valid = false;
      result.errors.push(
        'Ugyldig kombinasjon: Geofag X kan ikke føres på samme vitnemål som Geofag 1.'
      );
    }

    // Teknologi og forskningslære X + Teknologi og forskningslære 1
    const harTofX = fag.some(id => id.includes('teknologi-og-forskningslare-x'));
    const harTof1 = fag.some(id => id.includes('teknologi-og-forskningslare-1'));

    if (harTofX && harTof1) {
      result.valid = false;
      result.errors.push(
        'Ugyldig kombinasjon: Teknologi og forskningslære X kan ikke føres på samme vitnemål som Teknologi og forskningslære 1.'
      );
    }

    return result;
  }

  /**
   * Calculate total hours
   * @param {Object} state - Current state from StudieplanleggerState
   * @returns {Object} { vg2: number, vg3: number, total: number }
   */
  calculateTimerTotal(state) {
    const result = { vg2: 0, vg3: 0, total: 0 };

    if (!state) return result;

    // VG2 programfag
    if (state.vg2 && state.vg2.programfag) {
      result.vg2 = state.vg2.programfag.reduce((sum, fag) => {
        return sum + (parseInt(fag.timer) || 140);
      }, 0);
    }

    // VG3 programfag
    if (state.vg3 && state.vg3.programfag) {
      result.vg3 = state.vg3.programfag.reduce((sum, fag) => {
        return sum + (parseInt(fag.timer) || 140);
      }, 0);
    }

    result.total = result.vg2 + result.vg3;

    return result;
  }

  /**
   * Check for fag that build on each other (recommendations, not errors)
   * @param {Array} alleProgramfag - All programfag
   * @returns {Array} List of warnings
   */
  validateFagSekvens(alleProgramfag) {
    const warnings = [];

    const fag = (alleProgramfag || []).map(f =>
      (f.id || f.fagId || f.fagkode || '').toLowerCase()
    );

    const byggPåRegler = [
      { nivå2: 'fysikk-2', nivå1: 'fysikk-1', navn: 'Fysikk' },
      { nivå2: 'kjemi-2', nivå1: 'kjemi-1', navn: 'Kjemi' },
      { nivå2: 'biologi-2', nivå1: 'biologi-1', navn: 'Biologi' },
      { nivå2: 'geofag-2', nivå1: 'geofag-1', navn: 'Geofag' },
      { nivå2: 'informasjonsteknologi-2', nivå1: 'informasjonsteknologi-1', navn: 'Informasjonsteknologi' },
      { nivå2: 'teknologi-og-forskningslare-2', nivå1: 'teknologi-og-forskningslare-1', navn: 'Teknologi og forskningslære' },
      { nivå2: 'samfunnsokonomi-2', nivå1: 'samfunnsokonomi-1', navn: 'Samfunnsøkonomi' },
      { nivå2: 'psykologi-2', nivå1: 'psykologi-1', navn: 'Psykologi' },
      { nivå2: 'rettslare-2', nivå1: 'rettslare-1', navn: 'Rettslære' },
      { nivå2: 'historie-og-filosofi-2', nivå1: 'historie-og-filosofi-1', navn: 'Historie og filosofi' },
      { nivå2: 'matematikk-r2', nivå1: 'matematikk-r1', navn: 'Matematikk R' },
      { nivå2: 'matematikk-s2', nivå1: 'matematikk-s1', navn: 'Matematikk S' }
    ];

    byggPåRegler.forEach(regel => {
      const harNivå2 = fag.some(id => id.includes(regel.nivå2));
      const harNivå1 = fag.some(id => id.includes(regel.nivå1));

      if (harNivå2 && !harNivå1) {
        warnings.push(
          `Anbefaling: ${regel.navn} 2 bygger på ${regel.navn} 1. Det anbefales å ta ${regel.navn} 1 først.`
        );
      }
    });

    return warnings;
  }

  /**
   * Main validation function - validates all rules
   * @param {Object} state - Current state from StudieplanleggerState
   * @param {string} programomrade - Program area (e.g., 'studiespesialisering')
   * @returns {Object} { valid: boolean, errors: [], warnings: [] }
   */
  validateAll(state, programomrade) {
    const result = { valid: true, errors: [], warnings: [] };

    if (!state) {
      result.valid = false;
      result.errors.push('Ingen data å validere.');
      return result;
    }

    const vg2Programfag = state.vg2?.programfag || [];
    const vg3Programfag = state.vg3?.programfag || [];
    const alleProgramfag = [...vg2Programfag, ...vg3Programfag];
    const harFremmedsprak = state.harFremmedsprak !== false;

    // 1. Validate matematikk exclusions (critical)
    const matResult = this.validateMatematikk(alleProgramfag);
    if (!matResult.valid) {
      result.valid = false;
      result.errors.push(...matResult.errors);
    }
    result.warnings.push(...matResult.warnings);

    // 2. Validate X-fag exclusions
    const xFagResult = this.validateXFag(alleProgramfag);
    if (!xFagResult.valid) {
      result.valid = false;
      result.errors.push(...xFagResult.errors);
    }
    result.warnings.push(...xFagResult.warnings);

    // 3. Validate fordypning (only for studiespesialisering)
    if (programomrade === 'studiespesialisering' ||
        programomrade === 'studiespesialisering_realfag' ||
        programomrade === 'studiespesialisering_sprak') {
      const fordypningResult = this.validateFordypning(vg2Programfag, vg3Programfag);
      if (!fordypningResult.valid) {
        result.valid = false;
        result.errors.push(...fordypningResult.errors);
      }
      result.warnings.push(...fordypningResult.warnings);
    }

    // 4. Validate spansk/fremmedspråk requirement
    const spraakResult = this.validateSpansk(harFremmedsprak, vg3Programfag);
    if (!spraakResult.valid) {
      // This is a warning, not a blocking error (user might add it as fellesfag)
      result.warnings.push(...spraakResult.errors);
    }
    result.warnings.push(...spraakResult.warnings);

    // 5. Check fag sequences (recommendations only)
    const sekvensWarnings = this.validateFagSekvens(alleProgramfag);
    result.warnings.push(...sekvensWarnings);

    // 6. Calculate and validate total hours
    const timer = this.calculateTimerTotal(state);

    // Expected programfag hours for studiespesialisering: 840 (420 VG2 + 420 VG3)
    // For students without fremmedspråk: 700 (420 VG2 + 280 VG3)
    if (programomrade?.includes('studiespesialisering')) {
      const expectedVg2 = 420;
      const expectedVg3 = harFremmedsprak ? 420 : 280;
      const expectedTotal = expectedVg2 + expectedVg3;

      if (timer.total > 0 && timer.total !== expectedTotal) {
        result.warnings.push(
          `Timefordeling: ${timer.total}/${expectedTotal} timer programfag valgt.`
        );
      }
    }

    return result;
  }
}
