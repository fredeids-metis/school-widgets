/**
 * State Manager - Manages widget state
 */

export class StudieplanleggerState {
  constructor() {
    this.state = {
      // Filter state
      programomrade: 'studiespesialisering',
      harFremmedsprak: true,

      // Selected subjects
      vg1: {
        fremmedsprak: null,
        matematikk: null
      },
      vg2: {
        matematikk: null,
        programfag: []
      },
      vg3: {
        programfag: []
      }
    };

    this.listeners = [];
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Called when state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(callback => callback(this.state));
  }

  /**
   * Set programområde
   */
  setProgramomrade(programomrade) {
    this.state.programomrade = programomrade;
    this.notify();
  }

  /**
   * Set fremmedspråk status
   */
  setHarFremmedsprak(harFremmedsprak) {
    this.state.harFremmedsprak = harFremmedsprak;
    this.notify();
  }

  /**
   * Set VG1 subject
   */
  setVG1Subject(type, subject) {
    this.state.vg1[type] = subject;
    this.notify();
  }

  /**
   * Set VG2 matematikk
   */
  setVG2Matematikk(matematikk) {
    this.state.vg2.matematikk = matematikk;
    this.notify();
  }

  /**
   * Set VG2/VG3 programfag
   */
  setProgramfag(trinn, programfag) {
    this.state[trinn].programfag = programfag;
    this.notify();
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Validate current selections
   * @returns {Object} Validation results
   */
  validate() {
    const validation = {
      vg1Complete: false,
      vg2Complete: false,
      vg3Complete: false,
      errors: []
    };

    // VG1 validation
    if (this.state.vg1.fremmedsprak && this.state.vg1.matematikk) {
      validation.vg1Complete = true;
    } else {
      if (!this.state.vg1.fremmedsprak) {
        validation.errors.push('VG1: Fremmedspråk ikke valgt');
      }
      if (!this.state.vg1.matematikk) {
        validation.errors.push('VG1: Matematikk ikke valgt');
      }
    }

    // VG2 validation (depends on programområde)
    const vg2HasMatematikk = this.state.vg2.matematikk !== null;
    // For VG2, we expect 3 programfag (matematikk is separate)
    const vg2ProgramfagComplete = this.state.vg2.programfag.length === 3;

    if (vg2HasMatematikk && vg2ProgramfagComplete) {
      validation.vg2Complete = true;
    } else {
      if (!vg2HasMatematikk) {
        validation.errors.push('VG2: Matematikk ikke valgt');
      }
      if (!vg2ProgramfagComplete) {
        validation.errors.push(`VG2: ${this.state.vg2.programfag.length}/3 programfag valgt`);
      }
    }

    // VG3 validation
    // For VG3, check if Historie is selected and 3 other programfag
    const vg3HasHistorie = this.state.vg3.programfag.some(f => f.fagkode === 'HIS1010');
    const vg3ProgramfagCount = this.state.vg3.programfag.length;

    if (vg3HasHistorie && vg3ProgramfagCount === 4) {
      validation.vg3Complete = true;
    } else {
      if (!vg3HasHistorie) {
        validation.errors.push('VG3: Historie må velges');
      }
      if (vg3ProgramfagCount !== 4) {
        validation.errors.push(`VG3: ${vg3ProgramfagCount}/4 fag valgt`);
      }
    }

    validation.isComplete = validation.vg1Complete && validation.vg2Complete && validation.vg3Complete;

    return validation;
  }

  /**
   * Get required number of programfag for a trinn
   */
  getRequiredProgramfagCount(trinn) {
    // Studiespesialisering VG2: 4 fag total (1 matematikk + 3 programfag)
    // Studiespesialisering VG3: 4 fag total (1 historie + 3 programfag)
    // But we return 4 because user selects 4 fag from blokkskjema
    if (this.state.programomrade === 'studiespesialisering') {
      if (trinn === 'vg2' || trinn === 'vg3') {
        return 4; // User selects 4 fag
      }
    }
    return 3; // Default for now
  }

  /**
   * Calculate total hours for programfag
   */
  calculateProgramfagHours(trinn) {
    const programfag = this.state[trinn].programfag;
    return programfag.reduce((total, fag) => {
      const hours = parseInt(fag.timer) || 0;
      return total + hours;
    }, 0);
  }
}
