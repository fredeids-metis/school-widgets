/**
 * Programfag Catalog Widget
 * Multi-school embeddable widget for displaying programfag
 *
 * Usage:
 *   ProgramfagCatalog.init({
 *     schoolId: 'bergen-private-gymnas',
 *     container: '#programfag-catalog'
 *   });
 */

const ProgramfagCatalog = {
  config: {
    apiBaseUrl: 'https://fredeids-metis.github.io/school-data/api/v1',
    schoolId: null,
    container: null
  },

  /**
   * Initialize the catalog
   * @param {Object} options - Configuration options
   * @param {string} options.schoolId - School identifier (required)
   * @param {string} options.container - CSS selector for container (required)
   * @param {string} [options.apiBaseUrl] - Override API base URL (optional)
   */
  init: function(options) {
    // Validate required options
    if (!options.schoolId) {
      console.error('ProgramfagCatalog: schoolId is required');
      return;
    }
    if (!options.container) {
      console.error('ProgramfagCatalog: container is required');
      return;
    }

    // Set configuration
    this.config.schoolId = options.schoolId;
    this.config.container = document.querySelector(options.container);

    if (options.apiBaseUrl) {
      this.config.apiBaseUrl = options.apiBaseUrl;
    }

    if (!this.config.container) {
      console.error('ProgramfagCatalog: Container not found');
      return;
    }

    this.loadData();
  },

  /**
   * Load data from API
   */
  loadData: function() {
    const container = this.config.container;
    container.innerHTML = '<p class="loading">Laster programfag...</p>';

    const apiUrl = `${this.config.apiBaseUrl}/schools/${this.config.schoolId}/programfag.json`;
    console.log('Loading from:', apiUrl);

    fetch(apiUrl)
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Data loaded:', data);
        // New API structure has data.programfag (not data.fag)
        this.renderCatalog(data.programfag || []);
      })
      .catch(error => {
        console.error('Load error:', error);
        console.error('API URL:', apiUrl);
        container.innerHTML = `<p class="error">Kunne ikke laste programfag. Prøv igjen senere.<br><small>Feil: ${error.message}</small></p>`;
      });
  },

  /**
   * Render the catalog
   * @param {Array} programfag - List of programfag
   */
  renderCatalog: function(programfag) {
    const container = this.config.container;

    const html = `
      <div class="programfag-header">
        <h2>Programfag (${programfag.length})</h2>
        <input
          type="text"
          id="programfag-search"
          class="programfag-search"
          placeholder="Søk etter fag..."
        >
      </div>
      <div class="programfag-grid" id="programfag-grid">
        ${programfag.map(f => this.createCard(f)).join('')}
      </div>
    `;

    container.innerHTML = html;
    this.setupSearch(programfag);
  },

  /**
   * Create card for one subject
   * @param {Object} fag - Subject data
   * @returns {string} HTML for card
   */
  createCard: function(fag) {
    // Use omFaget (plain text) for card preview to avoid markdown rendering
    const omFaget = fag.omFaget || '';
    const preview = omFaget.substring(0, 150) + (omFaget.length > 150 ? '...' : '');

    return `
      <div class="programfag-card"
           data-fagkode="${fag.fagkode}"
           data-title="${fag.title.toLowerCase()}"
           data-beskrivelse="${omFaget.toLowerCase()}"
           data-fagid="${fag.id}"
           tabindex="0"
           role="article"
           aria-label="${fag.title} - ${fag.fagkode}">
        <div class="card-header">
          <h3>${fag.title}</h3>
          <span class="fagkode">${fag.fagkode}</span>
        </div>
        <div class="card-body">
          <p>${preview || 'Ingen beskrivelse tilgjengelig'}</p>
          <button
            class="btn-details"
            onclick="ProgramfagCatalog.showDetails('${fag.id}')"
          >
            Les mer →
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Setup search functionality
   * @param {Array} programfag - List of all programfag
   */
  setupSearch: function(programfag) {
    const searchInput = document.getElementById('programfag-search');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.programfag-card');
      const grid = document.getElementById('programfag-grid');
      let visibleCount = 0;

      cards.forEach(card => {
        const title = card.dataset.title;
        const fagkode = card.dataset.fagkode.toLowerCase();
        const beskrivelse = card.dataset.beskrivelse;

        if (title.includes(query) || fagkode.includes(query) || beskrivelse.includes(query)) {
          card.style.display = 'block';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Show "no results" message
      let noResultsMsg = document.getElementById('no-results-message');

      if (visibleCount === 0 && query.length > 0) {
        if (!noResultsMsg) {
          noResultsMsg = document.createElement('div');
          noResultsMsg.id = 'no-results-message';
          noResultsMsg.className = 'no-results';
          noResultsMsg.innerHTML = `
            <p>Ingen fag matcher søket "<strong>${e.target.value}</strong>"</p>
            <p style="font-size: 0.9rem; color: #999; margin-top: 10px;">Prøv et annet søkeord eller fagkode</p>
          `;
          grid.parentNode.insertBefore(noResultsMsg, grid.nextSibling);
        } else {
          noResultsMsg.innerHTML = `
            <p>Ingen fag matcher søket "<strong>${e.target.value}</strong>"</p>
            <p style="font-size: 0.9rem; color: #999; margin-top: 10px;">Prøv et annet søkeord eller fagkode</p>
          `;
        }
      } else if (noResultsMsg) {
        noResultsMsg.remove();
      }
    });
  },

  /**
   * Show details for one subject
   * @param {string} fagId - Subject ID
   */
  showDetails: function(fagId) {
    const apiUrl = `${this.config.apiBaseUrl}/schools/${this.config.schoolId}/programfag.json`;

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        const fag = data.programfag.find(f => f.id === fagId);
        if (fag) {
          this.renderDetails(fag);
        }
      })
      .catch(error => {
        console.error('Error loading details:', error);
      });
  },

  /**
   * Render detailed subject info in modal
   * @param {Object} fag - Subject data
   */
  renderDetails: function(fag) {
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
        <button class="modal-close" onclick="ProgramfagCatalog.closeModal()">&times;</button>
        <h2>${fag.title}</h2>
        <p class="fagkode-large">${fag.fagkode}</p>
        ${relatedHTML}

        ${bildeHTML}
        ${vimeoHTML}

        <div class="modal-body">
          <div class="beskrivelse"></div>
        </div>

        <a href="https://sokeresultat.udir.no/finn-lareplan.html?query=${fag.fagkode}&source=Laereplan&fltypefiltermulti=L%C3%A6replan&filtervalues=all" target="_blank" class="btn-lareplan">Se full læreplan på udir.no →</a>
      </div>
    `;

    // Insert HTML content separately to avoid escaping
    const beskrivelseDiv = modal.querySelector('.beskrivelse');
    if (beskrivelseDiv) {
      beskrivelseDiv.innerHTML = fag.beskrivelseHTML || fag.beskrivelse || '';
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Convert competency goals to accordion
    this.makeCompetencyAccordion(modal);

    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    };
  },

  /**
   * Convert competency goals section to accordion
   * @param {HTMLElement} modal - Modal element
   */
  makeCompetencyAccordion: function(modal) {
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;

    // Find all h2 headers in the content
    const headers = modalBody.querySelectorAll('h2');

    headers.forEach(header => {
      const headerText = header.textContent.trim();

      // Check if this is "Kompetansemål"
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
          accordionHeader.onclick = () => this.toggleAccordion(accordionHeader);

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
   * Toggle accordion open/closed
   * @param {HTMLElement} header - Accordion header element
   */
  toggleAccordion: function(header) {
    const accordion = header.parentElement;
    const icon = header.querySelector('.accordion-icon');

    accordion.classList.toggle('open');

    if (accordion.classList.contains('open')) {
      icon.textContent = '▲';
    } else {
      icon.textContent = '▼';
    }
  },

  /**
   * Close modal
   */
  closeModal: function() {
    const modal = document.getElementById('programfag-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  },

  /**
   * Extract Vimeo ID from URL
   * @param {string} url - Vimeo URL
   * @returns {string} Vimeo ID
   */
  extractVimeoId: function(url) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
  }
};

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ProgramfagCatalog.closeModal();
  }

  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('programfag-card')) {
    e.preventDefault();
    const fagId = e.target.dataset.fagid;
    if (fagId) {
      ProgramfagCatalog.showDetails(fagId);
    }
  }
});
