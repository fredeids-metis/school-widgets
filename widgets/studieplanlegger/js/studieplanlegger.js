/**
 * Studieplanlegger Widget - Main entry point
 */

import { DataHandler } from './data-handler.js';
import { StudieplanleggerState } from './state.js';
import { UIRenderer } from './ui-renderer.js';
import { ValidationService } from './validation-service.js';

export class Studieplanlegger {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      schoolId: 'bergen-private-gymnas',
      ...options
    };

    this.dataHandler = new DataHandler({
      ...this.options,
      useMockData: false,
      apiVersion: 'v2'
    });
    this.state = new StudieplanleggerState();
    this.validator = new ValidationService();
    this.renderer = new UIRenderer(container, this.state, this.dataHandler);

    // Track selected fag in blokkskjema modal
    this.selectedBlokkskjemaFag = [];
    this.blokkskjemaModalSetup = false;

    this.init();
  }

  /**
   * Initialize the widget
   */
  async init() {
    try {
      // Set programområde on body for CSS
      document.body.setAttribute('data-programomrade', this.state.getState().programomrade);

      // Load data and validation rules in parallel
      await Promise.all([
        this.dataHandler.loadAll(),
        this.validator.init()
      ]);

      // Render initial UI
      this.renderer.render();

      // Attach event listeners
      this.attachEventListeners();

      // Subscribe to state changes
      this.state.subscribe((state) => {
        this.onStateChange(state);
      });

      console.log('Studieplanlegger initialized');
    } catch (error) {
      console.error('Failed to initialize Studieplanlegger:', error);
      this.container.innerHTML = '<p>Feil ved lasting av studieplanlegger. Prøv igjen senere.</p>';
    }
  }

  /**
   * Attach all event listeners
   */
  attachEventListeners() {
    // Filter buttons - Programområde
    this.container.querySelectorAll('[data-programomrade]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const programomrade = e.target.dataset.programomrade;
        this.state.setProgramomrade(programomrade);
      });
    });

    // Filter buttons - Fremmedspråk
    this.container.querySelectorAll('[data-fremmedsprak]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const harFremmedsprak = e.target.dataset.fremmedsprak === 'true';
        this.state.setHarFremmedsprak(harFremmedsprak);

        // Auto-populate Spansk I+II when "NEI" is selected, clear when "JA"
        if (!harFremmedsprak) {
          this.state.setVG1Subject('fremmedsprak', {
            navn: 'Spansk I+II',
            timer: '253',
            fagkode: 'FSP6237'
          });
        } else {
          // Clear the auto-populated Spansk I+II when switching back to "JA"
          this.state.setVG1Subject('fremmedsprak', null);
        }
      });
    });

    // Fjern alle valg button
    this.container.querySelector('.sp-fjern-valg-btn')?.addEventListener('click', () => {
      this.state.clearAllSelections();
    });

    // VG1 slots - open modals
    this.container.querySelector('.sp-vg1-matematikk-slot')?.addEventListener('click', () => {
      this.openVG1Modal('matematikk');
    });

    this.container.querySelector('.sp-vg1-fremmedsprak-slot')?.addEventListener('click', () => {
      this.openVG1Modal('fremmedsprak');
    });

    // Programfag groups - open blokkskjema modal
    this.container.querySelectorAll('.sp-programfag-gruppe').forEach(gruppe => {
      gruppe.addEventListener('click', (e) => {
        const trinn = gruppe.dataset.trinn;
        this.openBlokkskjemaModal(trinn);
      });
    });

    // VG2 Matematikk section - also opens blokkskjema modal for VG2
    this.container.querySelector('.sp-vg2-matematikk-gruppe')?.addEventListener('click', () => {
      this.openBlokkskjemaModal('vg2');
    });

    // VG3 Historie section - opens blokkskjema modal for VG3
    this.container.querySelector('.sp-vg3-historie-gruppe')?.addEventListener('click', () => {
      this.openBlokkskjemaModal('vg3');
    });

    // VG1 modals
    this.setupVG1Modal('matematikk');
    this.setupVG1Modal('fremmedsprak');

    // Blokkskjema modal
    this.setupBlokkskjemaModal();
  }

  /**
   * Handle state changes
   */
  onStateChange(state) {
    // Update body attribute for CSS
    document.body.setAttribute('data-programomrade', state.programomrade);

    // Reset modal setup flag (DOM elements are replaced on re-render)
    this.blokkskjemaModalSetup = false;

    // Re-render UI
    this.renderer.render();

    // Re-attach event listeners (since we re-rendered)
    this.attachEventListeners();
  }

  /**
   * Open VG1 modal (matematikk or fremmedspråk)
   */
  openVG1Modal(type) {
    const modal = this.container.querySelector(`.sp-modal-${type}`);
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  /**
   * Close VG1 modal
   */
  closeVG1Modal(type) {
    const modal = this.container.querySelector(`.sp-modal-${type}`);
    if (modal) {
      modal.style.display = 'none';
      // Clear selection
      modal.querySelectorAll('.sp-vg1-fag-item').forEach(item => {
        item.classList.remove('selected');
      });
      // Reset button
      const btn = modal.querySelector('.sp-btn-primary');
      btn.disabled = true;
      btn.textContent = 'Velg fag';
    }
  }

  /**
   * Setup VG1 modal interactions
   */
  setupVG1Modal(type) {
    const modal = this.container.querySelector(`.sp-modal-${type}`);
    if (!modal) return;

    const closeBtn = modal.querySelector('.sp-modal-close');
    const cancelBtn = modal.querySelector('.sp-btn-secondary');
    const primaryBtn = modal.querySelector('.sp-btn-primary');
    const fagItems = modal.querySelectorAll('.sp-vg1-fag-item');

    let selectedFag = null;

    // Close modal
    closeBtn.addEventListener('click', () => this.closeVG1Modal(type));
    cancelBtn.addEventListener('click', () => this.closeVG1Modal(type));

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeVG1Modal(type);
    });

    // Fag selection
    fagItems.forEach(item => {
      item.addEventListener('click', () => {
        // Remove selection from all
        fagItems.forEach(f => f.classList.remove('selected'));

        // Select this item
        item.classList.add('selected');
        selectedFag = {
          navn: item.querySelector('.sp-vg1-fag-item-title').textContent,
          timer: item.dataset.timer,
          fagkode: item.dataset.fagkode
        };

        // Enable button
        primaryBtn.disabled = false;
        primaryBtn.textContent = `Velg ${selectedFag.navn}`;
      });
    });

    // Primary button - confirm selection
    primaryBtn.addEventListener('click', () => {
      if (selectedFag) {
        this.state.setVG1Subject(type, selectedFag);
        this.closeVG1Modal(type);
      }
    });
  }

  /**
   * Open blokkskjema modal for VG2/VG3
   */
  openBlokkskjemaModal(trinn) {
    const modal = this.container.querySelector('.sp-modal-blokkskjema');
    if (!modal) return;

    // Reset selection
    this.selectedBlokkskjemaFag = [];

    // Update modal title
    modal.querySelector('.sp-modal-title').textContent = `Velg programfag for ${trinn.toUpperCase()}`;

    // Load blokkskjema data (v2 API)
    const currentState = this.state.getState();
    const fagPerBlokk = this.dataHandler.getFagForProgramOgTrinn(currentState.programomrade, trinn);

    if (fagPerBlokk && Object.keys(fagPerBlokk).length > 0) {
      this.renderBlokkskjemaContent(fagPerBlokk);
      // Run initial validation to show selected-elsewhere hints
      this.updateBlokkValidation(modal);
    }

    // Reset button - use valgregler from dataHandler for correct count
    const primaryBtn = modal.querySelector('.sp-btn-primary');
    const valgregler = this.dataHandler.getValgreglerForTrinn(currentState.programomrade, trinn);
    // VG2: minAntallFag + 1 (for matematikk), VG3: minAntallFag only
    const required = trinn === 'vg2'
      ? (valgregler?.minAntallFag || 3) + 1
      : (valgregler?.minAntallFag || 3);
    primaryBtn.disabled = true;
    primaryBtn.textContent = `Legg til (0/${required} fag)`;

    modal.style.display = 'flex';
    modal.dataset.currentTrinn = trinn;
  }

  /**
   * Close blokkskjema modal
   */
  closeBlokkskjemaModal() {
    const modal = this.container.querySelector('.sp-modal-blokkskjema');
    if (modal) {
      modal.style.display = 'none';
      modal.querySelectorAll('.sp-blokk-fag-item').forEach(item => {
        item.classList.remove('selected');
      });
    }
  }

  /**
   * Render blokkskjema content inside modal (v2 API structure)
   */
  renderBlokkskjemaContent(fagPerBlokk) {
    const container = this.container.querySelector('#blokkskjema-content');
    if (!container) return;

    // Helper to determine fordypning level from fag id (e.g., psykologi-1, fysikk-2)
    const getFordypningLevel = (fagId) => {
      if (fagId.endsWith('-1')) return '1';
      if (fagId.endsWith('-2')) return '2';
      return null;
    };

    const blocksHTML = Object.entries(fagPerBlokk).map(([blokkId, blokk]) => `
      <div class="sp-blokk" data-blokk-id="${blokkId}">
        <div class="sp-blokk-header">${blokk.navn}</div>
        <div class="sp-blokk-fag-liste">
          ${blokk.fag.map(f => {
            const isObligatorisk = f.obligatorisk === true;
            const fordypningLevel = getFordypningLevel(f.id);
            const classes = ['sp-blokk-fag-item'];
            if (isObligatorisk) classes.push('obligatorisk');
            if (fordypningLevel) classes.push(`fordypning-${fordypningLevel}`);

            return `
            <div class="${classes.join(' ')}" data-fagkode="${f.id}" data-timer="${f.timer}"${fordypningLevel ? ` data-fordypning="${fordypningLevel}"` : ''}>
              <div class="sp-blokk-fag-row">
                <span class="sp-blokk-fag-navn">${f.title || f.id}</span>
                <span class="sp-blokk-fag-timer">${f.timer}t</span>
              </div>
              ${f.merknad ? `<div class="sp-blokk-fag-note">${f.merknad}</div>` : ''}
            </div>
          `}).join('')}
        </div>
      </div>
    `).join('');

    container.innerHTML = blocksHTML;
  }

  /**
   * Setup blokkskjema modal interactions
   */
  setupBlokkskjemaModal() {
    // Only setup once to avoid multiple event listeners
    if (this.blokkskjemaModalSetup) return;

    const modal = this.container.querySelector('.sp-modal-blokkskjema');
    if (!modal) return;

    const closeBtn = modal.querySelector('.sp-modal-close');
    const cancelBtn = modal.querySelector('.sp-btn-secondary');
    const primaryBtn = modal.querySelector('.sp-btn-primary');

    // Close modal
    closeBtn.addEventListener('click', () => this.closeBlokkskjemaModal());
    cancelBtn.addEventListener('click', () => this.closeBlokkskjemaModal());

    // Click outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeBlokkskjemaModal();
    });

    // Fag selection (delegated event listener)
    // NEW APPROACH: Allow all selections, show validation errors, disable button if invalid
    modal.addEventListener('click', (e) => {
      const fagItem = e.target.closest('.sp-blokk-fag-item');
      if (!fagItem) return;

      const blokk = fagItem.closest('.sp-blokk');
      const blokkId = blokk?.dataset.blokkId;
      const fagNavn = fagItem.querySelector('.sp-blokk-fag-navn').textContent;
      const fagTimer = fagItem.dataset.timer;
      const fagId = fagItem.dataset.fagkode;

      // If already selected, deselect
      if (fagItem.classList.contains('selected')) {
        fagItem.classList.remove('selected');
        this.selectedBlokkskjemaFag = this.selectedBlokkskjemaFag.filter(f =>
          !(f.id === fagId && f.blokkId === blokkId)
        );
      } else {
        // Check if this fag is already selected in a DIFFERENT blokk - if so, deselect it there first (swap behavior)
        const existingSelection = this.selectedBlokkskjemaFag.find(f => f.id === fagId && f.blokkId !== blokkId);
        if (existingSelection) {
          // Remove from array
          this.selectedBlokkskjemaFag = this.selectedBlokkskjemaFag.filter(f =>
            !(f.id === fagId && f.blokkId === existingSelection.blokkId)
          );
          // Remove 'selected' class from the DOM element in the other blokk
          const otherBlokk = modal.querySelector(`.sp-blokk[data-blokk-id="${existingSelection.blokkId}"]`);
          otherBlokk?.querySelector(`.sp-blokk-fag-item[data-fagkode="${fagId}"].selected`)?.classList.remove('selected');
        }

        // Deselect any other fag in same blokk (1 per blokk rule - swap)
        blokk?.querySelectorAll('.sp-blokk-fag-item.selected').forEach(item => {
          item.classList.remove('selected');
          const oldId = item.dataset.fagkode;
          this.selectedBlokkskjemaFag = this.selectedBlokkskjemaFag.filter(f =>
            !(f.id === oldId && f.blokkId === blokkId)
          );
        });

        // Select this fag
        fagItem.classList.add('selected');
        this.selectedBlokkskjemaFag.push({ navn: fagNavn, timer: fagTimer, fagkode: fagId, id: fagId, blokkId });
      }

      // Check for auto-fill opportunities
      this.checkAutoFill(modal);

      // Update validation and button state
      this.updateBlokkValidation(modal);
      this.updateModalButton(modal, primaryBtn);
    });

    // Primary button - confirm selection
    primaryBtn.addEventListener('click', () => {
      const trinn = modal.dataset.currentTrinn;
      if (trinn && this.selectedBlokkskjemaFag.length > 0) {
        // For VG2, matematikk is required
        if (trinn === 'vg2') {
          const matematikkFag = this.selectedBlokkskjemaFag.find(f =>
            f.fagkode?.startsWith('matematikk') || f.id?.startsWith('matematikk')
          );
          const programfag = this.selectedBlokkskjemaFag.filter(f =>
            !f.fagkode?.startsWith('matematikk') && !f.id?.startsWith('matematikk')
          );

          // Validate: matematikk must be selected for VG2
          if (!matematikkFag) {
            this.showModalValidationError(modal, 'Du må velge matematikk for VG2!');
            return;
          }

          this.state.setVG2Matematikk(matematikkFag);
          this.state.setProgramfag(trinn, programfag);
        } else if (trinn === 'vg3') {
          // For VG3, historie is required
          const historieFag = this.selectedBlokkskjemaFag.find(f =>
            f.fagkode === 'HIS1010' || f.id === 'historie-vg3' || f.fagkode?.includes('historie')
          );

          // Validate: historie must be selected for VG3
          if (!historieFag) {
            this.showModalValidationError(modal, 'Du må velge Historie for VG3!');
            return;
          }

          this.state.setProgramfag(trinn, this.selectedBlokkskjemaFag);
        } else {
          this.state.setProgramfag(trinn, this.selectedBlokkskjemaFag);
        }

        this.selectedBlokkskjemaFag = [];
        this.closeBlokkskjemaModal();
      }
    });

    this.blokkskjemaModalSetup = true;
  }

  /**
   * Show validation error in modal with shake animation
   */
  showModalValidationError(modal, message) {
    const content = modal.querySelector('.sp-modal-content');
    const validering = modal.querySelector('.sp-validering');

    // Update validation message
    if (validering) {
      validering.innerHTML = `
        <div class="sp-validering-items">
          <div class="sp-validering-item unmet">
            <div class="sp-validering-icon">!</div>
            <div class="sp-validering-text" style="color: #d32f2f;">${message}</div>
          </div>
        </div>
      `;
    }

    // Add shake animation
    if (content) {
      content.style.animation = 'none';
      content.offsetHeight; // Trigger reflow
      content.style.animation = 'shake 0.5s ease';

      // Add red border temporarily
      content.style.borderColor = '#d32f2f';
      setTimeout(() => {
        content.style.borderColor = '';
      }, 2000);
    }
  }

  /**
   * Update blokk validation - handles cross-blokk rules
   * Uses ValidationService for all validation logic
   */
  updateBlokkValidation(modal) {
    const currentTrinn = modal.dataset.currentTrinn;
    const currentState = this.state.getState();
    const allFagItems = modal.querySelectorAll('.sp-blokk-fag-item');
    this.blokkValidationErrors = [];

    // Clear previous validation states
    allFagItems.forEach(item => {
      item.classList.remove(
        'invalid-duplicate', 'invalid-math', 'missing-prerequisite',
        'selected-elsewhere', 'blocked', 'warning-state'
      );
      item.removeAttribute('title');
      const existingWarning = item.querySelector('.sp-prerequisite-warning');
      if (existingWarning) existingWarning.remove();
      const existingHint = item.querySelector('.sp-validation-hint');
      if (existingHint) existingHint.remove();
    });

    // Build map of selected fag per blokk
    const selectedPerBlokk = {};
    this.selectedBlokkskjemaFag.forEach(f => {
      if (!selectedPerBlokk[f.blokkId]) selectedPerBlokk[f.blokkId] = [];
      selectedPerBlokk[f.blokkId].push(f.id);
    });

    // Validate each fag item using ValidationService
    allFagItems.forEach(item => {
      const fagId = item.dataset.fagkode;
      const blokk = item.closest('.sp-blokk');
      const blokkId = blokk?.dataset.blokkId;

      if (!fagId) return;

      // Check if this fag is selected in THIS blokk
      const isSelectedHere = item.classList.contains('selected');

      // Check if selected in OTHER blokk
      const isSelectedElsewhere = this.selectedBlokkskjemaFag.some(
        f => f.id === fagId && f.blokkId !== blokkId
      );

      if (isSelectedElsewhere && !isSelectedHere) {
        item.classList.add('selected-elsewhere');
        item.title = 'Allerede valgt i annen blokk - klikk for å bytte';
        return;
      }

      // Use ValidationService for pre-selection validation
      const validation = this.validator.canSelectFag(
        fagId,
        currentState,
        currentTrinn,
        this.selectedBlokkskjemaFag
      );

      // Apply visual state based on validation
      if (validation.status === 'blocked') {
        item.classList.add('blocked');
        item.title = validation.reasons.join('\n');
        this.addValidationHint(item, '🚫', validation.reasons[0]);
      } else if (validation.status === 'warning' && isSelectedHere) {
        item.classList.add('missing-prerequisite');
        item.title = validation.reasons.join('\n');
        this.addValidationHint(item, '⚠️', validation.reasons[0]);
      }

      // Check if selected fag creates errors
      if (isSelectedHere) {
        const modalValidation = this.validator.validateModalSelection(
          this.selectedBlokkskjemaFag,
          currentState,
          currentTrinn
        );

        // Mark math conflicts
        if (modalValidation.errors.some(e => e.type === 'math-conflict')) {
          const isMathFag = fagId.includes('matematikk-');
          if (isMathFag) {
            item.classList.add('invalid-math');
          }
        }

        // Mark duplicates
        const dupError = modalValidation.errors.find(e => e.type === 'duplicate');
        if (dupError && dupError.fagIds?.includes(fagId)) {
          item.classList.add('invalid-duplicate');
        }
      }
    });

    // Collect errors from modal validation
    const modalValidation = this.validator.validateModalSelection(
      this.selectedBlokkskjemaFag,
      currentState,
      currentTrinn
    );

    modalValidation.errors.forEach(err => {
      this.blokkValidationErrors.push(err.message);
    });

    // Update validation display with fordypning status
    this.updateValidationDisplay(modal);
  }

  /**
   * Add a small validation hint to a fag item
   */
  addValidationHint(item, icon, text) {
    const fagRow = item.querySelector('.sp-blokk-fag-row');
    if (!fagRow || item.querySelector('.sp-validation-hint')) return;

    const hint = document.createElement('span');
    hint.className = 'sp-validation-hint';
    hint.innerHTML = icon;
    hint.title = text;
    hint.style.cssText = 'margin-left: 6px; cursor: help; font-size: 0.9em;';
    fagRow.appendChild(hint);
  }

  /**
   * Update validation error display in modal
   * Shows errors AND fordypning progress
   */
  updateValidationDisplay(modal) {
    let validering = modal.querySelector('.sp-validering');
    const currentState = this.state.getState();

    if (!validering) {
      // Create validation area if it doesn't exist
      const blokkContent = modal.querySelector('#blokkskjema-content');
      if (blokkContent) {
        validering = document.createElement('div');
        validering.className = 'sp-validering';
        blokkContent.parentNode.insertBefore(validering, blokkContent);
      }
    }

    if (!validering) return;

    // Get fordypning status (including current modal selections)
    const tempState = this.createTempStateWithModalSelections(currentState);
    const fordypning = this.validator.getFordypningStatus(tempState);

    // Build validation display HTML
    let html = '';

    // Fordypning progress (always show for studiespesialisering)
    if (currentState.programomrade?.includes('studiespesialisering')) {
      const progressColor = fordypning.isValid ? '#4CAF50' : (fordypning.progress > 50 ? '#ff9800' : '#d32f2f');
      html += `
        <div class="sp-fordypning-status">
          <div class="sp-fordypning-header">
            <span class="sp-fordypning-label">📊 Fordypning</span>
            <span class="sp-fordypning-progress" style="color: ${progressColor}">
              ${fordypning.totalTimer}/${fordypning.required}t
              ${fordypning.isValid ? '✓' : ''}
            </span>
          </div>
          <div class="sp-fordypning-bar">
            <div class="sp-fordypning-bar-fill" style="width: ${fordypning.progress}%; background: ${progressColor}"></div>
          </div>
          ${fordypning.fordypningAreas.length > 0 ? `
            <div class="sp-fordypning-areas">
              ${fordypning.fordypningAreas.map(area => `
                <span class="sp-fordypning-area ${area.meetsMinimum ? 'complete' : ''}">
                  ${area.name}: ${area.fagCount} fag
                </span>
              `).join('')}
            </div>
          ` : `
            <div class="sp-fordypning-hint">
              Velg 2+ fag fra samme fagområde for fordypning
            </div>
          `}
        </div>
      `;
    }

    // Validation errors
    if (this.blokkValidationErrors.length > 0) {
      html += `
        <div class="sp-validering-errors">
          <div class="sp-validering-title">⚠️ Valideringsfeil:</div>
          <div class="sp-validering-items">
            ${this.blokkValidationErrors.map(err => `
              <div class="sp-validering-item unmet">
                <div class="sp-validering-icon"></div>
                <div class="sp-validering-text">${err}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Show/hide validation area
    if (html) {
      validering.innerHTML = html;
      validering.style.display = 'block';
    } else {
      validering.style.display = 'none';
    }
  }

  /**
   * Create a temporary state object that includes current modal selections
   * Used for preview calculations (fordypning, etc.)
   */
  createTempStateWithModalSelections(currentState) {
    const currentTrinn = document.querySelector('.sp-modal-blokkskjema')?.dataset?.currentTrinn || 'vg2';

    // Deep clone state
    const tempState = JSON.parse(JSON.stringify(currentState));

    // Add modal selections to appropriate trinn
    if (currentTrinn === 'vg2') {
      tempState.vg2.programfag = [...(tempState.vg2.programfag || []), ...this.selectedBlokkskjemaFag];
    } else {
      tempState.vg3.programfag = [...(tempState.vg3.programfag || []), ...this.selectedBlokkskjemaFag];
    }

    return tempState;
  }

  /**
   * Update modal button state based on selection count and validation
   */
  updateModalButton(modal, primaryBtn) {
    const currentTrinn = modal.dataset.currentTrinn;
    const currentState = this.state.getState();
    const valgregler = this.dataHandler.getValgreglerForTrinn(currentState.programomrade, currentTrinn);

    // VG2: minAntallFag + 1 (for matematikk), VG3: minAntallFag only
    const required = currentTrinn === 'vg2'
      ? (valgregler?.minAntallFag || 3) + 1
      : (valgregler?.minAntallFag || 3);

    const count = this.selectedBlokkskjemaFag.length;
    const hasErrors = this.blokkValidationErrors && this.blokkValidationErrors.length > 0;

    // Disable if count is wrong OR if there are validation errors
    primaryBtn.disabled = count !== required || hasErrors;

    if (hasErrors) {
      primaryBtn.textContent = `Rett opp feil (${count}/${required} fag)`;
    } else {
      primaryBtn.textContent = `Legg til (${count}/${required} fag)`;
    }
  }

  /**
   * Check for auto-fill opportunities for obligatory fag
   * Auto-selects Historie (VG3) or Spansk I+II (VG2/VG3 when fremmedsprak=NEI)
   */
  checkAutoFill(modal) {
    const currentTrinn = modal.dataset.currentTrinn;
    const currentState = this.state.getState();
    const valgregler = this.dataHandler.getValgreglerForTrinn(currentState.programomrade, currentTrinn);

    // Calculate required count and remaining slots
    const required = currentTrinn === 'vg2'
      ? (valgregler?.minAntallFag || 3) + 1
      : (valgregler?.minAntallFag || 3);
    const currentCount = this.selectedBlokkskjemaFag.length;
    const remaining = required - currentCount;

    // VG3: Auto-fill Historie when 1 slot remaining
    if (currentTrinn === 'vg3' && remaining === 1) {
      const hasHistorie = this.selectedBlokkskjemaFag.some(f =>
        f.id?.includes('historie') || f.fagkode?.includes('historie')
      );

      if (!hasHistorie) {
        this.autoSelectFag(modal, 'historie');
      }
    }

    // VG2/VG3: Auto-fill Spansk I+II when fremmedsprak=NEI and 2 slots remaining
    if ((currentTrinn === 'vg2' || currentTrinn === 'vg3') &&
        currentState.harFremmedsprak === false &&
        remaining === 2) {
      const hasSpansk = this.selectedBlokkskjemaFag.some(f =>
        f.id?.includes('spansk-i-ii') || f.id?.includes('spansk-i+ii') ||
        f.fagkode?.includes('spansk-i-ii') || f.fagkode?.includes('spansk-i+ii')
      );

      if (!hasSpansk) {
        this.autoSelectFag(modal, 'spansk-i');
      }
    }
  }

  /**
   * Programmatically auto-select a fag by partial match
   */
  autoSelectFag(modal, fagPattern) {
    // Find the fag item matching the pattern
    const fagItem = modal.querySelector(`.sp-blokk-fag-item[data-fagkode*="${fagPattern}"]`);
    if (!fagItem || fagItem.classList.contains('selected')) return;

    const blokk = fagItem.closest('.sp-blokk');
    const blokkId = blokk?.dataset.blokkId;

    // Deselect other fag in same blokk first
    blokk?.querySelectorAll('.sp-blokk-fag-item.selected').forEach(item => {
      item.classList.remove('selected');
      const oldId = item.dataset.fagkode;
      this.selectedBlokkskjemaFag = this.selectedBlokkskjemaFag.filter(f =>
        !(f.id === oldId && f.blokkId === blokkId)
      );
    });

    // Select the fag
    fagItem.classList.add('selected');
    const fagNavn = fagItem.querySelector('.sp-blokk-fag-navn').textContent;
    const fagTimer = fagItem.dataset.timer;
    const fagId = fagItem.dataset.fagkode;

    this.selectedBlokkskjemaFag.push({
      navn: fagNavn,
      timer: fagTimer,
      fagkode: fagId,
      id: fagId,
      blokkId
    });
  }
}
