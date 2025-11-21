/**
 * ValidationService - Unified validation logic for Studieplanlegger
 *
 * Loads all validation rules from API (regler.json) at initialization.
 * Single Source of Truth: All rules come from school-data/data/curriculum/regler.yml
 *
 * Provides:
 * - Pre-selection validation (can this fag be selected?)
 * - Consequence prediction (what happens if selected?)
 * - Fordypning tracking
 * - Real-time validation feedback
 */

export class ValidationService {
  constructor() {
    // Will be loaded from API
    this.eksklusjoner = [];
    this.forutsetninger = [];
    this.fagomrader = {};
    this.fordypningKrav = {};
    this.spesialregler = {};

    // Computed from fagomrader
    this.fagomradeMap = {};     // fagId -> fagområdeKode
    this.fagomradeNavn = {};    // fagområdeKode -> displayName

    this.loaded = false;
    this.loadError = null;
  }

  /**
   * Initialize service by loading rules from API
   * @param {string} apiBaseUrl - Base URL for API (default to GitHub Pages)
   */
  async init(apiBaseUrl = 'https://fredeids-metis.github.io/school-data/api/v1') {
    console.log('🔄 ValidationService: Starting init...');
    try {
      const url = `${apiBaseUrl}/curriculum/regler.json`;
      console.log('🔄 ValidationService: Fetching from', url);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load regler.json: ${response.status}`);
      }

      const regler = await response.json();

      // Load all rule sets
      this.eksklusjoner = regler.eksklusjoner || [];
      this.forutsetninger = regler.forutsetninger || [];
      this.fagomrader = regler.fagomrader || {};
      this.fordypningKrav = regler.fordypning || {};
      this.spesialregler = regler.spesialregler || {};

      // Build reverse lookup maps from fagomrader
      this._buildFagomradeMaps();

      this.loaded = true;
      console.log('✅ ValidationService loaded rules from API');
      console.log(`   - ${this.eksklusjoner.length} eksklusjoner`);
      console.log(`   - ${this.forutsetninger.length} forutsetninger`);
      console.log(`   - ${Object.keys(this.fagomrader).length} fagområder`);
      return true;
    } catch (error) {
      this.loadError = error;
      console.error('❌ ValidationService failed to load rules:', error);

      // Fallback: Use minimal hardcoded rules
      this._loadFallbackRules();
      return false;
    }
  }

  /**
   * Build fagId -> fagområde mappings from API data
   */
  _buildFagomradeMaps() {
    this.fagomradeMap = {};
    this.fagomradeNavn = {};

    for (const [kode, data] of Object.entries(this.fagomrader)) {
      this.fagomradeNavn[kode] = data.navn;

      if (data.fag) {
        for (const fagId of data.fag) {
          this.fagomradeMap[fagId] = kode;
        }
      }
    }
  }

  /**
   * Fallback rules if API fails (basic math conflict rules)
   */
  _loadFallbackRules() {
    console.warn('⚠️ Using fallback validation rules');

    this.eksklusjoner = [
      {
        id: 'math-s-r-conflict',
        type: 'blocking',
        konfliktGrupper: [
          ['matematikk-s1', 'matematikk-s2'],  // S-linja
          ['matematikk-r1', 'matematikk-r2']   // R-linja
        ],
        feilmelding: 'Du kan ikke kombinere Matematikk S og R på samme vitnemål',
        forslag: 'Velg enten S-linja (S1/S2) eller R-linja (R1/R2)'
      },
      {
        id: 'math-programfag-2p-conflict',
        type: 'blocking',
        konfliktGrupper: [
          ['matematikk-r1', 'matematikk-s1'],  // Programfag
          ['matematikk-2p']                     // Fellesfag
        ],
        feilmelding: 'R1/S1 og 2P kan ikke kombineres - programfaget erstatter fellesfaget',
        forslag: 'Matematikk R1 eller S1 erstatter 2P automatisk'
      },
      {
        id: 'geofag-x-1-conflict',
        type: 'blocking',
        gruppe: ['geofag-x', 'geofag-1'],
        feilmelding: 'Geofag X og Geofag 1 kan ikke kombineres',
        forslag: 'Velg enten Geofag X eller Geofag 1'
      },
      {
        id: 'tof-x-1-conflict',
        type: 'blocking',
        gruppe: ['teknologi-og-forskningslare-x', 'teknologi-og-forskningslare-1'],
        feilmelding: 'Teknologi og forskningslære X og 1 kan ikke kombineres',
        forslag: 'Velg enten X-varianten eller nivå 1'
      }
    ];

    this.fagomradeMap = {
      'matematikk-r1': 'MAT', 'matematikk-r2': 'MAT',
      'matematikk-s1': 'MAT', 'matematikk-s2': 'MAT',
      'fysikk-1': 'FYS', 'fysikk-2': 'FYS',
      'kjemi-1': 'KJE', 'kjemi-2': 'KJE',
      'biologi-1': 'BIO', 'biologi-2': 'BIO'
    };

    this.fagomradeNavn = {
      'MAT': 'Matematikk', 'FYS': 'Fysikk', 'KJE': 'Kjemi', 'BIO': 'Biologi'
    };

    this.loaded = true;
  }

  /**
   * Get all selected fag IDs from state (VG2 + VG3)
   */
  getAllSelectedFagIds(state) {
    const ids = [];

    if (state.vg2?.programfag) {
      state.vg2.programfag.forEach(f => ids.push(f.id || f.fagkode));
    }
    if (state.vg2?.matematikk) {
      ids.push(state.vg2.matematikk.id || state.vg2.matematikk.fagkode);
    }
    if (state.vg3?.programfag) {
      state.vg3.programfag.forEach(f => ids.push(f.id || f.fagkode));
    }

    return ids.filter(Boolean).map(id => id.toLowerCase());
  }

  /**
   * PRE-SELECTION: Check if a fag can be selected
   * Returns status and reasons BEFORE the user clicks
   *
   * @param {string} fagId - The fag to check
   * @param {Object} state - Current state
   * @param {string} trinn - 'vg2' or 'vg3'
   * @param {Array} currentModalSelections - Currently selected in modal
   * @returns {Object} { status: 'available'|'blocked'|'warning'|'selected', reasons: [], cssClass: '' }
   */
  canSelectFag(fagId, state, trinn, currentModalSelections = []) {
    const result = {
      status: 'available',
      reasons: [],
      cssClass: '',
      suggestion: null
    };

    const normalizedFagId = fagId.toLowerCase();
    const allSelected = this.getAllSelectedFagIds(state);
    const modalSelectedIds = currentModalSelections.map(f => (f.id || f.fagkode || '').toLowerCase());
    const combinedSelected = [...allSelected, ...modalSelectedIds];

    // 1. Check if already selected in this modal
    if (modalSelectedIds.includes(normalizedFagId)) {
      result.status = 'selected';
      result.cssClass = 'selected';
      return result;
    }

    // 2. Check if already selected in state (duplicate)
    if (allSelected.includes(normalizedFagId)) {
      result.status = 'blocked';
      result.cssClass = 'invalid-duplicate';
      result.reasons.push('Du har allerede dette faget');
      return result;
    }

    // 3. Check blocking exclusions (from API)
    const exclusionCheck = this._checkExclusions(normalizedFagId, combinedSelected);
    if (exclusionCheck.blocked) {
      result.status = 'blocked';
      result.cssClass = 'blocked';
      result.reasons = exclusionCheck.reasons;
      result.suggestion = exclusionCheck.suggestion;
      return result;
    }

    // 4. Check prerequisites (warnings, not blocking)
    const prereqCheck = this._checkPrerequisites(normalizedFagId, allSelected, trinn);
    if (!prereqCheck.met) {
      result.status = 'warning';
      result.cssClass = 'missing-prerequisite';
      result.reasons.push(prereqCheck.message);
      result.suggestion = prereqCheck.suggestion;
    }

    return result;
  }

  /**
   * Check exclusion rules from API
   * Supports two formats:
   * - gruppe: simple mutual exclusion (all items conflict with each other)
   * - konfliktGrupper: group vs group (items from different groups conflict)
   */
  _checkExclusions(fagId, selectedFagIds) {
    const reasons = [];
    let suggestion = null;

    for (const eksklusjon of this.eksklusjoner) {
      if (eksklusjon.type !== 'blocking') continue;

      // Format 1: konfliktGrupper - group vs group conflicts
      // e.g. S-linja [s1,s2] vs R-linja [r1,r2] - R1+R2 is OK, but R1+S1 is not
      if (eksklusjon.konfliktGrupper) {
        // Find which group (if any) the fagId belongs to
        let fagGroup = null;
        for (const group of eksklusjon.konfliktGrupper) {
          if (group.includes(fagId)) {
            fagGroup = group;
            break;
          }
        }

        if (fagGroup) {
          // Check if any selected fag is in a DIFFERENT group
          for (const otherGroup of eksklusjon.konfliktGrupper) {
            if (otherGroup === fagGroup) continue; // Same group is OK

            const conflict = otherGroup.find(id => selectedFagIds.includes(id));
            if (conflict) {
              reasons.push(eksklusjon.feilmelding || eksklusjon.beskrivelse);
              suggestion = eksklusjon.forslag;
              break;
            }
          }
        }
      }
      // Format 2: gruppe - simple mutual exclusion (original format)
      else if (eksklusjon.gruppe?.includes(fagId)) {
        const conflict = eksklusjon.gruppe.find(id =>
          id !== fagId && selectedFagIds.includes(id)
        );
        if (conflict) {
          reasons.push(eksklusjon.feilmelding || eksklusjon.beskrivelse);
          suggestion = eksklusjon.forslag;
        }
      }
    }

    return {
      blocked: reasons.length > 0,
      reasons,
      suggestion
    };
  }

  /**
   * Check prerequisites from API
   */
  _checkPrerequisites(fagId, selectedFagIds, trinn) {
    // Only check prerequisites for VG3
    if (trinn !== 'vg3') {
      return { met: true };
    }

    for (const prereq of this.forutsetninger) {
      if (prereq.fag === fagId) {
        const hasPrereq = prereq.krever.some(req => selectedFagIds.includes(req));
        if (!hasPrereq) {
          return {
            met: false,
            message: prereq.feilmelding || `Krever: ${prereq.krever.join(' eller ')}`,
            suggestion: prereq.forslag
          };
        }
      }
    }

    return { met: true };
  }

  /**
   * CONSEQUENCES: What happens if this fag is selected?
   */
  getConsequences(fagId, state) {
    const normalizedFagId = fagId.toLowerCase();
    const consequences = {
      willBlock: [],
      willEnable: [],
      fordypningImpact: null
    };

    // Find what will be blocked by checking exclusions
    for (const eksklusjon of this.eksklusjoner) {
      if (eksklusjon.type !== 'blocking') continue;

      // Format 1: konfliktGrupper - only block items from OTHER groups
      if (eksklusjon.konfliktGrupper) {
        let fagGroup = null;
        for (const group of eksklusjon.konfliktGrupper) {
          if (group.includes(normalizedFagId)) {
            fagGroup = group;
            break;
          }
        }
        if (fagGroup) {
          for (const otherGroup of eksklusjon.konfliktGrupper) {
            if (otherGroup === fagGroup) continue;
            for (const otherId of otherGroup) {
              consequences.willBlock.push({
                id: otherId,
                navn: this._getFagNavn(otherId),
                reason: eksklusjon.beskrivelse
              });
            }
          }
        }
      }
      // Format 2: gruppe - block all others in same group
      else if (eksklusjon.gruppe?.includes(normalizedFagId)) {
        for (const otherId of eksklusjon.gruppe) {
          if (otherId !== normalizedFagId) {
            consequences.willBlock.push({
              id: otherId,
              navn: this._getFagNavn(otherId),
              reason: eksklusjon.beskrivelse
            });
          }
        }
      }
    }

    // Find what will be enabled (prerequisites fulfilled)
    for (const prereq of this.forutsetninger) {
      if (prereq.krever.includes(normalizedFagId)) {
        consequences.willEnable.push({
          id: prereq.fag,
          navn: this._getFagNavn(prereq.fag)
        });
      }
    }

    // Fordypning impact
    const fagomrade = this.fagomradeMap[normalizedFagId];
    if (fagomrade) {
      consequences.fordypningImpact = {
        area: fagomrade,
        areaName: this.fagomradeNavn[fagomrade],
        adds: 140 // Standard timer per fag
      };
    }

    return consequences;
  }

  /**
   * Get display name for a fag (fallback to ID)
   */
  _getFagNavn(fagId) {
    // Convert ID to readable name
    return fagId
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  /**
   * FORDYPNING: Calculate current fordypning status
   */
  getFordypningStatus(state, programomrade = 'studiespesialisering') {
    const krav = this.fordypningKrav[programomrade] || this.fordypningKrav.studiespesialisering || {
      minTimer: 560,
      minOmrader: 2,
      timerPerOmrade: 280
    };

    const allFag = this.getAllSelectedFagIds(state);
    const areaTimers = {};

    // Count timer per fagområde
    allFag.forEach(fagId => {
      const area = this.fagomradeMap[fagId];
      if (area) {
        areaTimers[area] = (areaTimers[area] || 0) + 140;
      }
    });

    // Build area details
    const areas = Object.entries(areaTimers).map(([code, timer]) => ({
      code,
      name: this.fagomradeNavn[code] || code,
      timer,
      fagCount: Math.round(timer / 140),
      meetsMinimum: timer >= krav.timerPerOmrade
    }));

    // Sort by timer (descending)
    areas.sort((a, b) => b.timer - a.timer);

    // Calculate fordypning (areas meeting minimum)
    const fordypningAreas = areas.filter(a => a.meetsMinimum);
    const fordypningTimer = fordypningAreas
      .slice(0, krav.minOmrader)
      .reduce((sum, a) => sum + Math.min(a.timer, krav.timerPerOmrade), 0);

    const isValid = fordypningTimer >= krav.minTimer && fordypningAreas.length >= krav.minOmrader;
    const progress = Math.min(100, Math.round((fordypningTimer / krav.minTimer) * 100));

    return {
      areas,
      fordypningAreas,
      totalTimer: fordypningTimer,
      required: krav.minTimer,
      requiredAreas: krav.minOmrader,
      timerPerArea: krav.timerPerOmrade,
      isValid,
      progress,
      missingAreas: Math.max(0, krav.minOmrader - fordypningAreas.length),
      missingTimer: Math.max(0, krav.minTimer - fordypningTimer)
    };
  }

  /**
   * FULL VALIDATION: Validate entire study plan
   */
  validateAll(state, programomrade = 'studiespesialisering') {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    const allFag = this.getAllSelectedFagIds(state);

    // 1. Check all blocking exclusions
    for (const eksklusjon of this.eksklusjoner) {
      if (eksklusjon.type !== 'blocking') continue;

      let hasConflict = false;

      // Format 1: konfliktGrupper - check if fag from different groups are selected
      if (eksklusjon.konfliktGrupper) {
        const groupsWithSelections = eksklusjon.konfliktGrupper.filter(group =>
          group.some(id => allFag.includes(id))
        );
        hasConflict = groupsWithSelections.length > 1;
      }
      // Format 2: gruppe - check if multiple from same group
      else if (eksklusjon.gruppe) {
        const matchCount = eksklusjon.gruppe.filter(id => allFag.includes(id)).length;
        hasConflict = matchCount > 1;
      }

      if (hasConflict) {
        result.valid = false;
        result.errors.push({
          type: 'exclusion',
          id: eksklusjon.id,
          message: eksklusjon.feilmelding || eksklusjon.beskrivelse,
          suggestion: eksklusjon.forslag
        });
      }
    }

    // 2. Check fordypning (only for studiespesialisering)
    if (programomrade?.includes('studiespesialisering')) {
      const fordypning = this.getFordypningStatus(state, programomrade);
      if (!fordypning.isValid && allFag.length >= 4) {
        result.warnings.push({
          type: 'fordypning',
          message: `Fordypning: ${fordypning.totalTimer}/${fordypning.required} timer`,
          details: fordypning.missingAreas > 0
            ? `Mangler ${fordypning.missingAreas} fagområde(r) med minst ${fordypning.timerPerArea} timer`
            : `Mangler ${fordypning.missingTimer} timer`,
          suggestion: 'Velg flere fag fra samme fagområde for å oppnå fordypning'
        });
      }
    }

    // 3. Check prerequisites (warnings)
    for (const prereq of this.forutsetninger) {
      if (allFag.includes(prereq.fag)) {
        const hasPrereq = prereq.krever.some(req => allFag.includes(req));
        if (!hasPrereq) {
          result.warnings.push({
            type: 'prerequisite',
            message: prereq.feilmelding,
            suggestion: prereq.forslag
          });
        }
      }
    }

    return result;
  }

  /**
   * VALIDATE MODAL SELECTION: Check current modal selections
   */
  validateModalSelection(selectedFag, state, trinn) {
    const result = {
      valid: true,
      errors: [],
      canSubmit: true
    };

    const selectedIds = selectedFag.map(f => (f.id || f.fagkode || '').toLowerCase());
    const stateIds = this.getAllSelectedFagIds(state);
    const allIds = [...stateIds, ...selectedIds];

    // Check for duplicates within selection
    const seen = new Set();
    const duplicates = [];
    selectedIds.forEach(id => {
      if (seen.has(id)) {
        duplicates.push(id);
      }
      seen.add(id);
    });

    if (duplicates.length > 0) {
      result.valid = false;
      result.canSubmit = false;
      result.errors.push({
        type: 'duplicate',
        message: `Duplikat: ${duplicates.join(', ')}`,
        fagIds: duplicates
      });
    }

    // Check all exclusions
    for (const eksklusjon of this.eksklusjoner) {
      if (eksklusjon.type !== 'blocking') continue;

      let hasConflict = false;
      let conflictingFagIds = [];

      // Format 1: konfliktGrupper
      if (eksklusjon.konfliktGrupper) {
        const groupsWithSelections = eksklusjon.konfliktGrupper.filter(group =>
          group.some(id => allIds.includes(id))
        );
        hasConflict = groupsWithSelections.length > 1;
        if (hasConflict) {
          conflictingFagIds = eksklusjon.konfliktGrupper
            .flat()
            .filter(id => allIds.includes(id));
        }
      }
      // Format 2: gruppe
      else if (eksklusjon.gruppe) {
        const matches = eksklusjon.gruppe.filter(id => allIds.includes(id));
        hasConflict = matches.length > 1;
        conflictingFagIds = matches;
      }

      if (hasConflict) {
        result.valid = false;
        result.canSubmit = false;
        result.errors.push({
          type: 'exclusion',
          message: eksklusjon.feilmelding || eksklusjon.beskrivelse,
          fagIds: conflictingFagIds
        });
      }
    }

    return result;
  }

  /**
   * Get exclusion rules (for external use)
   */
  getEksklusjoner() {
    return this.eksklusjoner;
  }

  /**
   * Get prerequisite rules (for external use)
   */
  getForutsetninger() {
    return this.forutsetninger;
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.loaded;
  }
}
