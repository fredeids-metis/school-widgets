/**
 * Programfag-velger Widget
 * Interactive course selection tool for Norwegian VGS schools
 */

(function() {
  'use strict';

  const ProgramfagVelger = {
    // Configuration
    config: {
      schoolId: null,
      container: null,
      apiBase: 'https://fredeids-metis.github.io/school-data/api/v1',
      onComplete: null
    },

    // State
    state: {
      trinn: null, // 'vg2' or 'vg3'
      programomrade: null, // 'studiespesialisering', 'musikk', 'medier-og-kommunikasjon'
      harSpansk: false, // true if student has Spansk I+II
      previousSubjects: {}, // For VG3: { blokk1: 'fag-id', blokk2: 'fag-id', ... }
      selectedSubjects: {}, // { blokk1: 'fag-id', blokk2: 'fag-id', ... }
      currentStep: 1
    },

    // Loaded data
    data: {
      programfag: [],
      blokkskjema: null,
      kriterier: null,
      allProgramfag: [] // All programfag with læreplankode
    },

    /**
     * Initialize the widget
     */
    async init(config) {
      this.config = { ...this.config, ...config };

      const container = document.querySelector(this.config.container);
      if (!container) {
        console.error('Container not found:', this.config.container);
        return;
      }

      this.container = container;
      this.render({ loading: true });

      try {
        await this.loadData();
        this.render();
      } catch (error) {
        console.error('Failed to load data:', error);
        this.render({ error: error.message });
      }
    },

    /**
     * Load data from API
     */
    async loadData() {
      const baseUrl = `${this.config.apiBase}/schools/${this.config.schoolId}`;
      const curriculumUrl = `${this.config.apiBase}/curriculum/all-programfag.json`;

      const [programfagRes, blokkskjemaRes, allProgramfagRes] = await Promise.all([
        fetch(`${baseUrl}/programfag.json`),
        fetch(`${baseUrl}/blokkskjema.json`),
        fetch(curriculumUrl)
      ]);

      if (!programfagRes.ok || !blokkskjemaRes.ok || !allProgramfagRes.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const programfagData = await programfagRes.json();
      const blokkskjemaData = await blokkskjemaRes.json();
      const allProgramfagData = await allProgramfagRes.json();

      this.data.programfag = programfagData.programfag || [];

      // Normalize blokkskjema to support both v1 and v2 formats
      this.data.blokkskjema = this.normalizeBlokkskjema(blokkskjemaData);
      this.data.kriterier = this.data.blokkskjema.kriterier || {};
      this.data.allProgramfag = allProgramfagData.programfag || [];
    },

    /**
     * Normalize blokkskjema data to support both v1 and v2 formats
     * v1: Uses vg2Only/vg3Only, kriterier
     * v2: Uses trinn, valgregler, new subject IDs
     */
    normalizeBlokkskjema(data) {
      const isV2 = data.versjon && data.versjon.includes('v2');

      if (!isV2) {
        // v1 format - use as-is
        return data;
      }

      // v2 format - adapt to v1 structure for compatibility
      const normalized = { ...data };

      // Map valgregler → kriterier for v2
      if (data.valgregler && !data.kriterier) {
        normalized.kriterier = data.valgregler;
      }

      // Enrich fag with kategori from curriculum data if missing
      if (normalized.blokker) {
        Object.keys(normalized.blokker).forEach(blokkKey => {
          const blokk = normalized.blokker[blokkKey];
          if (blokk.fag) {
            blokk.fag = blokk.fag.map(fag => this.enrichFagWithKategori(fag));
          }
        });
      }

      return normalized;
    },

    /**
     * Enrich fag object with kategori field from curriculum data
     * Needed for v2 which doesn't include kategori in blokkskjema
     */
    enrichFagWithKategori(fag) {
      // If kategori already exists, return as-is
      if (fag.kategori) {
        return fag;
      }

      // Look up kategori from curriculum data
      const curriculumFag = this.data.allProgramfag?.find(f => f.id === fag.id);
      if (curriculumFag?.kategori) {
        return { ...fag, kategori: curriculumFag.kategori };
      }

      // Fallback: derive from subject ID patterns
      const kategoriMap = {
        'matematikk-': 'matematikk',
        'biologi-': 'naturfag',
        'kjemi-': 'naturfag',
        'fysikk-': 'naturfag',
        'informasjonsteknologi-': 'it',
        'okonomistyring': 'økonomi',
        'okonomi-og-ledelse': 'økonomi',
        'samfunnsokonomi-': 'økonomi',
        'markedsforing-': 'bedriftsledelse',
        'entreprenorskap-': 'bedriftsledelse',
        'sosiologi-': 'samfunnsfag',
        'politikk-': 'samfunnsfag',
        'sosialkunnskap': 'samfunnsfag',
        'rettslare-': 'samfunnsfag',
        'rettslaere-': 'samfunnsfag',
        'psykologi-': 'samfunnsfag',
        'historie-': 'samfunnsfag',
        'engelsk-': 'språk',
        'spansk-': 'språk',
        'bilde': 'kunst',
        'grafisk-design': 'kunst',
        'musikk-': 'musikk'
      };

      for (const [pattern, kategori] of Object.entries(kategoriMap)) {
        if (fag.id.startsWith(pattern) || fag.id === pattern) {
          return { ...fag, kategori };
        }
      }

      // No kategori found
      return fag;
    },

    /**
     * Normalize subject ID to support both v1 and v2 naming conventions
     * v1: 'historie', 'spansk-1-2'
     * v2: 'historie-vg3', 'spansk-i-ii-vg3'
     */
    normalizeSubjectId(fagId) {
      const mapping = {
        'historie': 'historie-vg3',
        'historie-vg3': 'historie-vg3',
        'spansk-1-2': 'spansk-i-ii-vg3',
        'spansk-i-ii-vg3': 'spansk-i-ii-vg3'
      };
      return mapping[fagId] || fagId;
    },

    /**
     * Check if subject ID is one of the variants (for flexible matching)
     */
    isSameFag(fagId1, fagId2) {
      return this.normalizeSubjectId(fagId1) === this.normalizeSubjectId(fagId2);
    },

    /**
     * Check if a fag is VG2-only (supports both v1 and v2 formats)
     */
    isVG2Only(fag) {
      // v1: uses vg2Only flag
      if (fag.vg2Only !== undefined) {
        return fag.vg2Only;
      }
      // v2: uses trinn field
      if (fag.trinn) {
        return fag.trinn === 'vg2';
      }
      return false;
    },

    /**
     * Check if a fag is VG3-only (supports both v1 and v2 formats)
     */
    isVG3Only(fag) {
      // v1: uses vg3Only flag
      if (fag.vg3Only !== undefined) {
        return fag.vg3Only;
      }
      // v2: uses trinn field
      if (fag.trinn) {
        return fag.trinn === 'vg3';
      }
      return false;
    },

    /**
     * Main render function
     */
    render(options = {}) {
      if (options.loading) {
        this.container.innerHTML = `
          <div class="programfag-velger">
            <div class="pv-loading">
              <div class="pv-spinner"></div>
              <p>Laster fagvelger...</p>
            </div>
          </div>
        `;
        return;
      }

      if (options.error) {
        this.container.innerHTML = `
          <div class="programfag-velger">
            <div class="pv-error">
              <h3>Kunne ikke laste fagvelger</h3>
              <p>${options.error}</p>
            </div>
          </div>
        `;
        return;
      }

      const html = `
        <div class="programfag-velger">
          ${this.renderSelectorHeader()}
          ${this.renderContent()}
          ${this.renderActions()}
        </div>
      `;

      this.container.innerHTML = html;
      this.attachEventListeners();
    },

    /**
     * Render compact selector header
     */
    renderSelectorHeader() {
      const programomrader = [
        { id: 'studiespesialisering', navn: 'Studiespesialisering' },
        { id: 'musikk', navn: 'Musikk' },
        { id: 'medier-og-kommunikasjon', navn: 'Medier og kommunikasjon' }
      ];

      return `
        <div class="pv-selector-header">
          <div class="pv-selector-group">
            <label>Trinn:</label>
            <div class="pv-selector-buttons">
              <button class="pv-selector-btn ${this.state.trinn === 'vg2' ? 'selected' : ''}" data-trinn="vg2">VG2</button>
              <button class="pv-selector-btn ${this.state.trinn === 'vg3' ? 'selected' : ''}" data-trinn="vg3">VG3</button>
            </div>
          </div>
          <div class="pv-selector-group">
            <label>Programområde:</label>
            <div class="pv-selector-buttons">
              ${programomrader.map(po => `
                <button class="pv-selector-btn ${this.state.programomrade === po.id ? 'selected' : ''}" data-programomrade="${po.id}">${po.navn}</button>
              `).join('')}
            </div>
          </div>
          <div class="pv-selector-group">
            <label>Spansk I+II:</label>
            <div class="pv-selector-buttons">
              <button class="pv-selector-btn ${this.state.harSpansk === true ? 'selected' : ''}" data-spansk="true">Ja</button>
              <button class="pv-selector-btn ${this.state.harSpansk === false ? 'selected' : ''}" data-spansk="false">Nei</button>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Render step navigation
     */
    renderSteps() {
      const steps = [
        { num: 1, title: 'Velg trinn' },
        { num: 2, title: 'Velg programområde' },
        { num: 3, title: 'Velg fag' },
        { num: 4, title: 'Oppsummering' }
      ];

      return `
        <div class="pv-steps">
          ${steps.map(step => {
            let className = 'pv-step';
            if (step.num === this.state.currentStep) className += ' active';
            if (step.num < this.state.currentStep) className += ' completed';

            return `
              <div class="${className}">
                <div class="pv-step-number">${step.num}</div>
                <div class="pv-step-title">${step.title}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    /**
     * Render criteria checklist
     */
    renderCriteriaChecklist(criteria) {
      if (!criteria || criteria.length === 0) return '';

      return `
        <div class="pv-criteria-checklist">
          <h4>Krav til fagvalg</h4>
          <div class="pv-criteria-grid">
            ${criteria.map(item => `
              <div class="pv-criteria-item ${item.met ? 'met' : 'unmet'}">
                <div class="pv-criteria-checkbox">
                  ${item.met ? '✓' : '⚠'}
                </div>
                <div class="pv-criteria-label">${item.label}</div>
                ${item.progress ? `<div class="pv-criteria-progress">${item.progress}</div>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    /**
     * Render content area based on selected trinn and programområde
     */
    renderContent() {
      // Show course selection if both trinn and programområde are selected
      if (this.state.trinn && this.state.programomrade) {
        const criteriaStatus = this.getCriteriaStatus();

        return `
          <div class="pv-content">
            <div class="pv-section active">
              <h2>Velg fag</h2>

              ${this.state.trinn === 'vg3' ? this.renderPreviousSubjects() : ''}

              ${this.renderCriteriaChecklist(criteriaStatus)}

              ${this.renderBlokkskjema()}
            </div>

            ${this.renderSummary()}
          </div>
        `;
      }

      // Show placeholder if selections are incomplete
      return `
        <div class="pv-content">
          <div class="pv-section active">
            <div class="pv-empty-state">
              <p>Velg trinn og programområde for å se tilgjengelige fag.</p>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Step 1: Select trinn
     */
    renderStep1() {
      const active = this.state.currentStep === 1 ? 'active' : '';
      return `
        <div class="pv-section ${active}" data-step="1">
          <h2>Hvilket trinn går du på?</h2>
          <p>Velg hvilket trinn du skal velge fag for</p>
          <div class="pv-options">
            <div class="pv-option ${this.state.trinn === 'vg2' ? 'selected' : ''}" data-trinn="vg2">
              <h3>VG2</h3>
              <p>Andre året på videregående</p>
            </div>
            <div class="pv-option ${this.state.trinn === 'vg3' ? 'selected' : ''}" data-trinn="vg3">
              <h3>VG3</h3>
              <p>Tredje året på videregående</p>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Step 2: Select programområde
     */
    renderStep2() {
      const active = this.state.currentStep === 2 ? 'active' : '';
      const programomrader = [
        { id: 'studiespesialisering', navn: 'Studiespesialisering', beskrivelse: 'Forberedelse til høyere utdanning' },
        { id: 'musikk', navn: 'Musikk', beskrivelse: 'Musikkutøvende linje' },
        { id: 'medier-og-kommunikasjon', navn: 'Medier og kommunikasjon', beskrivelse: 'Medier og kommunikasjonsfag' }
      ];

      return `
        <div class="pv-section ${active}" data-step="2">
          <h2>Hvilket programområde går du på?</h2>
          <p>Velg ditt programområde</p>
          <div class="pv-options">
            ${programomrader.map(po => `
              <div class="pv-option ${this.state.programomrade === po.id ? 'selected' : ''}" data-programomrade="${po.id}">
                <h3>${po.navn}</h3>
                <p>${po.beskrivelse}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    },

    /**
     * Step 3: Select subjects from blokkskjema
     */
    renderStep3() {
      const active = this.state.currentStep === 3 ? 'active' : '';

      if (!this.state.trinn || !this.state.programomrade) {
        return `<div class="pv-section ${active}" data-step="3"></div>`;
      }

      const validation = this.validateSelection();
      const kriterier = this.getCurrentKriterier();

      return `
        <div class="pv-section ${active}" data-step="3">
          <h2>Velg fag</h2>
          <p>${kriterier?.beskrivelse || 'Velg dine programfag'}</p>

          ${this.state.trinn === 'vg3' ? this.renderPreviousSubjects() : ''}

          <div class="pv-validation">
            ${this.renderValidationMessages(validation, kriterier)}
          </div>

          ${this.renderBlokkskjema()}
        </div>
      `;
    },

    /**
     * Render previous subjects selection (VG3 only)
     */
    renderPreviousSubjects() {
      const blokker = this.data.blokkskjema?.blokker || {};

      return `
        <div class="pv-previous-subjects">
          <h3>Hvilke fag hadde du i VG2?</h3>
          <p>Dette brukes for å validere forutsetninger (f.eks. R2 krever R1)</p>
          <div class="pv-previous-grid">
            ${Object.entries(blokker).map(([blokkId, blokk]) => {
              // Only show VG2 fag (exclude vg3Only fag)
              const vg2Fag = blokk.fag.filter(f => !this.isVG3Only(f));
              return `
                <div class="pv-previous-blokk">
                  <h4>${blokk.navn}</h4>
                  <select class="pv-previous-select" data-blokk="${blokkId}">
                    <option value="">Velg fag...</option>
                    ${vg2Fag.map(fag => {
                      const fagData = this.getFagData(fag.id);
                      const selected = this.state.previousSubjects[blokkId] === fag.id ? 'selected' : '';
                      return `<option value="${fag.id}" ${selected}>${fagData?.title || fag.id}</option>`;
                    }).join('')}
                  </select>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    },

    /**
     * Render validation messages
     */
    renderValidationMessages(validation, kriterier) {
      const hasInfo = kriterier?.infomeldinger && kriterier.infomeldinger.length > 0;
      const hasErrors = validation.errors.length > 0;

      if (!hasInfo && !hasErrors) {
        return '';
      }

      return `
        <div class="pv-validation-grid">
          ${hasInfo ? `
            <div class="pv-info-messages">
              <h4>Viktig informasjon:</h4>
              <ul>
                ${kriterier.infomeldinger.map(msg => `<li>${msg}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${hasErrors ? `
            <div class="pv-error-messages">
              <h4>Mangler:</h4>
              <ul>
                ${validation.errors.map(err => `<li>${err}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    },

    /**
     * Render blokkskjema grid
     */
    renderBlokkskjema() {
      const blokker = this.data.blokkskjema?.blokker || {};
      const availableFag = this.getAvailableFag();
      const validation = this.validateSelection();
      const invalidFagIds = validation.invalidFagIds || [];

      return `
        <div class="pv-blokkskjema">
          ${Object.entries(blokker).map(([blokkId, blokk]) => `
            <div class="pv-blokk">
              <div class="pv-blokk-header">${blokk.navn}</div>
              <div class="pv-blokk-fag">
                ${availableFag[blokkId]?.map(fag => {
                  const fagData = this.getFagData(fag.id);
                  const isSelected = this.state.selectedSubjects[blokkId] === fag.id;
                  const isDisabled = this.isFagDisabled(fag);
                  const isInvalid = isSelected && invalidFagIds.includes(fag.id);

                  let className = 'pv-fag-item';
                  if (isInvalid) className += ' invalid';
                  else if (isSelected) className += ' selected';
                  if (isDisabled) className += ' disabled';

                  return `
                    <div class="${className}" data-fag="${fag.id}" data-blokk="${blokkId}">
                      <div class="pv-fag-item-content">
                        <div class="pv-fag-item-title">${fagData?.title || fag.id}</div>
                        ${this.isVG3Only(fag) ? '<span class="pv-fag-item-badge">Kun VG3</span>' : ''}
                        ${isDisabled ? `<div style="font-size: 0.8rem; color: #666; margin-top: 0.25rem;">Krever forutsetning</div>` : ''}
                      </div>
                      <button class="pv-fag-info-btn" data-fag-info="${fag.id}" title="Se fagdetaljer" aria-label="Se detaljer for ${fagData?.title || fag.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/>
                          <text x="8" y="12" text-anchor="middle" font-size="11" font-weight="600" fill="currentColor">i</text>
                        </svg>
                      </button>
                    </div>
                  `;
                }).join('') || '<p style="padding: 1rem; color: #666;">Ingen fag tilgjengelig</p>'}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    /**
     * Render summary section
     */
    renderSummary() {
      const blokker = this.data.blokkskjema?.blokker || {};
      const hasAnySelection = Object.values(this.state.selectedSubjects).some(val => val);

      if (!hasAnySelection) {
        return '';
      }

      const validation = this.validateSelection();
      const isValid = validation.errors.length === 0;

      // Calculate fordypning for VG3 studiespesialisering
      const showFordypning = this.state.trinn === 'vg3' && this.state.programomrade === 'studiespesialisering';
      const fordypning = showFordypning ? this.calculateFordypning() : null;

      // Assign colors to fordypning groups
      const fordypningColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];
      const fagToColorMap = {};
      if (fordypning) {
        fordypning.fordypningGroups.forEach((group, index) => {
          const color = fordypningColors[index % fordypningColors.length];
          group.fag.forEach(fagId => {
            fagToColorMap[fagId] = color;
          });
        });
      }

      return `
        <div class="pv-section active pv-summary-section">
          <div class="pv-summary-header">
            <h2>Oppsummering</h2>
            ${isValid ? `<div class="pv-valid-badge-compact">✓ Gyldig fagvalg</div>` : ''}
          </div>

          <div class="pv-summary-three-col ${!isValid ? 'invalid' : ''}">
            ${showFordypning && fordypning && fordypning.fordypningGroups.length > 0 ? `
              <div class="pv-summary-col">
                <h4>Fordypning</h4>
                <div class="pv-summary-fag-list">
                  ${fordypning.fordypningGroups.map((group, index) => {
                    const color = fordypningColors[index % fordypningColors.length];
                    const vg2Fag = group.vg2.map(fagId => {
                      const fagData = this.getFagData(fagId);
                      return fagData?.title || fagId;
                    });
                    const vg3Fag = group.vg3.map(fagId => {
                      const fagData = this.getFagData(fagId);
                      return fagData?.title || fagId;
                    });
                    return `
                      <div class="pv-summary-fordypning-item" style="border-left: 3px solid ${color};">
                        <strong>${group.fagomrade}</strong>
                        ${[...vg2Fag, ...vg3Fag].map(fag => `<div class="pv-summary-fag-name">${fag}</div>`).join('')}
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            ${this.state.trinn === 'vg3' && Object.keys(this.state.previousSubjects).length > 0 ? `
              <div class="pv-summary-col">
                <h4>Fag VG2</h4>
                <div class="pv-summary-fag-list">
                  ${Object.entries(blokker).map(([blokkId, blokk]) => {
                    const previousFagId = this.state.previousSubjects[blokkId];
                    const fagData = previousFagId ? this.getFagData(previousFagId) : null;
                    if (!fagData) return '';
                    const fordypningColor = previousFagId && fagToColorMap[previousFagId] ? fagToColorMap[previousFagId] : null;
                    const styleAttr = fordypningColor ? `style="border-left: 3px solid ${fordypningColor};"` : '';

                    return `
                      <div class="pv-summary-fag-item" ${styleAttr}>
                        <span class="pv-summary-blokk-label">${blokk.navn}:</span>
                        <span class="pv-summary-fag-name">${fagData.title}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <div class="pv-summary-col">
              <h4>Fag ${this.state.trinn === 'vg3' ? 'VG3' : 'VG2'}</h4>
              <div class="pv-summary-fag-list">
                ${Object.entries(blokker).map(([blokkId, blokk]) => {
                  const selectedFagId = this.state.selectedSubjects[blokkId];
                  const fagData = selectedFagId ? this.getFagData(selectedFagId) : null;
                  if (!fagData) return '';
                  const fordypningColor = selectedFagId && fagToColorMap[selectedFagId] ? fagToColorMap[selectedFagId] : null;
                  const styleAttr = fordypningColor ? `style="border-left: 3px solid ${fordypningColor};"` : '';

                  return `
                    <div class="pv-summary-fag-item" ${styleAttr}>
                      <span class="pv-summary-blokk-label">${blokk.navn}:</span>
                      <span class="pv-summary-fag-name">${fagData.title}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    /**
     * Render action buttons
     */
    renderActions() {
      if (!this.state.trinn || !this.state.programomrade) {
        return '';
      }

      const validation = this.validateSelection();
      const isValid = validation.errors.length === 0;

      return `
        <div class="pv-actions">
          <button class="pv-btn pv-btn-primary" id="pv-btn-submit" ${!isValid ? 'disabled' : ''}>
            Fullfør fagvalg
          </button>
        </div>
      `;
    },

    /**
     * Attach event listeners
     */
    attachEventListeners() {
      // Trinn selection
      this.container.querySelectorAll('[data-trinn]').forEach(el => {
        el.addEventListener('click', (e) => {
          this.state.trinn = e.currentTarget.dataset.trinn;
          this.state.selectedSubjects = {};
          this.state.previousSubjects = {};
          this.render();
        });
      });

      // Programområde selection
      this.container.querySelectorAll('[data-programomrade]').forEach(el => {
        el.addEventListener('click', (e) => {
          this.state.programomrade = e.currentTarget.dataset.programomrade;
          this.state.selectedSubjects = {};
          this.render();
        });
      });

      // Spansk I+II selection
      this.container.querySelectorAll('[data-spansk]').forEach(el => {
        el.addEventListener('click', (e) => {
          const value = e.currentTarget.dataset.spansk;
          this.state.harSpansk = value === 'true';
          // If changing from Ja to Nei, remove spansk from selectedSubjects if present
          if (!this.state.harSpansk) {
            Object.keys(this.state.selectedSubjects).forEach(blokkId => {
              const fagId = this.state.selectedSubjects[blokkId];
              if (this.isSameFag(fagId, 'spansk-1-2') || this.isSameFag(fagId, 'spansk-i-ii-vg3')) {
                delete this.state.selectedSubjects[blokkId];
              }
            });
          }
          this.render();
        });
      });

      // Previous subjects (VG3)
      this.container.querySelectorAll('.pv-previous-select').forEach(el => {
        el.addEventListener('change', (e) => {
          const blokkId = e.target.dataset.blokk;
          const fagId = e.target.value;
          if (fagId) {
            this.state.previousSubjects[blokkId] = fagId;
          } else {
            delete this.state.previousSubjects[blokkId];
          }
          this.render();
        });
      });

      // Fag selection
      this.container.querySelectorAll('.pv-fag-item:not(.disabled)').forEach(el => {
        el.addEventListener('click', (e) => {
          const fagId = e.currentTarget.dataset.fag;
          const blokkId = e.currentTarget.dataset.blokk;

          if (this.state.selectedSubjects[blokkId] === fagId) {
            delete this.state.selectedSubjects[blokkId];
          } else {
            this.state.selectedSubjects[blokkId] = fagId;
          }

          this.render();
        });
      });

      // Fag info buttons
      this.container.querySelectorAll('.pv-fag-info-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent fag selection when clicking info button
          const fagId = e.currentTarget.dataset.fagInfo;
          if (fagId) {
            this.showFagDetails(fagId);
          }
        });
      });

      // Submit button
      const btnSubmit = this.container.querySelector('#pv-btn-submit');
      if (btnSubmit) {
        btnSubmit.addEventListener('click', () => {
          this.complete();
        });
      }
    },

    /**
     * Get available fag for current trinn
     */
    getAvailableFag() {
      const blokker = this.data.blokkskjema?.blokker || {};
      const available = {};

      Object.entries(blokker).forEach(([blokkId, blokk]) => {
        available[blokkId] = blokk.fag.filter(fag => {
          // For VG2, exclude VG3-only fag
          if (this.state.trinn === 'vg2' && this.isVG3Only(fag)) {
            return false;
          }
          // For VG3, exclude VG2-only fag
          if (this.state.trinn === 'vg3' && this.isVG2Only(fag)) {
            return false;
          }
          return true;
        });
      });

      return available;
    },

    /**
     * Check if a fag is disabled (prerequisites not met or already taken in VG2)
     */
    isFagDisabled(fag) {
      if (this.state.trinn !== 'vg3') return false;

      // Check if subject was already taken in VG2
      const previousSubjectIds = Object.values(this.state.previousSubjects);
      if (previousSubjectIds.includes(fag.id)) {
        return true; // Cannot take same subject twice
      }

      // Check prerequisites
      const forutsetninger = this.data.blokkskjema?.regler?.forutsetninger || [];
      const fagForus = forutsetninger.find(f => f.fag === fag.id);

      if (!fagForus) return false;

      // Check if any required subject is in previous subjects
      return !fagForus.krever.some(required =>
        previousSubjectIds.includes(required)
      );
    },

    /**
     * Get current kriterier based on state
     */
    getCurrentKriterier() {
      if (!this.state.programomrade || !this.state.trinn) return null;
      return this.data.kriterier?.[this.state.programomrade]?.[this.state.trinn];
    },

    /**
     * Get detailed criteria status (for checklist display)
     */
    getCriteriaStatus() {
      const criteria = [];
      const kriterier = this.getCurrentKriterier();

      if (!kriterier) return criteria;

      const selectedCount = Object.keys(this.state.selectedSubjects).length;
      const selectedFagIds = Object.values(this.state.selectedSubjects);

      // 1. Antall fag + Obligatoriske blokker (kombinert hvis det matcher)
      const obligatoriskeBlokkCount = kriterier.obligatoriskeBolker?.length || 0;
      const antallBlokkerOppfylt = Object.keys(this.state.selectedSubjects).length;

      // Hvis antall obligatoriske blokker matcher antall fag, vis bare ett kombinert krav
      if (obligatoriskeBlokkCount > 0 &&
          kriterier.minAntallFag === kriterier.maxAntallFag &&
          kriterier.maxAntallFag === obligatoriskeBlokkCount) {
        criteria.push({
          id: 'antall-fag-blokker',
          label: `Velg ${kriterier.maxAntallFag} fag, 1 fra hver blokk`,
          met: selectedCount >= kriterier.minAntallFag && selectedCount <= kriterier.maxAntallFag && antallBlokkerOppfylt === obligatoriskeBlokkCount,
          progress: `${selectedCount}/${kriterier.maxAntallFag}`
        });
      } else {
        // Ellers, vis separate krav
        criteria.push({
          id: 'antall-fag',
          label: `Velg ${kriterier.minAntallFag === kriterier.maxAntallFag ? 'nøyaktig' : 'mellom'} ${kriterier.minAntallFag}${kriterier.minAntallFag !== kriterier.maxAntallFag ? '-' + kriterier.maxAntallFag : ''} fag`,
          met: selectedCount >= kriterier.minAntallFag && selectedCount <= kriterier.maxAntallFag,
          progress: `${selectedCount}/${kriterier.maxAntallFag}`
        });

        // Obligatoriske blokker
        if (kriterier.obligatoriskeBolker && kriterier.obligatoriskeBolker.length > 0) {
          kriterier.obligatoriskeBolker.forEach(blokkId => {
            const blokkNavn = this.data.blokkskjema?.blokker[blokkId]?.navn || blokkId;
            const isSelected = !!this.state.selectedSubjects[blokkId];
            criteria.push({
              id: `blokk-${blokkId}`,
              label: `Velg fag fra ${blokkNavn}`,
              met: isSelected
            });
          });
        }
      }

      // 3. Kategorikrav (f.eks. matematikk)
      if (kriterier.kategorikrav) {
        kriterier.kategorikrav.forEach(krav => {
          const selectedInKategori = selectedFagIds.filter(fagId => {
            const fag = this.getFagById(fagId);
            return fag?.kategori === krav.kategori;
          }).length;

          criteria.push({
            id: `kategori-${krav.kategori}`,
            label: krav.beskrivelse || `Minst ${krav.antall} ${krav.kategori}-fag`,
            met: selectedInKategori >= krav.antall,
            progress: `${selectedInKategori}/${krav.antall}`
          });
        });
      }

      // 4. Obligatoriske fag
      if (kriterier.fagkrav) {
        kriterier.fagkrav.forEach(krav => {
          if (krav.type === 'obligatorisk') {
            const isSelected = selectedFagIds.includes(krav.fag);
            const fagData = this.getFagData(krav.fag);
            criteria.push({
              id: `fag-${krav.fag}`,
              label: krav.beskrivelse || `Velg ${fagData?.title || krav.fag}`,
              met: isSelected
            });
          } else if (krav.type === 'obligatorisk-betinget') {
            // Only apply this requirement if the betingelse is met
            if (krav.betingelse === 'harSpansk' && this.state.harSpansk) {
              const isSelected = selectedFagIds.includes(krav.fag);
              criteria.push({
                id: `fag-betinget-${krav.fag}`,
                label: krav.beskrivelse || `Velg ${krav.fag}`,
                met: isSelected
              });
            }
          }
        });
      }

      // 5. Ingen duplikater
      const uniqueFagIds = new Set(selectedFagIds);
      const hasDuplicates = selectedFagIds.length !== uniqueFagIds.size;
      if (selectedFagIds.length > 0) {
        criteria.push({
          id: 'no-duplicates',
          label: 'Ingen duplikate fag',
          met: !hasDuplicates
        });
      }

      // 6. Eksklusjoner (f.eks. ikke både 2P og R-matte)
      // Vis kun når eksklusjonen er brutt (mer enn 1 fag fra gruppen er valgt)
      const eksklusjoner = this.data.blokkskjema?.regler?.eksklusjoner || [];
      eksklusjoner.forEach((eks, idx) => {
        const selectedInGruppe = selectedFagIds.filter(fagId =>
          eks.gruppe.includes(fagId)
        );

        // Kun vis denne eksklusjonen hvis den er brutt
        if (selectedInGruppe.length > 1) {
          criteria.push({
            id: `exclusion-${idx}`,
            label: eks.beskrivelse || 'Eksklusjonskrav',
            met: false  // Alltid false når vi viser den (fordi den er brutt)
          });
        }
      });

      // 7. Fordypning (VG3 studiespesialisering)
      if (this.state.trinn === 'vg3' && this.state.programomrade === 'studiespesialisering') {
        const fordypning = this.calculateFordypning();
        criteria.push({
          id: 'fordypning',
          label: 'Fordypning (minst 4 fag fra samme fagområde)',
          met: fordypning.isValid,
          progress: fordypning.isValid ? '✓' : `${fordypning.totalFagInFordypning}/4`
        });
      }

      return criteria;
    },

    /**
     * Validate current selection
     */
    validateSelection() {
      const errors = [];
      const invalidFagIds = new Set(); // Track which fag are invalid
      const kriterier = this.getCurrentKriterier();

      if (!kriterier) return { valid: false, errors, invalidFagIds: [] };

      const selectedCount = Object.keys(this.state.selectedSubjects).length;

      // Check min/max count
      if (selectedCount < kriterier.minAntallFag) {
        errors.push(`Du må velge minst ${kriterier.minAntallFag} fag (valgt ${selectedCount})`);
      }
      if (selectedCount > kriterier.maxAntallFag) {
        errors.push(`Du kan ikke velge mer enn ${kriterier.maxAntallFag} fag (valgt ${selectedCount})`);
      }

      // Check obligatoriske blokker
      if (kriterier.obligatoriskeBolker) {
        kriterier.obligatoriskeBolker.forEach(blokkId => {
          if (!this.state.selectedSubjects[blokkId]) {
            const blokkNavn = this.data.blokkskjema?.blokker[blokkId]?.navn || blokkId;
            errors.push(`Du må velge et fag fra ${blokkNavn}`);
          }
        });
      }

      // Check kategorikrav
      if (kriterier.kategorikrav) {
        kriterier.kategorikrav.forEach(krav => {
          const selectedInKategori = Object.values(this.state.selectedSubjects).filter(fagId => {
            const fag = this.getFagById(fagId);
            return fag?.kategori === krav.kategori;
          }).length;

          if (krav.type === 'minimum' && selectedInKategori < krav.antall) {
            errors.push(krav.feilmelding);
          }
        });
      }

      // Check fagkrav (obligatoriske fag)
      if (kriterier.fagkrav) {
        kriterier.fagkrav.forEach(krav => {
          if (krav.type === 'obligatorisk') {
            const selectedFagIds = Object.values(this.state.selectedSubjects);
            if (!selectedFagIds.includes(krav.fag)) {
              errors.push(krav.feilmelding);
            }
          }
        });
      }

      // Check for duplicate subjects across blocks (current year)
      const selectedFagIds = Object.values(this.state.selectedSubjects);
      const uniqueFagIds = new Set(selectedFagIds);
      if (selectedFagIds.length !== uniqueFagIds.size) {
        // Find which fag is duplicated
        const duplicates = selectedFagIds.filter((fagId, index) =>
          selectedFagIds.indexOf(fagId) !== index
        );
        const uniqueDuplicates = [...new Set(duplicates)];
        uniqueDuplicates.forEach(fagId => {
          const fagData = this.getFagData(fagId);
          errors.push(`Du kan ikke velge ${fagData?.title || fagId} flere ganger`);
          invalidFagIds.add(fagId); // Mark as invalid
        });
      }

      // Check for duplicate subjects in previous year (VG2 for VG3 students)
      if (this.state.trinn === 'vg3') {
        const previousFagIds = Object.values(this.state.previousSubjects);
        const uniquePreviousFagIds = new Set(previousFagIds);
        if (previousFagIds.length !== uniquePreviousFagIds.size) {
          // Find which fag is duplicated
          const duplicates = previousFagIds.filter((fagId, index) =>
            previousFagIds.indexOf(fagId) !== index
          );
          const uniqueDuplicates = [...new Set(duplicates)];
          uniqueDuplicates.forEach(fagId => {
            const fagData = this.getFagData(fagId);
            errors.push(`Du kan ikke ha hatt ${fagData?.title || fagId} flere ganger i VG2`);
          });
        }
      }

      // Check eksklusjoner
      const eksklusjoner = this.data.blokkskjema?.regler?.eksklusjoner || [];
      eksklusjoner.forEach(eks => {
        const selectedInGruppe = Object.values(this.state.selectedSubjects).filter(fagId =>
          eks.gruppe.includes(fagId)
        );
        if (selectedInGruppe.length > 1) {
          errors.push(eks.feilmelding);
          // Mark all fag in the exclusion group as invalid
          selectedInGruppe.forEach(fagId => invalidFagIds.add(fagId));
        }
      });

      // Check fordypning (only for VG3 studiespesialisering)
      if (this.state.trinn === 'vg3' && this.state.programomrade === 'studiespesialisering') {
        const fordypning = this.calculateFordypning();
        if (!fordypning.isValid) {
          const needsMore = fordypning.needsMoreFag;
          errors.push(`Fordypningskrav: Du må ha minst 4 fag som del av en fordypning (mangler ${needsMore} fag). Velg 2+2 fag fra samme fagområde.`);
        }
      }

      return { valid: errors.length === 0, errors, invalidFagIds: Array.from(invalidFagIds) };
    },

    /**
     * Check if can go to next step
     */
    canGoToNextStep() {
      switch (this.state.currentStep) {
        case 1:
          return this.state.trinn !== null;
        case 2:
          return this.state.programomrade !== null;
        case 3:
          return this.validateSelection().valid;
        case 4:
          return true;
        default:
          return false;
      }
    },

    /**
     * Get fag data by ID
     */
    getFagData(fagId) {
      return this.data.programfag.find(f => f.id === fagId);
    },

    /**
     * Get fag with blokkskjema metadata by ID
     */
    getFagById(fagId) {
      const blokker = this.data.blokkskjema?.blokker || {};
      for (const blokk of Object.values(blokker)) {
        const fag = blokk.fag.find(f => f.id === fagId);
        if (fag) return fag;
      }
      return null;
    },

    /**
     * Get programområde display name
     */
    getProgramomradeNavn() {
      const map = {
        'studiespesialisering': 'Studiespesialisering',
        'musikk': 'Musikk',
        'medier-og-kommunikasjon': 'Medier og kommunikasjon'
      };
      return map[this.state.programomrade] || this.state.programomrade;
    },

    /**
     * Get læreplankode for a fag
     */
    getLareplanKode(fagId) {
      const fag = this.data.allProgramfag.find(f => f.id === fagId);
      return fag?.lareplan || null;
    },

    /**
     * Get fagområde (first 3 letters of læreplankode)
     */
    getFagomrade(fagId) {
      const lareplan = this.getLareplanKode(fagId);
      if (!lareplan) return null;
      // Extract first 3 letters (remove hyphens and numbers)
      const match = lareplan.match(/^([A-Z]{3})/i);
      return match ? match[1].toUpperCase() : null;
    },

    /**
     * Calculate fordypning analysis
     * Returns object with fordypning groups and validation status
     */
    calculateFordypning() {
      // Include both VG2 (previous) and VG3 (current) subjects
      const vg2FagIds = Object.values(this.state.previousSubjects).filter(Boolean);
      const vg3FagIds = Object.values(this.state.selectedSubjects).filter(Boolean);
      const allFagIds = [...vg2FagIds, ...vg3FagIds];

      // Remove duplicates - same fag should not count twice
      const uniqueFagIds = [...new Set(allFagIds)];

      // Group fag by fagområde
      const fagomradeGroups = {};
      uniqueFagIds.forEach(fagId => {
        const fagomrade = this.getFagomrade(fagId);
        // Exclude historie and spansk from fordypning calculation
        if (fagomrade && fagomrade !== 'HIS' && !this.isSameFag(fagId, 'spansk-1-2') && !this.isSameFag(fagId, 'spansk-i-ii-vg3')) {
          if (!fagomradeGroups[fagomrade]) {
            fagomradeGroups[fagomrade] = [];
          }
          fagomradeGroups[fagomrade].push(fagId);
        }
      });

      // Find groups with 2 or more fag (valid fordypning)
      const fordypningGroups = Object.entries(fagomradeGroups)
        .filter(([_, fag]) => fag.length >= 2)
        .map(([fagomrade, fag]) => ({ fagomrade, fag, vg2: [], vg3: [] }));

      // Separate VG2 and VG3 fag in each group
      fordypningGroups.forEach(group => {
        group.fag.forEach(fagId => {
          if (vg2FagIds.includes(fagId)) {
            group.vg2.push(fagId);
          } else {
            group.vg3.push(fagId);
          }
        });
      });

      // Count total fag in fordypning
      const totalFagInFordypning = fordypningGroups.reduce((sum, group) => sum + group.fag.length, 0);

      // Valid if at least 4 fag are in fordypning (2+2 minimum)
      const isValid = totalFagInFordypning >= 4;

      return {
        fagomradeGroups,
        fordypningGroups,
        totalFagInFordypning,
        isValid,
        needsMoreFag: isValid ? 0 : (4 - totalFagInFordypning)
      };
    },

    /**
     * Show fag details in modal
     * @param {string} fagId - Subject ID
     */
    showFagDetails(fagId) {
      const apiUrl = `${this.config.apiBase}/schools/${this.config.schoolId}/programfag.json`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          const fag = data.programfag.find(f => f.id === fagId);
          if (fag) {
            this.renderFagModal(fag);
          } else {
            console.error('Fag not found:', fagId);
          }
        })
        .catch(error => {
          console.error('Error loading fag details:', error);
        });
    },

    /**
     * Render fag details modal
     * @param {Object} fag - Subject data
     */
    renderFagModal(fag) {
      let modal = document.getElementById('programfag-modal');

      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'programfag-modal';
        modal.className = 'programfag-modal';
        document.body.appendChild(modal);
      }

      // Image if available
      const bildeHTML = fag.bilde
        ? `<div class="fag-bilde">
            <img src="${fag.bilde}" alt="${fag.title}" />
          </div>`
        : '';

      // Vimeo video if available
      const vimeoHTML = fag.vimeo
        ? `<div class="vimeo-container">
            <iframe
              src="https://player.vimeo.com/video/${this.extractVimeoId(fag.vimeo)}"
              frameborder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>`
        : '';

      // Related subjects (fordypning)
      const relatedHTML = fag.related && fag.related.length > 0
        ? `<p class="related-info">Fordypning oppnås i lag med: <span class="related-badge-large">${fag.related.join(', ')}</span></p>`
        : '';

      modal.innerHTML = `
        <div class="modal-content">
          <button class="modal-close" onclick="ProgramfagVelger.closeFagModal()">&times;</button>
          <h2>${fag.title}</h2>
          <p class="fagkode-large">${fag.fagkode}</p>
          ${relatedHTML}

          ${bildeHTML}
          ${vimeoHTML}

          <div class="modal-body">
            <div class="om-faget"></div>
          </div>

          <a href="https://sokeresultat.udir.no/finn-lareplan.html?query=${fag.fagkode}&source=Laereplan&fltypefiltermulti=L%C3%A6replan&filtervalues=all" target="_blank" class="btn-lareplan">Se full læreplan på udir.no →</a>
        </div>
      `;

      // Insert HTML content separately to avoid escaping
      const beskrivelseDiv = modal.querySelector('.om-faget');
      if (beskrivelseDiv) {
        beskrivelseDiv.innerHTML = fag.beskrivelseHTML || fag.beskrivelse || '';
      }

      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Convert competency goals to accordion
      this.makeCompetencyAccordion(modal);

      // Close on backdrop click
      modal.onclick = (e) => {
        if (e.target === modal) {
          this.closeFagModal();
        }
      };
    },

    /**
     * Extract Vimeo ID from URL
     * @param {string} vimeoUrl - Vimeo URL
     * @returns {string} - Vimeo video ID
     */
    extractVimeoId(vimeoUrl) {
      const match = vimeoUrl.match(/vimeo\.com\/(\d+)/);
      return match ? match[1] : '';
    },

    /**
     * Convert competency goals section to accordion
     * @param {HTMLElement} modal - Modal element
     */
    makeCompetencyAccordion(modal) {
      const modalBody = modal.querySelector('.modal-body');
      if (!modalBody) return;

      // Find all h2 headers in the content (matching katalog logic)
      const headers = modalBody.querySelectorAll('h2');

      headers.forEach(header => {
        const headerText = header.textContent.trim();

        // Check if this is "Kompetansemål" (exact match)
        if (headerText === 'Kompetansemål') {
          // Get the next sibling (should be <ul>)
          const list = header.nextElementSibling;

          if (list && list.tagName === 'UL') {
            const itemCount = list.querySelectorAll('li').length;

            // Create accordion wrapper
            const accordion = document.createElement('div');
            accordion.className = 'accordion';

            // Create accordion header
            const accordionHeader = document.createElement('div');
            accordionHeader.className = 'accordion-header';
            accordionHeader.innerHTML = `
              <h3>I dette faget lærer du å ... <span class="accordion-count">(${itemCount})</span></h3>
              <span class="accordion-icon">▼</span>
            `;
            accordionHeader.onclick = () => {
              accordion.classList.toggle('open');
            };

            // Create accordion content
            const accordionContent = document.createElement('div');
            accordionContent.className = 'accordion-content';
            accordionContent.appendChild(list.cloneNode(true));

            // Build accordion
            accordion.appendChild(accordionHeader);
            accordion.appendChild(accordionContent);

            // Replace h2 and ul with accordion
            header.parentNode.insertBefore(accordion, header);
            header.remove();
            list.remove();
          }
        }
      });
    },

    /**
     * Close fag modal
     */
    closeFagModal() {
      const modal = document.getElementById('programfag-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    },

    /**
     * Complete selection
     */
    complete() {
      const result = {
        trinn: this.state.trinn,
        programomrade: this.state.programomrade,
        previousSubjects: this.state.previousSubjects,
        selectedSubjects: this.state.selectedSubjects,
        validation: this.validateSelection()
      };

      console.log('Fagvalg fullført:', result);

      if (this.config.onComplete) {
        this.config.onComplete(result);
      } else {
        alert('Fagvalg fullført! Se console for detaljer.');
      }
    }
  };

  // Expose to global scope
  window.ProgramfagVelger = ProgramfagVelger;
})();
