/**
 * Data Handler - Loads and processes curriculum data
 *
 * Supports:
 * - Mock data (default for development)
 * - API v2 (recommended - single endpoint with all data)
 * - API v1 (legacy - separate endpoints)
 */

import { mockTimefordeling, mockBlokkskjema } from './data-mock.js';

export class DataHandler {
  constructor(options = {}) {
    // Data storage
    this.data = null;  // v2: All data in one object
    this.blokkskjemaData = null;  // v1 compatibility
    this.timefordelingData = null;  // v1 compatibility

    // Configuration
    this.schoolId = options.schoolId || 'bergen-private-gymnas';
    this.useMockData = options.useMockData !== false;  // Default: true
    this.apiVersion = options.apiVersion || 'v2';  // Default: v2

    // API URLs
    this.apiBaseUrlV1 = options.apiBaseUrl || 'https://fredeids-metis.github.io/school-data/api/v1';
    this.apiBaseUrlV2 = 'https://fredeids-metis.github.io/school-data/api/v2';

    this.loaded = false;
  }

  /**
   * Load all data (main entry point)
   * Uses v2 API by default (single request)
   */
  async loadAll() {
    if (this.useMockData) {
      console.log('📦 Using mock data');
      this.blokkskjemaData = mockBlokkskjema;
      this.timefordelingData = mockTimefordeling;
      this.loaded = true;
      return { blokkskjema: mockBlokkskjema, timefordeling: mockTimefordeling };
    }

    if (this.apiVersion === 'v2') {
      return await this.loadFromV2API();
    } else {
      // Legacy v1 loading
      await this.loadBlokkskjema(this.schoolId);
      await this.loadTimefordeling();
      return {
        blokkskjema: this.blokkskjemaData,
        timefordeling: this.timefordelingData
      };
    }
  }

