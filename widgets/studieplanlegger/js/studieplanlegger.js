/**
 * Studieplanlegger Widget - Main entry point
 */

import { DataHandler } from './data-handler.js';
import { StudieplanleggerState } from './state.js';
import { UIRenderer } from './ui-renderer.js';

export class Studieplanlegger {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      schoolId: 'bergen-private-gymnas',
      ...options
    };

    this.dataHandler = new DataHandler(this.options);
    this.state = new StudieplanleggerState();
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

      // Load data
      await Promise.all([
        this.dataHandler.loadBlokkskjema(this.options.schoolId),
        this.dataHandler.loadTimefordeling()
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

        // Auto-populate Spansk I+II when "NEI" is selected
        if (!harFremmedsprak) {
          this.state.setVG1Subject('fremmedsprak', {
            navn: 'Spansk I+II',
            timer: '253',
            fagkode: 'FSP6237'
          });
        }
      });
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

    // Load blokkskjema data
    const currentState = this.state.getState();
    const blokkskjema = this.dataHandler.getBlokkskjema(currentState.programomrade, trinn);

    if (blokkskjema) {
      this.renderBlokkskjemaContent(blokkskjema);
    }

    // Reset button
    const primaryBtn = modal.querySelector('.sp-btn-primary');
    const required = this.state.getRequiredProgramfagCount(trinn);
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
   * Render blokkskjema content inside modal
   */
  renderBlokkskjemaContent(blokkskjema) {
    const container = this.container.querySelector('#blokkskjema-content');
    if (!container || !blokkskjema.blocks) return;

    const blocksHTML = Object.entries(blokkskjema.blocks).map(([blockName, fag]) => `
      <div class="sp-blokk">
        <div class="sp-blokk-header">${blockName.replace('blokk_', 'Blokk ')}</div>
        <div class="sp-blokk-fag-liste">
          ${fag.map(f => `
            <div class="sp-blokk-fag-item" data-fagkode="${f.fagkode}" data-timer="${f.timer}">
              <div class="sp-blokk-fag-navn">${f.navn}</div>
              <div class="sp-blokk-fag-timer">${f.timer} timer</div>
              ${f.note ? `<div class="sp-blokk-fag-note">${f.note}</div>` : ''}
            </div>
          `).join('')}
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
    modal.addEventListener('click', (e) => {
      const fagItem = e.target.closest('.sp-blokk-fag-item');
      if (!fagItem) return;

      // Toggle selection
      fagItem.classList.toggle('selected');

      const fagNavn = fagItem.querySelector('.sp-blokk-fag-navn').textContent;
      const fagTimer = fagItem.dataset.timer;
      const fagkode = fagItem.dataset.fagkode;

      if (fagItem.classList.contains('selected')) {
        this.selectedBlokkskjemaFag.push({ navn: fagNavn, timer: fagTimer, fagkode });
      } else {
        this.selectedBlokkskjemaFag = this.selectedBlokkskjemaFag.filter(f => f.fagkode !== fagkode);
      }

      // Update button
      const required = this.state.getRequiredProgramfagCount(modal.dataset.currentTrinn);
      primaryBtn.disabled = this.selectedBlokkskjemaFag.length !== required;
      primaryBtn.textContent = `Legg til (${this.selectedBlokkskjemaFag.length}/${required} fag)`;
    });

    // Primary button - confirm selection
    primaryBtn.addEventListener('click', () => {
      const trinn = modal.dataset.currentTrinn;
      if (trinn && this.selectedBlokkskjemaFag.length > 0) {
        // For VG2, separate matematikk from programfag
        if (trinn === 'vg2') {
          const matematikkFag = this.selectedBlokkskjemaFag.find(f => f.fagkode.startsWith('MAT'));
          const programfag = this.selectedBlokkskjemaFag.filter(f => !f.fagkode.startsWith('MAT'));

          if (matematikkFag) {
            this.state.setVG2Matematikk(matematikkFag);
          }
          this.state.setProgramfag(trinn, programfag);
        } else {
          this.state.setProgramfag(trinn, this.selectedBlokkskjemaFag);
        }

        this.selectedBlokkskjemaFag = [];
        this.closeBlokkskjemaModal();
      }
    });

    this.blokkskjemaModalSetup = true;
  }
}
