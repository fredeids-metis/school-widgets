# Studieplanlegger Widget

En interaktiv widget for å planlegge studieprogrammet sitt gjennom VG1, VG2 og VG3.

## 📁 Struktur

```
studieplanlegger/
├── js/
│   ├── data-handler.js      # Håndterer lasting og parsing av data
│   ├── data-mock.js          # Mock data for lokal utvikling
│   ├── state.js              # State management
│   ├── ui-renderer.js        # UI rendering
│   └── studieplanlegger.js   # Hovedfil som kobler alt sammen
├── demo/
│   ├── index.html            # Modular demo (bruker ES6 modules)
│   └── test-visual.html      # Visual prototype (inline CSS/JS)
├── studieplanlegger.css      # Widget-spesifikk CSS
├── SCOPE.md                  # Detaljert scope og krav
└── README.md                 # Denne filen
```

## 🚀 Kom i gang

### Lokal testing

1. Start en lokal webserver i `school-widgets` mappen:
   ```bash
   cd /Users/fredrik/Documents/school-data-project/repos/school-widgets
   python3 -m http.server 8000
   ```

2. Åpne i nettleseren:
   - **GitHub data test**: `http://localhost:8000/widgets/studieplanlegger/demo/github-test.html` ⭐
   - Modular demo (mock): `http://localhost:8000/widgets/studieplanlegger/demo/index.html`
   - Visual prototype: `http://localhost:8000/widgets/studieplanlegger/demo/test-visual.html`

### Testing med Live API

`github-test.html` lar deg bytte mellom mock data og live API:
- **Mock Data**: Rask testing med hardkodet data
- **Live API**: Henter data fra GitHub Pages API (`fredeids-metis/school-data`)

Dette gjør at du kan teste widgeten med reelle data uten å måtte ha school-data lokalt!

### Modulær arkitektur

Widgeten bruker ES6 modules for bedre kodeorganisering:

#### `data-handler.js`
- Laster blokkskjema fra `school-data` prosjektet
- Laster timefordeling (fellesfag og timekrav)
- Parser YAML og Markdown (med fallback til mock data)
- Eksporterer: `DataHandler` class

#### `data-mock.js`
- Mock data for lokal utvikling
- Inneholder fellesfag for alle programområder (VG1-3)
- Inneholder blokkskjema for studiespesialisering (VG2-3)
- Eksporterer: `mockTimefordeling`, `mockBlokkskjema`

#### `state.js`
- Håndterer widget state (programområde, valgte fag, etc.)
- Publish/subscribe pattern for state changes
- Validering av fagvalg
- Eksporterer: `StudieplanleggerState` class

#### `ui-renderer.js`
- Renderer UI basert på state og data
- Genererer HTML for filter, VG-kolonner, modaler
- Eksporterer: `UIRenderer` class

#### `studieplanlegger.js`
- Hovedfil som initialiserer widgeten
- Kobler sammen data, state og UI
- Håndterer event listeners
- Eksporterer: `Studieplanlegger` class

## 📦 Avhengigheter

### Shared CSS
Widgeten bruker delt CSS fra `shared/`:
- `shared/base.css` - Grunnleggende CSS variabler og reset
- `shared/brand/bergen-private-gymnas.css` - Merkevarespesifikke farger
- `shared/components/modal.css` - Modal-komponent styling

### Data
Widgeten henter data fra `school-data` prosjektet:
- `school-data/data/schools/[school-id]/blokkskjema_v2.yml`
- `school-data/data/curriculum/TIMEFORDELING.md`

For lokal utvikling brukes mock data som fallback.

## 🎨 CSS-struktur

### CSS variabler (definert i `studieplanlegger.css`)
```css
--vg-header-color           /* VG-header farge (endres per programområde) */
--vg-header-hover           /* VG-header hover farge */
```

### Programområde-spesifikke farger
Farger settes via `data-programomrade` attribute på `<body>`:
- `studiespesialisering` → Soft sage green (#9DB68C)
- `musikk-dans-drama` → Warm beige/tan (#C9A88E)
- `medier-kommunikasjon` → Muted blue-grey (#8EAAB8)

## 🔧 Bygging for produksjon

I produksjon vil filene bli bundlet:

### JavaScript
```bash
# Alle JS-filer bundlet til én fil
studieplanlegger.bundle.js
```

### CSS
```bash
# Alle CSS-filer bundlet til én fil
studieplanlegger.bundle.css

# Inkluderer:
# - shared/base.css
# - shared/brand/[school-id].css
# - shared/components/modal.css
# - studieplanlegger.css
```

## 📝 Bruk

### HTML
```html
<div id="studieplanlegger-widget"></div>
```

### JavaScript

#### Med mock data (default)
```javascript
import { Studieplanlegger } from './js/studieplanlegger.js';

const container = document.getElementById('studieplanlegger-widget');
const widget = new Studieplanlegger(container, {
  schoolId: 'bergen-private-gymnas'
});
```

#### Med Live API (GitHub Pages)
```javascript
const widget = new Studieplanlegger(container, {
  schoolId: 'bergen-private-gymnas',
  useMockData: false,
  useAPI: true,
  apiBaseUrl: 'https://fredeids-metis.github.io/school-data/api/v1'
});
```

#### Med lokal school-data
```javascript
const widget = new Studieplanlegger(container, {
  schoolId: 'bergen-private-gymnas',
  useMockData: false,
  useAPI: false  // Bruker relative paths til lokal school-data
});
```

## 🧪 Testing

### Mock data
Mock data brukes som standard for rask utvikling. For å teste med ekte data:
```javascript
const widget = new Studieplanlegger(container, {
  schoolId: 'bergen-private-gymnas',
  useMockData: false
});
```

### Visual prototype
`demo/test-visual.html` er en standalone prototype med inline CSS og JavaScript. Den er raskere å iterere på for visuelt design, men ikke modulær.

## 🎯 Features

- **Filter**: Velg programområde og fremmedspråk-status
- **VG1**: Velg fremmedspråk og matematikk via modaler
- **VG2/VG3**: Velg programfag via blokkskjema-modal
- **Validering**: Sanntids validering av fagvalg
- **Responsive**: Fungerer på desktop, tablet og mobil
- **State management**: All state håndteres sentralt
- **Data-driven**: Bruker data fra school-data prosjektet

## 📚 Relaterte filer

- `SCOPE.md` - Detaljert beskrivelse av krav og design
- `../../shared/` - Delte komponenter og styling
- `../../../school-data/` - Curriculum data

## 🐛 Debugging

Widgeten eksponeres til `window.studieplanlegger` for debugging:
```javascript
// I console
studieplanlegger.state.getState()  // Se current state
studieplanlegger.dataHandler.blokkskjemaData  // Se loaded data
```
