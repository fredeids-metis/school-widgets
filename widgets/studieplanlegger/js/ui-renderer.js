/**
 * UI Renderer - Renders widget UI based on state and data
 */

export class UIRenderer {
  constructor(container, state, dataHandler) {
    this.container = container;
    this.state = state;
    this.dataHandler = dataHandler;
  }

  /**
   * Render the entire widget
   */
  render() {
    this.container.innerHTML = `
      <div class="studieplanlegger-widget">
        ${this.renderFilter()}
        ${this.renderValidation()}
        ${this.renderVGGrid()}
        ${this.renderModals()}
      </div>
    `;
  }

  /**
   * Render filter section
   */
  renderFilter() {
    const currentState = this.state.getState();

    return `
      <div class="sp-filter-section">
        <div class="sp-filter-grid">
          <div class="sp-filter-group">
            <label class="sp-filter-label">Velg programområde:</label>
            <div class="sp-filter-buttons">
              <button class="sp-filter-btn ${currentState.programomrade === 'studiespesialisering' ? 'selected' : ''}"
                      data-programomrade="studiespesialisering">
                Studiespesialisering
              </button>
              <button class="sp-filter-btn ${currentState.programomrade === 'musikk-dans-drama' ? 'selected' : ''}"
                      data-programomrade="musikk-dans-drama">
                Musikk, dans og drama
              </button>
              <button class="sp-filter-btn ${currentState.programomrade === 'medier-kommunikasjon' ? 'selected' : ''}"
                      data-programomrade="medier-kommunikasjon">
                Medier og kommunikasjon
              </button>
            </div>
          </div>

          <div class="sp-filter-group">
            <label class="sp-filter-label">Hadde du fremmedspråk på ungdomsskolen?</label>
            <div class="sp-filter-buttons">
              <button class="sp-filter-btn ${currentState.harFremmedsprak ? 'selected' : ''}"
                      data-fremmedsprak="true">
                Ja
              </button>
              <button class="sp-filter-btn ${!currentState.harFremmedsprak ? 'selected' : ''}"
                      data-fremmedsprak="false">
                Nei
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render validation section
   */
  renderValidation() {
    const validation = this.state.validate();

    return `
      <div class="sp-validering">
        <div class="sp-validering-items">
          <div class="sp-validering-item ${validation.vg1Complete ? 'met' : 'unmet'}">
            <div class="sp-validering-icon">${validation.vg1Complete ? '✓' : '!'}</div>
            <div class="sp-validering-text">VG1 fag valgt</div>
          </div>
          <div class="sp-validering-item ${validation.vg2Complete ? 'met' : 'unmet'}">
            <div class="sp-validering-icon">${validation.vg2Complete ? '✓' : '!'}</div>
            <div class="sp-validering-text">VG2 programfag</div>
          </div>
          <div class="sp-validering-item ${validation.vg3Complete ? 'met' : 'unmet'}">
            <div class="sp-validering-icon">${validation.vg3Complete ? '✓' : '!'}</div>
            <div class="sp-validering-text">VG3 programfag</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render VG grid (VG1, VG2, VG3 columns)
   */
  renderVGGrid() {
    return `
      <div class="sp-vg-grid">
        ${this.renderVG1()}
        ${this.renderVG2()}
        ${this.renderVG3()}
      </div>
    `;
  }

  /**
   * Render VG1 column
   */
  renderVG1() {
    const currentState = this.state.getState();
    const fellesfag = this.dataHandler.getFellesfag(currentState.programomrade, 'vg1');

    return `
      <div class="sp-vg-column">
        <div class="sp-vg-header">
          VG1
          <div class="sp-vg-timer">842 timer</div>
        </div>
        <div class="sp-vg-content">
          <div class="sp-fag-section">
            <div class="sp-fag-section-title">Fellesfag</div>
            ${fellesfag.map(fag => `
              <div class="sp-fag-item fellesfag">
                <div class="sp-fag-item-title">${fag.navn}</div>
                <div class="sp-fag-item-timer">${fag.timer} timer</div>
              </div>
            `).join('')}
          </div>

          <div class="sp-divider"></div>

          <div class="sp-fag-section">
            <div class="sp-fag-section-title">Velg dine fag (klikk for å velge)</div>

            ${this.renderVG1Subject('fremmedsprak', currentState.vg1.fremmedsprak)}
            ${this.renderVG1Subject('matematikk', currentState.vg1.matematikk)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render VG1 subject slot
   */
  renderVG1Subject(type, selectedSubject) {
    const labels = {
      'fremmedsprak': 'fremmedspråk',
      'matematikk': 'matematikk'
    };

    if (selectedSubject) {
      return `
        <div class="sp-fag-item selected sp-vg1-${type}-slot" data-type="${type}">
          <div class="sp-fag-item-title">${selectedSubject.navn}</div>
          <div class="sp-fag-item-timer">${selectedSubject.timer} timer</div>
        </div>
      `;
    }

    return `
      <div class="sp-fag-item empty-slot sp-vg1-${type}-slot" data-type="${type}">
        <div class="sp-fag-item-title">Klikk for å velge ${labels[type]}</div>
      </div>
    `;
  }

  /**
   * Render VG2 column
   */
  renderVG2() {
    const currentState = this.state.getState();
    const fellesfag = this.dataHandler.getFellesfag(currentState.programomrade, 'vg2');

    return `
      <div class="sp-vg-column">
        <div class="sp-vg-header">
          VG2
          <div class="sp-vg-timer">840 timer</div>
        </div>
        <div class="sp-vg-content">
          <div class="sp-fag-section">
            <div class="sp-fag-section-title">Fellesfag</div>
            ${fellesfag.map(fag => `
              <div class="sp-fag-item fellesfag">
                <div class="sp-fag-item-title">${fag.navn}</div>
                <div class="sp-fag-item-timer">${fag.timer} timer</div>
              </div>
            `).join('')}
          </div>

          <div class="sp-divider"></div>

          <div class="sp-fag-section">
            <div class="sp-fag-section-title">Matematikk</div>
            ${this.renderVG2Matematikk(currentState.vg2.matematikk)}
          </div>

          <div class="sp-divider"></div>

          ${this.renderProgramfagSlots('vg2')}
        </div>
      </div>
    `;
  }

  /**
   * Render VG2 matematikk slot (filled from blokkskjema selection)
   */
  renderVG2Matematikk(matematikk) {
    if (matematikk) {
      return `
        <div class="sp-fag-item selected">
          <div class="sp-fag-item-title">${matematikk.navn}</div>
          <div class="sp-fag-item-timer">${matematikk.timer} timer</div>
        </div>
      `;
    }

    return `
      <div class="sp-fag-item empty-slot">
        <div class="sp-fag-item-title">Velges i blokkskjema</div>
      </div>
    `;
  }

  /**
   * Render VG3 column
   */
  renderVG3() {
    const currentState = this.state.getState();
    const fellesfag = this.dataHandler.getFellesfag(currentState.programomrade, 'vg3');

    return `
      <div class="sp-vg-column">
        <div class="sp-vg-header">
          VG3
          <div class="sp-vg-timer">841 timer</div>
        </div>
        <div class="sp-vg-content">
          <div class="sp-fag-section">
            <div class="sp-fag-section-title">Fellesfag</div>
            ${fellesfag.map(fag => `
              <div class="sp-fag-item fellesfag">
                <div class="sp-fag-item-title">${fag.navn}</div>
                <div class="sp-fag-item-timer">${fag.timer} timer</div>
              </div>
            `).join('')}
          </div>

          <div class="sp-divider"></div>

          ${this.renderProgramfagSlots('vg3')}
        </div>
      </div>
    `;
  }

  /**
   * Render programfag slots for VG2/VG3
   */
  renderProgramfagSlots(trinn) {
    const currentState = this.state.getState();
    let programfag = currentState[trinn].programfag;

    // For VG3, filter out Historie (it's shown in fellesfag section)
    if (trinn === 'vg3') {
      programfag = programfag.filter(f => f.fagkode !== 'HIS1010');
    }

    // For VG2, filter out matematikk (it's shown in matematikk section)
    if (trinn === 'vg2') {
      programfag = programfag.filter(f => !f.fagkode.startsWith('MAT'));
    }

    const slots = [];
    const required = 3; // Always show 3 programfag slots

    for (let i = 0; i < required; i++) {
      if (programfag[i]) {
        slots.push(`
          <div class="sp-fag-item selected">
            <div class="sp-fag-item-title">${programfag[i].navn}</div>
            <div class="sp-fag-item-timer">${programfag[i].timer} timer</div>
          </div>
        `);
      } else {
        slots.push(`
          <div class="sp-fag-item empty-slot">
            <div class="sp-fag-item-title">Klikk for å velge programfag ${i + 1}</div>
          </div>
        `);
      }
    }

    return `
      <div class="sp-fag-section sp-programfag-gruppe" data-trinn="${trinn}">
        <div class="sp-fag-section-title">Programfag (klikk for å velge)</div>
        ${slots.join('')}
      </div>
    `;
  }

  /**
   * Render all modals
   */
  renderModals() {
    return `
      ${this.renderVG1Modal('matematikk')}
      ${this.renderVG1Modal('fremmedsprak')}
      ${this.renderBlokkskjemaModal()}
    `;
  }

  /**
   * Render VG1 modal (matematikk or fremmedspråk)
   */
  renderVG1Modal(type) {
    const titles = {
      'matematikk': 'Velg matematikk for VG1',
      'fremmedsprak': 'Velg fremmedspråk for VG1'
    };

    const subtitles = {
      'matematikk': 'Velg hvilket matematikknivå du vil ta',
      'fremmedsprak': 'Velg hvilket språk du vil lære'
    };

    const fag = type === 'matematikk'
      ? [
          { fagkode: 'MAT1019', navn: 'Matematikk 1P', timer: '140' },
          { fagkode: 'MAT1021', navn: 'Matematikk 1T', timer: '140' }
        ]
      : [
          { fagkode: 'FSP6218', navn: 'Spansk II', timer: '113' },
          { fagkode: 'FSP6221', navn: 'Fransk II', timer: '113' },
          { fagkode: 'FSP6224', navn: 'Tysk II', timer: '113' },
          { fagkode: 'FSP6241', navn: 'Mandarin II', timer: '113' }
        ];

    return `
      <div class="sp-modal sp-modal-${type}" style="display: none;">
        <div class="sp-modal-content sp-modal-vg1">
          <button class="sp-modal-close">×</button>

          <div class="sp-modal-header">
            <h2 class="sp-modal-title">${titles[type]}</h2>
            <p class="sp-modal-subtitle">${subtitles[type]}</p>
          </div>

          <div class="sp-vg1-fag-liste">
            ${fag.map(f => `
              <div class="sp-vg1-fag-item" data-fagkode="${f.fagkode}" data-timer="${f.timer}">
                <div class="sp-vg1-fag-item-title">${f.navn}</div>
                <div class="sp-vg1-fag-item-timer">${f.timer} timer</div>
              </div>
            `).join('')}
          </div>

          <div class="sp-modal-footer">
            <div class="sp-modal-info"></div>
            <div class="sp-modal-actions">
              <button class="sp-btn sp-btn-secondary">Avbryt</button>
              <button class="sp-btn sp-btn-primary" disabled>Velg fag</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render blokkskjema modal
   */
  renderBlokkskjemaModal() {
    return `
      <div class="sp-modal sp-modal-blokkskjema" style="display: none;">
        <div class="sp-modal-content">
          <button class="sp-modal-close">×</button>

          <div class="sp-modal-header">
            <h2 class="sp-modal-title">Velg programfag</h2>
            <p class="sp-modal-subtitle">Velg dine programfag</p>
          </div>

          <div class="sp-validering">
            <div class="sp-validering-items">
              <div class="sp-validering-item unmet">
                <div class="sp-validering-icon">!</div>
                <div class="sp-validering-text">Velg programfag</div>
              </div>
            </div>
          </div>

          <div class="sp-blokkskjema" id="blokkskjema-content">
            <!-- Will be populated dynamically -->
          </div>

          <div class="sp-modal-footer">
            <div class="sp-modal-info"></div>
            <div class="sp-modal-actions">
              <button class="sp-btn sp-btn-secondary">Avbryt</button>
              <button class="sp-btn sp-btn-primary" disabled>Legg til</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
