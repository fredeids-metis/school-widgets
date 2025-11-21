# Studieplanlegger Widget - Scope og Avklaringer

## Mål
En interaktiv widget som lar elever planlegge hele sitt studieløp (VG1, VG2, VG3) basert på valgt programområde.

## Funksjonalitet

### 1. Filter (øverst)
- **Programområde**: Studiespesialisering / Musikk, dans og drama / Medier og kommunikasjon
- **Fremmedspråk på ungdomsskolen?**: Ja / Nei
  - Hvis "Nei": Spansk I+II blir obligatorisk på VG3

### 2. Tre-kolonner layout (VG1 / VG2 / VG3)
Hver kolonne viser:

#### VG1:
- **Fellesfag** (auto-populert, ikke valgbare):
  - Engelsk
  - Geografi (kun Studiespesialisering)
  - Kroppsøving
  - Naturfag
  - Norsk
  - Samfunnskunnskap (kun Studiespesialisering)

- **Valgbare fag** (interaktive):
  - **Fremmedspråk, vg1**: Tysk II / Fransk II / Spansk II / Spansk I / Spansk I+II
  - **Matematikk**: 1P / 1T

- **Obligatoriske programfag** (auto-populert for Musikk/Medier):
  - Musikk: "Musikk, dans og drama" (140t)
  - Medier: "Mediesamfunnet 1" (140t), "Medieuttrykk 1" (140t)

- **Programfag-slots**: Tomme (grå) - Studiespesialisering har 0, Musikk har 2 (56t + 140t), Medier har 0

#### VG2:
- **Fellesfag** (auto-populert):
  - Fremmedspråk, vg2 (basert på valg fra VG1)
  - Geografi (Musikk/Medier)
  - Historie (56t)
  - Kroppsøving (Studiespesialisering/Medier)
  - Matematikk 2P* (kan erstattes av R1)
  - Norsk
  - Samfunnskunnskap (Musikk/Medier)

- **Obligatoriske programfag** (auto-populert for Musikk/Medier):
  - Musikk: "Ergonomi og bevegelse 1" (56t), "Instrument, kor, samspill 1" (140t), "Musikk i perspektiv 1" (140t)
  - Medier: "Mediesamfunnet 2" (140t), "Medieuttrykk 2" (140t)

- **Programfag-slots** (grå, klikbare):
  - **Studiespesialisering**: 3 slots (420 timer totalt)
  - **Musikk**: 1 slot (140 timer)
  - **Medier**: 1 slot (140 timer)

#### VG3:
- **Fellesfag** (auto-populert):
  - Historie (113t) - MÅ velges i blokkskjema
  - Kroppsøving (56t)
  - Norsk (168t)
  - Religion og etikk (84t)
  - *Spansk I+II (140t)* - hvis "Nei" på fremmedspråk-filter

- **Obligatoriske programfag** (auto-populert for Musikk/Medier):
  - Musikk: "Ergonomi og bevegelse 2" (56t), "Instruksjon og ledelse" (140t), "Instrument, kor, samspill 2" (140t), "Musikk i perspektiv 2" (140t)
  - Medier: "Mediesamfunnet 3" (140t), "Medieuttrykk 3" (140t)

- **Programfag-slots** (grå, klikbare):
  - **Studiespesialisering**: 3 slots (420 timer: 2x fordypning nivå 2 + 1x valgfritt)
  - **Musikk**: 1 slot (140 timer) + Historie (113t) = 2 slots totalt
  - **Medier**: 2 slots (280 timer) + Historie (113t) = 3 slots totalt

### 3. Interaksjon - Blokkskjema popup

**Når bruker klikker på VG2 eller VG3 boks:**
- Modal/popup åpnes med blokkskjema
- Blokkskjema viser kun relevante blokker basert på `blokkskjema_v2.yml`:
  - **VG2 Studiespesialisering**: Blokk 1, 2, 3, 4
  - **VG2 Musikk**: Blokk 1, 3
  - **VG2 Medier**: Blokk 1, 3
  - **VG3 Studiespesialisering**: Blokk 1, 2, 3, 4
  - **VG3 Musikk**: Blokk 3, 4
  - **VG3 Medier**: Blokk 2, 3, 4

