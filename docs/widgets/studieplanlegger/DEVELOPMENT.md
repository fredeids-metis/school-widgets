# Studieplanlegger - Utviklingsnotater

## Lokal testing

Start live-server fra `school-widgets`-mappen:

```bash
cd /Users/fredrik/Documents/school-data-project/repos/school-widgets
npx live-server --port=8080 --open=widgets/studieplanlegger/demo/index.html
```

Demo-siden åpnes automatisk på `http://localhost:8080/widgets/studieplanlegger/demo/index.html`

**Tips:** Bruk `Cmd+Shift+R` for hard refresh når du tester CSS/JS-endringer.

---

## Implementert funksjonalitet

### Blokkskjema-validering
- **Duplikat-hint**: Fag valgt i andre blokker vises grået ut med "(valgt)", ved hover vises "(klikk for å bytte)"
- **Duplikat-swap**: Ved klikk på fag som allerede er valgt i annen blokk → byttes automatisk
- **Duplikat-feil**: Hvis samme fag velges i flere blokker vises valideringsfeil
- **Matematikk-konflikt**: S og R kan ikke kombineres, viser feilmelding
- **Forutsetninger**: Advarsel ved valg av nivå 2 uten nivå 1 (R2→R1, Fysikk2→Fysikk1, etc.)

### Auto-fill obligatoriske fag
- **Historie (VG3)**: Auto-velges når 1 slot gjenstår
- **Spansk I+II**: Auto-velges når fremmedspråk=NEI og 2 slots gjenstår

### State management
- Programfag nullstilles ved bytte av programområde
- Fremmedspråk-valg påvirker tilgjengelige fag

---

## Pending feature requests

### 1. Kryss-trinn validering (VG2↔VG3)
**Beskrivelse:** Fag valgt i ett trinn skal gråes ut i blokkskjema for andre trinn.

**Oppførsel:**
- Hvis Biologi 1 er valgt i VG2, gråes det ut når man åpner VG3-blokkskjema
- Ved klikk på utgråat fag: rød tekst "Du har allerede valgt dette faget i VG2"
- Gjelder begge veier (VG2→VG3 og VG3→VG2)

### 2. Info-modal ved klikk på i-knapp
**Beskrivelse:** Vise informasjon om fag når bruker klikker info-ikon.

### 3. Koble validation.js til hovedwidget
**Beskrivelse:** Integrere StudieValidator-klassen for total studieplansvalidering:
- Fordypningskrav (560t fra 2 fagområder)
- Matematikk S/R-validering på tvers av trinn
- Total timeberegning

### 4. Studie-validering i hovedvisning
**Beskrivelse:** Vise valideringsstatus utenfor modal:
- Grønn/rød indikator per trinn
- Samlet timer og mangler
- Krav fra TIMEFORDELING.md og REGLER.md

---

## Filstruktur

```
widgets/studieplanlegger/
├── demo/
│   └── index.html          # Test-side
├── js/
│   ├── studieplanlegger.js # Hovedwidget
│   ├── state.js            # State management
│   ├── data-handler.js     # API-kall (v2)
│   └── validation.js       # Valideringsmodul (ny)
├── studieplanlegger.css    # Styling
├── DEVELOPMENT.md          # Denne filen
└── README.md               # Dokumentasjon
```

## API

Widget bruker GitHub Pages API:
- Base URL: `https://fredeids-metis.github.io/school-data/api/v2`
- Endepunkter: `/schools/{school}/blokkskjema.json`, `/valgregler.json`, `/timefordeling.json`

---

## Valideringsregler (fra REGLER.md)

| Regel | Beskrivelse |
|-------|-------------|
| Matematikk S≠R | Kan ikke kombinere S1/S2 med R1/R2 |
| Fordypning 560t | Minst 560 timer fra 2 fagområder (2×140t hver) |
| Historie VG3 | Obligatorisk fellesfag |
| Spansk I+II | Påkrevd hvis ingen fremmedspråk fra ungdomsskolen |
| Forutsetninger | Nivå 2-fag krever nivå 1 først |

---

*Sist oppdatert: 2025-11-21*
