# Programfag-velger Widget

Interaktiv fagvelger for norske videregående skoler.

## Funksjonalitet

- Velg trinn (VG2 eller VG3)
- Velg programområde (Studiespesialisering, Musikk, Medier og kommunikasjon)
- For VG3: Oppgi tidligere fag fra VG2 (validering av forutsetninger)
- Velg fag fra blokkskjema (4x4 grid)
- Live-validering basert på kriterier:
  - Minimum/maksimum antall fag
  - Obligatoriske blokker
  - Kategorikrav (f.eks. minst 1 matematikkfag)
  - Forutsetninger (f.eks. Matematikk R2 krever R1 fra VG2)
  - Eksklusjoner (f.eks. ikke både R-matte og 2P-matte)
- Oppsummering av valg

## Bruk

### HTML

```html
<div id="programfag-velger"></div>
<link rel="stylesheet" href="https://fredeids-metis.github.io/school-widgets/widgets/programfag-velger/v1/styles.css">
<script src="https://fredeids-metis.github.io/school-widgets/widgets/programfag-velger/v1/velger.js"></script>
<script>
  ProgramfagVelger.init({
    schoolId: 'bergen-private-gymnas',
    container: '#programfag-velger',
    onComplete: function(result) {
      console.log('Fagvalg:', result);
      // Handle completed selection
    }
  });
</script>
```

### Konfigurasjon

| Parameter | Type | Required | Default | Beskrivelse |
|-----------|------|----------|---------|-------------|
| `schoolId` | string | Ja | - | ID for skolen (f.eks. 'bergen-private-gymnas') |
| `container` | string | Ja | - | CSS-selector for container-element |
| `apiBase` | string | Nei | GitHub Pages URL | Base URL for API |
| `onComplete` | function | Nei | - | Callback når fagvalg er fullført |

### Eksempel på `onComplete` resultat

```javascript
{
  trinn: 'vg3',
  programomrade: 'studiespesialisering',
  previousSubjects: {
    blokk1: 'matematikk-r1',
    blokk2: 'kjemi-1',
    blokk3: 'fysikk-1',
    blokk4: 'biologi-1'
  },
  selectedSubjects: {
    blokk1: 'matematikk-r2',
    blokk2: 'biologi-2',
    blokk3: 'fysikk-2',
    blokk4: 'kjemi-2'
  },
  validation: {
    valid: true,
    errors: []
  }
}
```

## Lokal utvikling

1. Start en lokal server fra `school-data/docs` for å serve API-et:
```bash
cd repos/school-data/docs
python3 -m http.server 8000
```

2. Åpne demo-siden:
```bash
cd repos/school-widgets/widgets/programfag-velger/demo
open demo.html
```

Demo-siden er konfigurert til å bruke `http://localhost:8000/api/v1` for lokal testing.

## Struktur

```
programfag-velger/
├── src/
│   ├── velger.js    - Hovedlogikk og validering
│   └── styles.css   - Styling
├── demo/
│   └── demo.html    - Demo-side for testing
└── README.md        - Denne filen
```

## Validering

Widgeten validerer fagvalg basert på kriterier fra `blokkskjema.json`:

### Kategorikrav
```yaml
kategorikrav:
  - type: "minimum"
    kategori: "matematikk"
    antall: 1
    feilmelding: "Du må velge minst ett matematikkfag i VG2"
```

### Forutsetninger
```yaml
forutsetninger:
  - fag: "matematikk-r2"
    krever: ["matematikk-r1"]
    feilmelding: "For å velge Matematikk R2 må du ha hatt R1 i VG2"
```

### Eksklusjoner
```yaml
eksklusjoner:
  - gruppe: ["matematikk-r1", "matematikk-2p"]
    feilmelding: "Du kan ikke velge både R-matte og 2P-matte samtidig"
```

## Browser-support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Moderne mobile browsers

## Lisens

MIT
