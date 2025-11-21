# Studieplanlegger - Prosjektkontekst

**Sist oppdatert:** 2025-11-21
**Status:** Data-lag og API ferdig testet, klar for UI-utvikling

---

## Prosjektoversikt

### Formål
Studieplanlegger-widget for elever ved Bergen Private Gymnas (BPG) som skal planlegge fagvalg for VG1-VG3.

### Repostruktur
```
school-data-project/
├── repos/
│   ├── school-data/          # Data-API (GitHub Pages)
│   │   ├── data/
│   │   │   ├── curriculum/   # Fellesdata (REGLER.md, TIMEFORDELING.md)
│   │   │   └── schools/
│   │   │       └── bergen-private-gymnas/
│   │   │           └── blokkskjema_v2.yml  # Hoveddata for studieplanlegger
│   │   ├── scripts/
│   │   │   └── build-api-v2.js  # Bygger studieplanlegger.json
│   │   └── docs/api/v2/      # Generert API (GitHub Pages)
│   │
│   └── school-widgets/       # Widgets
│       └── widgets/
│           └── studieplanlegger/
│               ├── js/
│               │   ├── data-handler.js  # API-kommunikasjon og validering
│               │   └── data-mock.js     # Mock-data for utvikling
│               ├── demo/
│               │   └── test-v2-api.html # Testside
│               ├── TESTPLAN.md          # Testdokumentasjon
│               ├── SCOPE.md             # Kravspesifikasjon
│               └── CONTEXT.md           # Denne filen
```

### API-endepunkter
| Versjon | URL | Status |
|---------|-----|--------|
| v2 (studieplanlegger) | `https://fredeids-metis.github.io/school-data/api/v2/schools/bergen-private-gymnas/studieplanlegger.json` | ✅ Live |
| v1 (legacy) | `https://fredeids-metis.github.io/school-data/api/v1/...` | ✅ IKKE RØR |

---

## Programområder

| Program | ID | VG2 Blokker | VG3 Blokker | Valgfrie fag |
|---------|-----|-------------|-------------|--------------|
| Studiespesialisering | `studiespesialisering` | 1,2,3,4 | 1,2,3,4 | VG2: 3, VG3: 3 |
| Musikk, dans og drama | `musikk-dans-drama` | 1,3 | 3,4 | VG2: 1, VG3: 2 |
| Medier og kommunikasjon | `medier-kommunikasjon` | 1,3 | 2,3,4 | VG2: 1, VG3: 3 |

---

## Kritiske Valideringsregler

### Matematikk-regler (VIKTIG)
1. **R1/S1 erstatter 2P** - Matematikk R1 eller S1 (programfag) erstatter 2P (fellesfag)
2. **R vs S er ekskluderende** - Kan ikke kombinere R-track med S-track
3. **R1 + 3 fag = 560t** - Med R1 får du 4 programfag totalt (ikke 3)
4. **2P + 3 fag = 504t** - Med 2P (fellesfag) får du 3 programfag

### Forutsetninger (Bygger på)
| Fag | Krever |
|-----|--------|
| matematikk-r2 | matematikk-r1 |
| matematikk-s2 | matematikk-s1 |
| fysikk-2 | fysikk-1 |
| kjemi-2 | kjemi-1 |
| markedsforing-og-ledelse-2 | markedsforing-og-ledelse-1 |

**MERK:** Biologi 2, Psykologi 2, Rettslære 2 har IKKE formelle forutsetninger iht. Udir.

### Obligatoriske fag VG3
- **Historie VG3** (113t) - Obligatorisk for ALLE programmer
- **Spansk I+II** (140t) - Obligatorisk for elever UTEN fremmedspråk fra ungdomsskolen

### Fordypningskrav (kun Studiespesialisering)
- VG3: Minimum 2 fagområder med nivå 2-fag (280t)
- Kan oppnås på tvers av år (nivå 1 i VG2, nivå 2 i VG3)

---

## Data-handler.js - Nøkkelmetoder

```javascript
// Initialiser
const dh = new DataHandler({ schoolId: 'bergen-private-gymnas', useMockData: false, apiVersion: 'v2' });
await dh.loadAll();

// Hent data
dh.getSchool()                              // Skoleinfo
dh.getPrograms()                            // Tilgjengelige programmer
dh.getBlokker()                             // Alle blokker
dh.getFagForProgramOgTrinn(program, trinn)  // Fag filtrert på program/trinn
dh.getValgreglerForTrinn(program, trinn)    // Valgregler for program/trinn

// Validering
dh.getForutsetninger()                      // Alle prerekvister
dh.getEksklusjoner()                        // Alle eksklusjoner
dh.getPrerequisiteFor(fagId)                // Prerekvitt for spesifikt fag
dh.isExcludedBy(fagId, selectedFagIds)      // Sjekk eksklusjon
```

---

## Lokal testing

```bash
# Start server fra studieplanlegger-mappen
cd /Users/fredrik/Documents/school-data-project/repos/school-widgets/widgets/studieplanlegger
python3 -m http.server 8080

# Åpne testside
open http://localhost:8080/demo/test-v2-api.html
```

**Test i konsoll:**
```javascript
const dh = dataHandler();
dh.getValgreglerForTrinn('studiespesialisering', 'vg2');
dh.isExcludedBy('matematikk-s1', ['matematikk-r1']);
```

---

## Bygge og deploye

```bash
# Fra school-data repo
cd /Users/fredrik/Documents/school-data-project/repos/school-data

# Bygg kun v2
npm run build:v2

# Bygg begge versjoner
npm run build:all

# Commit og push (trigrer GitHub Pages deploy)
git add -A && git commit -m "Beskrivelse" && git push
```

---

## Testresultater (2025-11-21)

| Kategori | Status |
|----------|--------|
| Valgregler per program/trinn | ✅ Alle bestått |
| Forutsetninger (5 stk) | ✅ Alle bestått |
| Eksklusjoner (R/S/2P) | ✅ Alle bestått |
| Simulering: Normal elev | ✅ |
| Simulering: Uten fremmedspråk | ✅ |
| Simulering: Fordypning tvers av år | ✅ |
| Edge cases (feil input) | ✅ Alle fanges |

**Se TESTPLAN.md seksjon 9 for detaljer.**

---

## Neste steg

1. **Widget UI-utvikling**
   - VG1/VG2/VG3 kolonner
   - Blokkskjema-modal for fagvalg
   - Validerings-feedback til bruker
   - Responsivt design

2. **Dokumentasjon i SCOPE.md og TESTPLAN.md**

---

## Referansedokumenter

| Dokument | Beskrivelse |
|----------|-------------|
| `REGLER.md` | Offisielle valideringsregler fra LK20 |
| `TIMEFORDELING.md` | Timer per program/trinn |
| `blokkskjema_v2.yml` | Skolens faktiske fagtilbud |
| `TESTPLAN.md` | Testdokumentasjon med sjekklister |
| `SCOPE.md` | Kravspesifikasjon for widget |

---

## Offisiell kilde

- **Udir-1-2025:** https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/udir-1-2025/
- **Vedlegg 1 (VGO):** https://www.udir.no/regelverkstolkninger/opplaring/Innhold-i-opplaringen/udir-1-2025/vedlegg-1/3vgo/
