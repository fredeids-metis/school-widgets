# VALIDERING_PLAN.md

## Komplett Valideringsplan for Studieplanlegger

Basert på analyse av ALL curriculum-data (REGLER.md, TIMEFORDELING.md, blokkskjema.yml, alle fagfiler).

---

## DEL 1: REGELKATEGORIER

### 1.1 BLOKKERENDE REGLER (Må forhindre valg)

Disse reglene MÅ blokkere brukerens valg - kan ikke ignoreres.

| ID | Regel | Betingelse | Feilmelding | Visuelt |
|----|-------|-----------|-------------|---------|
| BLOCK-001 | Mat S+R konflikt | `har(S1/S2) && velger(R1/R2)` eller omvendt | "Matematikk S og R kan ikke kombineres på samme vitnemål" | 🚫 Rød, strikethrough, disabled |
| BLOCK-002 | Mat R+2P konflikt | `har(R1/R2) && velger(2P)` eller omvendt | "R-matematikk og 2P-matematikk kan ikke kombineres" | 🚫 Rød, strikethrough |
| BLOCK-003 | Geofag X+1 konflikt | `har(geofag-x) && velger(geofag-1)` | "Geofag X og Geofag 1 kan ikke føres på samme vitnemål" | 🚫 Rød |
| BLOCK-004 | ToF X+1 konflikt | `har(tof-x) && velger(tof-1)` | "Teknologi X og Teknologi 1 kan ikke kombineres" | 🚫 Rød |
| BLOCK-005 | Duplikat | `har(fagX) && velger(fagX)` | "Du har allerede dette faget" | 🚫 Grå, disabled |
| BLOCK-006 | Feil trinn | `trinn=vg2 && fag.vg3Only=true` | "Dette faget er kun tilgjengelig for VG3" | 🚫 Grå, disabled |

### 1.2 ADVARSELSREGLER (Vis advarsel, tillat valg)

Disse reglene bør vise advarsel men TILLATE valg.

| ID | Regel | Betingelse | Advarsel | Visuelt |
|----|-------|-----------|----------|---------|
| WARN-001 | Mangler prereq Fysikk | `velger(fysikk-2) && !har(fysikk-1)` | "Fysikk 2 bygger på Fysikk 1. Anbefales å ta Fysikk 1 først." | ⚠️ Gul kant |
| WARN-002 | Mangler prereq Kjemi | `velger(kjemi-2) && !har(kjemi-1)` | "Kjemi 2 bygger på Kjemi 1." | ⚠️ Gul kant |
| WARN-003 | Mangler prereq Biologi | `velger(biologi-2) && !har(biologi-1)` | "Biologi 2 bygger på Biologi 1." | ⚠️ Gul kant |
| WARN-004 | Mangler prereq Mat R | `velger(matematikk-r2) && !har(matematikk-r1)` | "Matematikk R2 krever R1 fra VG2" | ⚠️ Gul kant |
| WARN-005 | Mangler prereq MoL | `velger(mol-2) && !har(mol-1)` | "Markedsføring 2 krever Markedsføring 1" | ⚠️ Gul kant |
| WARN-006 | Mangler prereq Psykologi | `velger(psykologi-2) && !har(psykologi-1)` | "Psykologi 2 bygger på Psykologi 1" | ⚠️ Gul kant |
| WARN-007 | Mangler prereq Rettslære | `velger(rettslare-2) && !har(rettslare-1)` | "Rettslære 2 bygger på Rettslære 1" | ⚠️ Gul kant |
| WARN-008 | Mangler prereq Entreprenørskap | `velger(ent-2) && !har(ent-1)` | "Entreprenørskap 2 bygger på Entreprenørskap 1" | ⚠️ Gul kant |
| WARN-009 | Mangler prereq Musikk fordypning | `velger(musikk-fordypning-2) && !har(musikk-fordypning-1)` | "Musikk fordypning 2 bygger på Musikk fordypning 1" | ⚠️ Gul kant |

### 1.3 OBLIGATORISKE FAG (Må velges)