  /**
   * Load from v2 API (studieplanlegger.json - single endpoint)
   */
  async loadFromV2API() {
    const url = `${this.apiBaseUrlV2}/schools/${this.schoolId}/studieplanlegger.json`;
    console.log(`🌐 Loading from v2 API: ${url}`);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.data = await response.json();

      // Extract commonly used data for easier access
      this.blokkskjemaData = this.data.blokkskjema;
      this.valgregler = this.data.valgregler;
      this.regler = this.data.regler;
      this.timevalidering = this.data.timevalidering;
      this.curriculum = this.data.curriculum;
      this.school = this.data.school;

      this.loaded = true;

      console.log('✅ Data loaded successfully');
      console.log(`   - ${Object.keys(this.blokkskjemaData.blokker || {}).length} blokker`);
      console.log(`   - ${Object.keys(this.valgregler || {}).length} programområder med valgregler`);

      return this.data;
    } catch (error) {
      console.error('❌ Error loading from v2 API:', error);
      console.log('📦 Falling back to mock data');

      this.blokkskjemaData = mockBlokkskjema;
      this.timefordelingData = mockTimefordeling;
      this.loaded = true;

      return { blokkskjema: mockBlokkskjema, timefordeling: mockTimefordeling };
    }
  }

  /**
   * Get blokkskjema structure
   */
  getBlokkskjema() {
    return this.blokkskjemaData;
  }

  /**
   * Get all blokker
   */
  getBlokker() {
    return this.blokkskjemaData?.blokker || {};
  }

  /**
   * Get fag in a specific blokk
   * @param {string} blokkId - e.g., 'blokk1', 'blokk2'
   */
  getFagInBlokk(blokkId) {
    return this.blokkskjemaData?.blokker?.[blokkId]?.fag || [];
  }

  /**
   * Get fag available for a specific program and trinn
   * @param {string} programId - e.g., 'studiespesialisering'
   * @param {string} trinn - 'vg2' or 'vg3'
   */
  getFagForProgramOgTrinn(programId, trinn) {
    const blokker = this.getBlokker();
    const result = {};

    Object.entries(blokker).forEach(([blokkId, blokk]) => {
      // Check if this blokk is available for this program/trinn
      const tilgjengelig = blokk.tilgjengeligFor?.[trinn] || [];
      if (!tilgjengelig.includes(programId)) {
        return;
      }

      // Filter fag by trinn and program
      const fagForTrinn = (blokk.fag || []).filter(fag => {
        const fagTrinn = fag.trinn;
        const fagTilgjengelig = fag.tilgjengeligFor || [];

        return fagTrinn === trinn && fagTilgjengelig.includes(programId);
      });

      if (fagForTrinn.length > 0) {
        result[blokkId] = {
          navn: blokk.navn,
          beskrivelse: blokk.beskrivelse,
          fag: fagForTrinn
        };
      }
    });

    return result;
  }

  /**
   * Get valgregler for a specific program
   * @param {string} programId - e.g., 'studiespesialisering'
   */
  getValgregler(programId) {
    return this.valgregler?.[programId] || null;
  }

  /**
   * Get valgregler for a specific program and trinn
   * @param {string} programId - e.g., 'studiespesialisering'
   * @param {string} trinn - 'vg2' or 'vg3'
   */
  getValgreglerForTrinn(programId, trinn) {
    return this.valgregler?.[programId]?.[trinn] || null;
  }

  /**
   * Get forutsetninger (prerequisites)
   */
  getForutsetninger() {
    return this.regler?.forutsetninger || [];
  }

  /**
   * Get eksklusjoner (exclusions)
   */
  getEksklusjoner() {
    return this.regler?.eksklusjoner || [];
  }

  /**
   * Get erstatter rules (replacements)
   */
  getErstatter() {
    return this.regler?.erstatter || [];
  }

  /**
   * Get timevalidering for a program and trinn
   * @param {string} programId
   * @param {string} trinn
   */
  getTimevalidering(programId, trinn) {
    return this.timevalidering?.[programId]?.[trinn] || null;
  }

  /**
   * Get school info
   */
  getSchool() {
    return this.school || null;
  }

  /**
   * Get available programs
   */
  getPrograms() {
    return this.school?.programs || [];
  }

  /**
   * Get curriculum data (for lookups)
   */
  getCurriculum() {
    return this.curriculum || null;
  }

  /**
   * Find fag by ID in curriculum
   * @param {string} fagId
   */
  findFagById(fagId) {
    if (!this.curriculum) return null;

    // Search in all categories
    for (const category of ['valgfrieProgramfag', 'obligatoriskeProgramfag', 'fellesfag']) {
      const found = this.curriculum[category]?.find(f => f.id === fagId);
      if (found) return found;
    }

    return null;
  }

  /**
   * Check if fag has prerequisite
   * @param {string} fagId - The fag to check
   * @returns {Object|null} Prerequisite info or null
   */
  getPrerequisiteFor(fagId) {
    const forutsetninger = this.getForutsetninger();
    return forutsetninger.find(f => f.fag === fagId) || null;
  }

  /**
   * Check if fag is excluded by another selection
   * @param {string} fagId
   * @param {Array} selectedFagIds
   */
  isExcludedBy(fagId, selectedFagIds) {
    const eksklusjoner = this.getEksklusjoner();

    for (const regel of eksklusjoner) {
      if (regel.gruppe?.includes(fagId)) {
        // Check if any other fag in the group is selected
        const otherInGroup = regel.gruppe.filter(id => id !== fagId);
        const conflict = otherInGroup.find(id => selectedFagIds.includes(id));
        if (conflict) {
          return {
            excluded: true,
            by: conflict,
            beskrivelse: regel.beskrivelse,
            feilmelding: regel.feilmelding
          };
        }
      }
    }

    return { excluded: false };
  }

  // ================================================
  // LEGACY v1 METHODS (for backwards compatibility)
  // ================================================

  /**
   * Load blokkskjema data (v1 legacy)
   * @deprecated Use loadAll() instead
   */
  async loadBlokkskjema(schoolId) {
    if (this.useMockData) {
      console.log('Using mock blokkskjema data');
      this.blokkskjemaData = mockBlokkskjema;
      return this.blokkskjemaData;
    }

    try {
      const url = `${this.apiBaseUrlV1}/schools/${schoolId}/blokkskjema.json`;
      console.log(`Loading blokkskjema from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.blokkskjemaData = await response.json();
      console.log('Blokkskjema loaded successfully');
      return this.blokkskjemaData;
    } catch (error) {
      console.error('Error loading blokkskjema, falling back to mock data:', error);
      this.blokkskjemaData = mockBlokkskjema;
      return this.blokkskjemaData;
    }
  }

  /**
   * Load timefordeling data (v1 legacy)
   * @deprecated Use loadAll() instead
   */
  async loadTimefordeling() {
    if (this.useMockData) {
      console.log('Using mock timefordeling data');
      this.timefordelingData = mockTimefordeling;
      return this.timefordelingData;
    }

    try {
      const url = `${this.apiBaseUrlV1}/curriculum/timefordeling.json`;
      console.log(`Loading timefordeling from: ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.timefordelingData = await response.json();
      console.log('Timefordeling loaded successfully');
      return this.timefordelingData;
    } catch (error) {
      console.error('Error loading timefordeling, falling back to mock data:', error);
      this.timefordelingData = mockTimefordeling;
      return this.timefordelingData;
    }
  }

  /**
   * Get fellesfag for a specific programområde and trinn (v1 legacy)
   * @deprecated
   */
  getFellesfag(programomrade, trinn) {
    if (!this.timefordelingData) {
      console.warn('Timefordeling data not loaded');
      return [];
    }

    const programMap = {
      'studiespesialisering': 'studiespesialisering',
      'musikk-dans-drama': 'musikk',
      'medier-kommunikasjon': 'medier'
    };

    const program = programMap[programomrade];
    if (!program || !this.timefordelingData[program]) {
      return [];
    }

    const data = this.timefordelingData[program][trinn];
    if (Array.isArray(data)) {
      return data;
    }
    return data?.fellesfag || [];
  }
}