- Fag-bokser skal være **mindre** enn i programfag-velger
- Bruker velger fag (multiple selection)
- **Validering**:
  - Må velge riktig antall fag
  - Må oppfylle timer-krav
  - Må velge historie på VG3
  - Må velge Spansk I+II på VG3 hvis "Nei" på fremmedspråk
  - Må ha fordypning (2 fag nivå 2) på VG3 Studiespesialisering

- Når OK/Bekreft: Valgte fag fylles inn i programfag-slots

### 4. Validering

**VG1 validering:**
- Fremmedspråk valgt
- Matematikk valgt (1P eller 1T)

**VG2 validering (basert på programområde):**
- **Studiespesialisering**: 3 programfag valgt (420 timer totalt)
  - Enten Matematikk 2P (84t) ELLER Matematikk R1 (140t)
  - Anbefaling: To fag fra samme fagområde (for fordypning i VG3)
- **Musikk**: 1 programfag valgt (140 timer)
- **Medier**: 1 programfag valgt (140 timer)

**VG3 validering (basert på programområde):**
- **Studiespesialisering**: 3 programfag valgt (420 timer totalt)
  - Historie VG3 (113t) OBLIGATORISK
  - 2 fag nivå 2 (fordypning, 280 timer totalt)
  - 1 valgfritt fag (140 timer)
  - Spansk I+II hvis "Nei" på fremmedspråk
- **Musikk**: 2 programfag valgt (253 timer totalt)
  - Historie VG3 (113t) OBLIGATORISK
  - 1 valgfritt programfag (140 timer)
  - Spansk I+II hvis "Nei" på fremmedspråk
- **Medier**: 3 programfag valgt (393 timer totalt)
  - Historie VG3 (113t) OBLIGATORISK
  - 2 valgfrie programfag (280 timer)
  - Spansk I+II hvis "Nei" på fremmedspråk

### 5. Output/Eksport (fremtidig)
- Print som PDF (hele siden)
- Sammendrag/oversikt
- Lagre valg (localStorage?)

## Datakilde

### API endpoints:
```javascript
const apiBase = 'https://fredeids-metis.github.io/school-data/api/v1';
const schoolId = 'bergen-private-gymnas';

// Endpoints:
// - blokkskjema_v2: `${apiBase}/schools/${schoolId}/blokkskjema_v2.json`
// - programfag: `${apiBase}/schools/${schoolId}/programfag.json`
// - curriculum: `${apiBase}/curriculum/all-programfag.json`
```

### Statisk data fra TIMEFORDELING.md:
- Fellesfag per programområde og trinn
- Obligatoriske programfag per programområde
- Timer-krav per programområde og trinn

## Design

### Layout:
- **Filter-seksjon**: Kompakt, horizontale buttons (lik programfag-velger)
- **VG-kolonner**: 3-kolonner grid (responsiv: 1 kolonne på mobil)
- **VG-header**: Grønn gradient (lik blokkskjema i programfag-velger, men annen farge)
- **Fag-items**:
  - Fellesfag/obligatoriske: Hvite kort med grønn border
  - Programfag-slots (tomme): Grå kort med stiplet border
  - Programfag-slots (valgt): Grønn bakgrunn (lik selected state i programfag-velger)

### Farger:
- Primary: `#1F4739` (mørk grønn)
- Secondary: `#E8F5A3` (lime)
- Header gradient: Annen farge enn blokkskjema (forslag: litt lysere grønn?)

### CSS-prefix:
- `.sp-` (studieplanlegger)

## Teknisk implementering