| ID | Regel | Betingelse | Melding | Visuelt |
|----|-------|-----------|---------|---------|
| REQ-001 | Historie VG3 | `trinn=vg3 && !har(historie)` | "Historie er obligatorisk i VG3" | ⭐ Gul bakgrunn, "Obligatorisk" |
| REQ-002 | Matematikk VG2 | `trinn=vg2 && !har(matematikk)` | "Du må velge matematikk for VG2" | ⭐ Gul bakgrunn |
| REQ-003 | Spansk I+II (betinget) | `harFremmedsprak=false && trinn=vg3 && !har(spansk-i-ii)` | "Du må velge Spansk I+II fordi du ikke hadde fremmedspråk i ungdomsskolen" | ⭐ Gul bakgrunn |

### 1.4 FORDYPNINGSKRAV (Studiespesialisering)

| ID | Regel | Betingelse | Melding |
|----|-------|-----------|---------|
| FORD-001 | Min 560 timer | `fordypningTimer < 560` | "Fordypning: X/560 timer - mangler Y timer" |
| FORD-002 | Min 2 fagområder | `antallFordypningOmrader < 2` | "Fordypning krever 2 fagområder - du har X" |
| FORD-003 | Min 280t per område | `timerPerOmrade < 280` | "Hvert fagområde trenger min 280 timer (2 fag)" |

---

## DEL 2: FAGOMRÅDE-MAPPING (for fordypning)

```javascript
const FAGOMRADE_MAP = {
  // MATEMATIKK (MAT)
  'matematikk-r1': 'MAT',
  'matematikk-r2': 'MAT',
  'matematikk-s1': 'MAT',
  'matematikk-s2': 'MAT',
  'matematikk-2p': 'MAT',

  // FYSIKK (FYS)
  'fysikk-1': 'FYS',
  'fysikk-2': 'FYS',

  // KJEMI (KJE)
  'kjemi-1': 'KJE',
  'kjemi-2': 'KJE',

  // BIOLOGI (BIO)
  'biologi-1': 'BIO',
  'biologi-2': 'BIO',

  // GEOFAG (GEO)
  'geofag-1': 'GEO',
  'geofag-2': 'GEO',
  'geofag-x': 'GEO',

  // INFORMASJONSTEKNOLOGI (IT)
  'informasjonsteknologi-1': 'IT',
  'informasjonsteknologi-2': 'IT',

  // TEKNOLOGI OG FORSKNINGSLÆRE (TOF)
  'teknologi-og-forskningslare-1': 'TOF',
  'teknologi-og-forskningslare-2': 'TOF',
  'teknologi-og-forskningslare-x': 'TOF',

  // SAMFUNNSØKONOMI (SOK)
  'samfunnsokonomi-1': 'SOK',
  'samfunnsokonomi-2': 'SOK',

  // ØKONOMI OG LEDELSE (OKO)
  'okonomistyring': 'OKO',
  'okonomi-og-ledelse': 'OKO',

  // MARKEDSFØRING (MOL)
  'markedsforing-og-ledelse-1': 'MOL',
  'markedsforing-og-ledelse-2': 'MOL',

  // ENTREPRENØRSKAP (ENT)
  'entreprenorskap-og-bedriftsutvikling-1': 'ENT',
  'entreprenorskap-og-bedriftsutvikling-2': 'ENT',

  // POLITIKK OG SAMFUNN (POS)
  'politikk-og-menneskerettigheter': 'POS',
  'sosialkunnskap': 'POS',
  'sosiologi-og-sosialantropologi': 'POS',

  // PSYKOLOGI (PSY)
  'psykologi-1': 'PSY',
  'psykologi-2': 'PSY',

  // RETTSLÆRE (RET)
  'rettslare-1': 'RET',
  'rettslare-2': 'RET',

  // HISTORIE OG FILOSOFI (HIF)
  'historie-og-filosofi-1': 'HIF',
  'historie-og-filosofi-2': 'HIF',

  // ENGELSK (ENG)
  'engelsk-1': 'ENG',
  'internasjonal-engelsk': 'ENG',

  // FREMMEDSPRÅK (FSP) - Unntak: 2 ulike språk = 1 område
  'spansk-1': 'FSP',
  'spansk-2': 'FSP',
  'tysk-1': 'FSP',
  'tysk-2': 'FSP',
  'fransk-1': 'FSP',
  'fransk-2': 'FSP',

  // MUSIKK (MUS)
  'musikk-fordypning-1': 'MUS',
  'musikk-fordypning-2': 'MUS',

  // KUNST OG DESIGN (KUN)
  'bilde': 'KUN',
  'grafisk-design': 'KUN'
};

const FAGOMRADE_NAVN = {
  'MAT': 'Matematikk',
  'FYS': 'Fysikk',
  'KJE': 'Kjemi',
  'BIO': 'Biologi',
  'GEO': 'Geofag',
  'IT': 'Informasjonsteknologi',
  'TOF': 'Teknologi og forskningslære',
  'SOK': 'Samfunnsøkonomi',
  'OKO': 'Økonomi og ledelse',
  'MOL': 'Markedsføring og ledelse',
  'ENT': 'Entreprenørskap',
  'POS': 'Politikk og samfunn',
  'PSY': 'Psykologi',
  'RET': 'Rettslære',
  'HIF': 'Historie og filosofi',
  'ENG': 'Engelsk',
  'FSP': 'Fremmedspråk',
  'MUS': 'Musikk',
  'KUN': 'Kunst og design'
};
```