### Fil-struktur:
```
widgets/studieplanlegger/
├── src/
│   ├── studieplanlegger.js        # Hovedfil og orkestrering (300-500 linjer)
│   ├── validation.js              # Valideringslogikk (200-300 linjer)
│   ├── data-handler.js            # API-kall og data-prosessering (200-300 linjer)
│   ├── ui-renderer.js             # Rendering-funksjoner (400-600 linjer)
│   ├── planlegger.css             # Widget-spesifikk CSS
│   └── styles.css                 # Auto-generated (bundled CSS)
├── demo/
│   └── demo.html
│   └── test-visual.html           # Visuell test med inline JS
├── docs/widgets/studieplanlegger/v1/
│   ├── studieplanlegger.bundle.js    # BUNDLED JavaScript (alle moduler)
│   └── styles.css                     # BUNDLED CSS (base + brand + components + widget)
├── SCOPE.md (dette dokumentet)
└── README.md
```

### JavaScript-pattern (modulær struktur):
**Under utvikling**: Separate filer for enkel navigering
**Ved deployment**: Bundlet til én fil (kompatibelt med eksisterende setup)

1. **validation.js** - All valideringslogikk
   - Valider programfag-valg per trinn
   - Valider timer-krav
   - Valider obligatoriske fag (historie, spansk)
   - Valider fordypning (studiespesialisering VG3)

2. **data-handler.js** - API-kall og data-prosessering
   - Hent blokkskjema_v2.json
   - Hent fellesfag fra TIMEFORDELING.md
   - Normaliser data fra API

3. **ui-renderer.js** - Rendering-funksjoner
   - Render VG-kolonner
   - Render blokkskjema modal
   - Render validering
   - Update UI basert på state

4. **studieplanlegger.js** - Hovedfil
   - Init widget
   - State management
   - Event handlers
   - Orkestrerer andre moduler

**Build-script**: Enkel konkatenering av filer til én bundle

### Modular CSS (gjenbruk fra shared/):
**VIKTIG**: Vi bruker IKKE inline CSS i produksjon!

Build-prosess (via `scripts/build-css.js`):
```javascript
buildWidget('studieplanlegger', 'planlegger.css', true, true);
// Bundler: base.css + brand.css + modal.css + accordion.css + planlegger.css
// Output: docs/widgets/studieplanlegger/v1/styles.css
```

**Komponenter som gjenbrukes**:
- `shared/base.css` - Design tokens (farger, spacing, radius, transitions)
- `shared/brand/bergen-private-gymnas.css` - Merkevare-farger
- `shared/components/modal.css` - Modal-styling
- `shared/components/accordion.css` - Accordion (hvis nødvendig)
- `src/planlegger.css` - **KUN** widget-spesifikk CSS (ikke gjenbrukbar styling)

## Avklaringer

### Bekreftet:
✅ Filter: Programområde + Fremmedspråk på ungdomsskolen
✅ Tre kolonner (VG1/VG2/VG3)
✅ Fellesfag/obligatoriske programfag auto-populeres
✅ VG1: Velg Fremmedspråk og Matematikk
✅ VG2/VG3: Klikk på boks → blokkskjema popup
✅ Blokkskjema basert på blokkskjema_v2.yml
✅ Validering: Må velge riktig antall fag
✅ Matematikk 2P i både fellesfag OG programfag-kategori (kan erstattes av R1)

### Åpne spørsmål:
❓ VG-header farge: Skal den være annerledes enn blokkskjema? (Forslag: `#2E7D5E` - lysere grønn?)
❓ Fag-bokser i blokkskjema: Hvor mye mindre enn i programfag-velger? (Forslag: 80% størrelse?)
❓ VG1 Fremmedspråk/Matematikk-valg: Skal dette være dropdown, radio buttons, eller blokkskjema-lignende?
❓ Skal Historie VG3 (113t) vises både i fellesfag OG i programfag-slots, eller bare i programfag-slots?

### Neste steg:
1. ✅ Opprett widget-mappe og struktur
2. ✅ Lag SCOPE.md
3. ⏳ Lag test-HTML med statisk innhold
4. ⏳ Style VG-kolonner og fag-items
5. ⏳ Lag blokkskjema popup-design (statisk)
6. ⏳ Implementer JavaScript-logikk
7. ⏳ Implementer validering
8. ⏳ Testing og refinement

---

**Status**: Scope definert, klar for visuell utforming
**Sist oppdatert**: 2025-11-20