---

## DEL 3: KRITERIER PER PROGRAM/TRINN

### 3.1 STUDIESPESIALISERING

#### VG2
```yaml
minAntallFag: 4
maxAntallFag: 4
obligatoriskeBolker: [blokk1, blokk2, blokk3, blokk4]
kategorikrav:
  - type: minimum
    kategori: matematikk
    antall: 1
    feilmelding: "Du må velge minst ett matematikkfag i VG2"
fagkrav: []
timerProgramfag: 420  # inkl. matematikk
```

#### VG3
```yaml
minAntallFag: 4
maxAntallFag: 4
obligatoriskeBolker: [blokk1, blokk2, blokk3, blokk4]
kategorikrav: []
fagkrav:
  - type: obligatorisk
    fag: historie
    feilmelding: "Du må ha Historie i VG3"
  - type: obligatorisk-betinget
    fag: spansk-i-ii
    betingelse: harFremmedsprak == false
    feilmelding: "Du må ha Spansk I+II fordi du ikke hadde fremmedspråk"
timerProgramfag: 420  # 280 fordypning + 140 valgfritt
fordypningKrav:
  timer: 560
  antallOmrader: 2
  timerPerOmrade: 280
```

### 3.2 MUSIKK, DANS OG DRAMA

#### VG2
```yaml
minAntallFag: 2  # 1 programfag + 1 matematikk
maxAntallFag: 2
tilgjengeligeBolker: [blokk1, blokk3]
kategorikrav:
  - type: minimum
    kategori: matematikk
    antall: 1
timerProgramfag: 140  # valgfrie
```

#### VG3
```yaml
minAntallFag: 2
maxAntallFag: 2
tilgjengeligeBolker: [blokk3, blokk4]
fagkrav:
  - type: obligatorisk-betinget
    fag: spansk-i-ii
    betingelse: harFremmedsprak == false
timerProgramfag: 140  # valgfrie (historie er fellesfag)
```

### 3.3 MEDIER OG KOMMUNIKASJON

#### VG2
```yaml
minAntallFag: 2  # 1 programfag + 1 matematikk
maxAntallFag: 2
tilgjengeligeBolker: [blokk1, blokk3]
kategorikrav:
  - type: minimum
    kategori: matematikk
    antall: 1
timerProgramfag: 140
```

#### VG3
```yaml
minAntallFag: 3  # 2 programfag + historie
maxAntallFag: 3
tilgjengeligeBolker: [blokk2, blokk3, blokk4]
fagkrav:
  - type: obligatorisk-betinget
    fag: spansk-i-ii
    betingelse: harFremmedsprak == false
timerProgramfag: 280
```

---

## DEL 4: VISUELL VALIDERING - UI SPESIFIKASJON

### 4.1 FAG-TILSTANDER I MODAL

```
┌─────────────────────────────────────────────────────────────────┐
│  TILSTAND          │  CSS-KLASSE         │  VISUELT            │
├─────────────────────────────────────────────────────────────────┤
│  Tilgjengelig      │  .available         │  Normal styling      │
│  Valgt             │  .selected          │  Grønn bakgrunn ✓   │
│  Valgt andre steder│  .selected-elsewhere│  Grå + "(valgt)"    │
│  Blokkert          │  .blocked           │  Grå, strikethrough 🚫│
│  Advarsel          │  .warning           │  Gul kant ⚠️         │
│  Obligatorisk      │  .obligatorisk      │  Gul bg ⭐           │
│  Duplikat          │  .invalid-duplicate │  Rød kant            │
│  Math-konflikt     │  .invalid-math      │  Orange kant         │
│  Mangler prereq    │  .missing-prereq    │  Gul kant + ikon    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 FORDYPNING-TRACKER (i modal)

```
┌────────────────────────────────────────────────────────────────┐
│ 📊 Fordypning                                    280/560t      │
├────────────────────────────────────────────────────────────────┤
│ ████████████░░░░░░░░░░░░  50%                                 │
├────────────────────────────────────────────────────────────────┤
│ ✓ MAT: 280t (R1 + R2)                                         │
│ ○ FYS: 140t (Fysikk 1) - trenger 1 fag til                   │
│                                                                │
│ 💡 Tips: Velg Fysikk 2 for å fullføre fordypning i Fysikk    │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 FEILMELDINGS-PANEL

```
┌────────────────────────────────────────────────────────────────┐
│ ⚠️ Valideringsfeil (2)                                        │
├────────────────────────────────────────────────────────────────┤
│ 🚫 Matematikk S og R kan ikke kombineres                      │
│    → Fjern enten S1 eller R1                                   │
│                                                                │
│ ⚠️ Fysikk 2 anbefales med Fysikk 1 først                      │
│    → Legg til Fysikk 1 i VG2                                   │
└────────────────────────────────────────────────────────────────┘
```

### 4.4 KONSEKVENS-PANEL (ved hover)

```
┌────────────────────────────────────────────────────────────────┐
│ Velger du Matematikk R1:                                       │
├────────────────────────────────────────────────────────────────┤
│ ✓ Åpner: Matematikk R2 i VG3                                  │
│ ✗ Blokkerer: Matematikk S1, S2, 2P                            │
│ 📊 Fordypning: +140t til Matematikk                            │
│ 💡 Erstatter: Matematikk 2P (fellesfag)                        │
└────────────────────────────────────────────────────────────────┘
```

---

## DEL 5: VALIDERINGSFLYT

### 5.1 Ved åpning av modal

```
1. Hent alle fag for programområde + trinn
2. Hent eksisterende state (valgte fag fra andre trinn)
3. For HVERT fag i modal:
   a. Sjekk BLOCK-regler → hvis blokkert: marker som blocked
   b. Sjekk WARN-regler → hvis advarsel: marker som warning
   c. Sjekk REQ-regler → hvis obligatorisk: marker som obligatorisk
   d. Sjekk selected-elsewhere → hvis valgt andre steder: marker
4. Beregn fordypning-status
5. Render validerings-UI
```

### 5.2 Ved klikk på fag

```
1. Hvis fag er blocked → IGNORER KLIKK (eller vis forklaring)
2. Hvis fag er selected → toggle av
3. Hvis fag er available/warning:
   a. Toggle på
   b. Re-valider ALLE fag (noen kan bli blocked/unblocked)
   c. Oppdater fordypning-beregning
   d. Oppdater feilmeldinger
   e. Oppdater knapp-status
```

### 5.3 Ved bekreftelse

```
1. Sjekk at antall fag matcher krav
2. Sjekk at obligatoriske fag er valgt
3. Sjekk at ingen BLOCK-feil eksisterer
4. Hvis OK: lagre og lukk
5. Hvis feil: vis shake-animasjon + feilmelding
```

---

## DEL 6: IMPLEMENTASJONS-PRIORITERING

### Fase 1: Kjerne-validering (MÅ fungere)
- [ ] BLOCK-001 til BLOCK-006 (alle blokkerende regler)
- [ ] Duplikat-sjekk
- [ ] Antall fag-validering

### Fase 2: Advarsler og hints
- [ ] WARN-001 til WARN-009 (alle forutsetninger)
- [ ] Selected-elsewhere visning
- [ ] Tooltip med forklaring

### Fase 3: Obligatoriske fag
- [ ] REQ-001 (Historie VG3)
- [ ] REQ-002 (Matematikk VG2)
- [ ] REQ-003 (Spansk betinget)
- [ ] Auto-fill logikk

### Fase 4: Fordypning
- [ ] FORD-001 til FORD-003
- [ ] Progress-bar
- [ ] Fagområde-tags
- [ ] Tips for å fullføre fordypning

### Fase 5: Konsekvens-visning
- [ ] Hover-panel med konsekvenser
- [ ] "Vil blokkere" / "Vil åpne" lister

### Fase 6: Program-spesifikke regler
- [ ] Musikk-spesifikke begrensninger
- [ ] Medier-spesifikke begrensninger
- [ ] Tilgjengelige blokker per program

---

## DEL 7: TEST-SCENARIER

### Matematikk-konflikter
1. Velg R1, prøv å velge S1 → Skal blokkeres
2. Velg S1, prøv å velge R2 → Skal blokkeres
3. Velg R1, prøv å velge 2P → Skal blokkeres

### Forutsetninger
1. VG3: Velg Fysikk 2 uten Fysikk 1 → Skal vise advarsel
2. VG3: Velg Kjemi 2 uten Kjemi 1 → Skal vise advarsel
3. VG3: Velg R2 uten R1 → Skal vise advarsel

### Obligatoriske fag
1. VG3: Prøv å bekrefte uten Historie → Skal feile
2. VG2: Prøv å bekrefte uten matematikk → Skal feile
3. VG3 uten fremmedspråk: Skal kreve Spansk I+II

### Fordypning
1. Velg R1 + R2 + Fysikk 1 + Fysikk 2 → 560t, 2 områder ✓
2. Velg R1 + Fysikk 1 + Kjemi 1 + Bio 1 → 560t, 4 områder (feil: trenger 280t per område)
3. Velg R1 + R2 + Fysikk 1 + Psykologi 1 → 560t, men bare 1 komplett område

### Program-spesifikke
1. Musikk VG2: Skal bare se blokk 1 og 3
2. Medier VG3: Skal se blokk 2, 3 og 4
3. Musikk: musikk-fordypning skal være tilgjengelig

---

## DEL 8: DATASTRUKTUR FOR VALIDERING

```typescript
interface ValidationResult {
  status: 'available' | 'blocked' | 'warning' | 'selected' | 'selected-elsewhere';
  reasons: string[];
  cssClass: string;
  tooltip?: string;
}

interface FordypningStatus {
  totalTimer: number;
  required: number;
  progress: number;  // 0-100
  isValid: boolean;
  areas: Array<{
    code: string;
    name: string;
    timer: number;
    fagCount: number;
    meetsMinimum: boolean;  // >= 280t
    fag: string[];
  }>;
  tips?: string;
}

interface ModalValidation {
  canSubmit: boolean;
  errors: Array<{
    type: 'block' | 'missing-required' | 'count';
    message: string;
    suggestion?: string;
    fagIds?: string[];
  }>;
  warnings: Array<{
    type: 'prerequisite' | 'fordypning';
    message: string;
    suggestion?: string;
  }>;
}

interface Consequences {
  willBlock: Array<{ id: string; navn: string }>;
  willEnable: Array<{ id: string; navn: string }>;
  fordypningImpact: {
    area: string;
    areaName: string;
    adds: number;
  } | null;
  replaces?: string;  // f.eks. "Mat 2P erstattes"
}
```

---

*Sist oppdatert: 2024-11-21*
*Basert på: REGLER.md, TIMEFORDELING.md, blokkskjema.yml, alle fagfiler*
