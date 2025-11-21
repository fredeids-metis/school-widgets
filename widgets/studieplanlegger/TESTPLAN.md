# Studieplanlegger - Testplan og Valideringsskjema

**Versjon:** 1.0
**Sist oppdatert:** 2025-11-21
**Ansvarlig:** Skoleadministrator/Utvikler
**Status:** Under utvikling

---

## Innholdsfortegnelse

1. [Oversikt](#1-oversikt)
2. [Testmiljø](#2-testmiljø)
3. [Datakontroll](#3-datakontroll)
4. [Valideringsregler](#4-valideringsregler)
5. [Brukergrensesnitt (UI)](#5-brukergrensesnitt-ui)
6. [Brukerflyt (UX)](#6-brukerflyt-ux)
7. [Edge Cases og Feilhåndtering](#7-edge-cases-og-feilhåndtering)
8. [Fremtidig brukertesting](#8-fremtidig-brukertesting)

---

## 1. Oversikt

### 1.1 Formål
Sikre at studieplanleggeren:
- Viser korrekte data fra API v2
- Validerer fagvalg korrekt iht. LK20 og skolens tilbud
- Gir tydelig tilbakemelding til bruker
- Fungerer for alle tre programområder ved BPG

### 1.2 Programområder som testes
| Program | ID | VG2 Blokker | VG3 Blokker | Valgfrie fag VG2 | Valgfrie fag VG3 |
|---------|-----|-------------|-------------|------------------|------------------|
| Studiespesialisering | `studiespesialisering` | 1, 2, 3, 4 | 1, 2, 3, 4 | 3 (420t) | 3 (420t) |
| Musikk, dans og drama | `musikk-dans-drama` | 1, 3 | 3, 4 | 1 (140t) | 1 (140t) + Historie |
| Medier og kommunikasjon | `medier-kommunikasjon` | 1, 3 | 2, 3, 4 | 1 (140t) | 2 (280t) + Historie |

### 1.3 Kritiske valideringsregler
1. **Historie VG3 er OBLIGATORISK** for alle programmer
2. **Spansk I+II VG3** er obligatorisk hvis elev ikke hadde fremmedspråk på ungdomsskolen
3. **Matematikk R1 erstatter 2P** (frigjør 84 timer)
4. **Fordypningskrav** (kun studiespesialisering): 2 fag nivå 2 på VG3
5. **Prerekvister**: R2 krever R1, Fysikk 2 krever Fysikk 1, etc.

---

## 2. Testmiljø

### 2.1 Oppsett

**Lokal testing:**
```bash
cd /Users/fredrik/Documents/school-data-project/repos/school-widgets
python3 -m http.server 8000
```

**Test-URLer:**
| Test | URL |
|------|-----|
| v2 API Test | http://localhost:8000/widgets/studieplanlegger/demo/test-v2-api.html |
| Demo (mock) | http://localhost:8000/widgets/studieplanlegger/demo/index.html |
| GitHub Test | http://localhost:8000/widgets/studieplanlegger/demo/github-test.html |

### 2.2 API-endepunkter
| Versjon | URL | Status |
|---------|-----|--------|
| v2 (ny) | `https://fredeids-metis.github.io/school-data/api/v2/schools/bergen-private-gymnas/studieplanlegger.json` | ✅ Live |
| v1 (legacy) | `https://fredeids-metis.github.io/school-data/api/v1/schools/bergen-private-gymnas/blokkskjema.json` | ✅ Live (IKKE RØR) |

---

## 3. Datakontroll

### 3.1 API v2 - Strukturkontroll

#### Metadata
- [ ] `metadata.version` === "v2"
- [ ] `metadata.school` === "bergen-private-gymnas"
- [ ] `metadata.generatedAt` er gyldig ISO-dato

#### School
- [ ] `school.id` === "bergen-private-gymnas"
- [ ] `school.name` === "Bergen Private Gymnas"
- [ ] `school.programs` inneholder 3 programmer
- [ ] Alle programmer har `active: true`

#### Blokkskjema struktur
- [ ] `blokkskjema.versjon` === "v2-experimental"
- [ ] `blokkskjema.struktur.antallBlokker` === 4
- [ ] `blokkskjema.blokker` inneholder blokk1, blokk2, blokk3, blokk4

### 3.2 Fagdata per blokk

#### Blokk 1
**Forventet VG2 (alle programmer):**
- [ ] Matematikk 2P (84t)
- [ ] Matematikk R1 (140t)
- [ ] Biologi 1 (140t)
- [ ] Økonomistyring (140t)
- [ ] Markedsføring og ledelse 1 (140t)
- [ ] Sosiologi og sosialantropologi (140t)
- [ ] Rettslære 2 (140t)
- [ ] Psykologi 1 (140t)
- [ ] Bilde (140t)

**Forventet VG3 (kun studiespesialisering):**
- [ ] Matematikk R2 (140t) - krever R1
- [ ] Historie VG3 (113t) - OBLIGATORISK

#### Blokk 2
**Forventet VG2 (kun studiespesialisering):**
- [ ] Matematikk 2P (84t)
- [ ] Matematikk R1 (140t)
- [ ] Kjemi 1 (140t)
- [ ] Entreprenørskap og bedriftsutvikling 1 (140t)
- [ ] Politikk og menneskerettigheter (140t)
- [ ] Rettslære 1 (140t)
- [ ] Grafisk design (140t)

**Forventet VG3 (studiespesialisering + medier):**
- [ ] Biologi 2 (140t) - anbefalt Biologi 1
- [ ] Markedsføring og ledelse 2 (140t) - krever M&L 1
- [ ] Psykologi 2 (140t) - anbefalt Psykologi 1
- [ ] Musikk fordypning 2 (140t) - kun musikk-elever
- [ ] Historie VG3 (113t) - OBLIGATORISK

#### Blokk 3
**Forventet VG2 (alle programmer):**
- [ ] Matematikk 2P (84t)
- [ ] Fysikk 1 (140t)
- [ ] Markedsføring og ledelse 1 (140t)
- [ ] Sosialkunnskap (140t)
- [ ] Rettslære 1 (140t)
- [ ] Musikk fordypning 1 (140t) - kun musikk-elever
- [ ] Grafisk design (140t)

**Forventet VG3 (alle programmer):**
- [ ] Fysikk 2 (140t) - krever Fysikk 1
- [ ] Entreprenørskap og bedriftsutvikling 2 (140t)
- [ ] Psykologi 2 (140t)
- [ ] Musikk fordypning 2 (140t) - kun musikk-elever
- [ ] Spansk I+II (140t) - betinget obligatorisk
- [ ] Historie VG3 (113t) - OBLIGATORISK

#### Blokk 4
**Forventet VG2 (kun studiespesialisering):**
- [ ] Matematikk 2P (84t)
- [ ] Fysikk 1 (140t)
- [ ] Biologi 1 (140t)
- [ ] Økonomi og ledelse (140t)
- [ ] Psykologi 1 (140t)

**Forventet VG3 (alle programmer):**
- [ ] Kjemi 2 (140t) - krever Kjemi 1
- [ ] Markedsføring og ledelse 2 (140t) - krever M&L 1
- [ ] Sosiologi og sosialantropologi (140t)
- [ ] Rettslære 2 (140t)
- [ ] Engelsk 1 (140t)
- [ ] Historie VG3 (113t) - OBLIGATORISK

### 3.3 Valgregler i API

#### Studiespesialisering
- [ ] `valgregler.studiespesialisering.vg2.minAntallFag` === 3
- [ ] `valgregler.studiespesialisering.vg2.maxAntallFag` === 3
- [ ] `valgregler.studiespesialisering.vg3.minAntallFag` === 3
- [ ] `valgregler.studiespesialisering.vg3.maxAntallFag` === 3
- [ ] VG3 har krav om `obligatorisk-fag: historie-vg3`
- [ ] VG3 har krav om `fordypning-krav` (280 timer)

#### Musikk, dans og drama
- [ ] `valgregler.musikk-dans-drama.vg2.minAntallFag` === 1
- [ ] `valgregler.musikk-dans-drama.vg2.maxAntallFag` === 1
- [ ] `valgregler.musikk-dans-drama.vg3.minAntallFag` === 2
- [ ] `valgregler.musikk-dans-drama.vg3.maxAntallFag` === 2
- [ ] VG2 tilgjengeligeBlokker === ["blokk1", "blokk3"]
- [ ] VG3 tilgjengeligeBlokker === ["blokk3", "blokk4"]

#### Medier og kommunikasjon
- [ ] `valgregler.medier-kommunikasjon.vg2.minAntallFag` === 1
- [ ] `valgregler.medier-kommunikasjon.vg2.maxAntallFag` === 1
- [ ] `valgregler.medier-kommunikasjon.vg3.minAntallFag` === 3
- [ ] `valgregler.medier-kommunikasjon.vg3.maxAntallFag` === 3
- [ ] VG2 tilgjengeligeBlokker === ["blokk1", "blokk3"]
- [ ] VG3 tilgjengeligeBlokker === ["blokk2", "blokk3", "blokk4"]

### 3.4 Prerekvister og eksklusjoner

#### Forutsetninger (krever)
- [ ] `matematikk-r2` krever `matematikk-r1`
- [ ] `fysikk-2` krever `fysikk-1`
- [ ] `kjemi-2` krever `kjemi-1`
- [ ] `markedsforing-og-ledelse-2` krever `markedsforing-og-ledelse-1`

#### Eksklusjoner
- [ ] Gruppen `[matematikk-r1, matematikk-r2, matematikk-2p]` er eksklusiv
- [ ] Feilmelding: "Du kan ikke kombinere R-matematikk (R1/R2) med 2P-matematikk"

#### Erstatter
- [ ] `matematikk-r1` erstatter `matematikk-2p` (frigjør 84 timer)

---

## 4. Valideringsregler

### 4.1 Timer-validering

#### Studiespesialisering

**VIKTIG: Matematikk-regel**
- Matematikk 2P (84t) er et FELLESFAG som kan erstattes av R1/S1
- R1/S1 er et PROGRAMFAG som kommer I TILLEGG til de 3 obligatoriske programfagene
- De 3 programfagene skal IKKE være matematikk (R1/S1 telles separat)
- Timetallet 840t er et MINSTEKRAV, ikke et maksimum

| Trinn | Fellesfag | Programfag | Totalt |
|-------|-----------|------------|--------|
| VG2 (med 2P) | 420t | 420t (3 fag) | 840t (minimum) |
| VG2 (med R1) | 336t | 560t (3 fag + R1) | 896t |
| VG3 | 421t | 420t | 841t |

**Test VG2 - UTEN R1/S1 (med 2P fellesfag):**
- [ ] 3 programfag á 140t = 420t → GYLDIG (minimum)
- [ ] 2 programfag á 140t = 280t → UGYLDIG (for lite)
- [ ] 4 programfag á 140t = 560t → UGYLDIG (uten R1 er det for mange)

**Test VG2 - MED R1/S1 (erstatter 2P):**
- [ ] R1 (140t) + 3 programfag (420t) = 560t → GYLDIG
- [ ] R1 (140t) + 2 programfag (280t) = 420t → UGYLDIG (mangler 1 programfag)
- [ ] R1 (140t) + 4 programfag (560t) = 700t → UGYLDIG (for mange)
- [ ] S1 (140t) + 3 programfag (420t) = 560t → GYLDIG

**Matematikk-eksklusjon:**
- [ ] R1 og 2P kan IKKE velges samtidig
- [ ] S1 og 2P kan IKKE velges samtidig
- [ ] R1 og S1 kan IKKE velges samtidig

**Test VG3:**
- [ ] Historie (113t) + 2 fordypningsfag (280t) + 1 valgfritt (140t) = 533t → Se fordypningskrav
- [ ] Uten historie → UGYLDIG

#### Musikk, dans og drama

**VIKTIG: Matematikk-regel gjelder også her**
- Det 1 valgfrie programfaget skal IKKE være matematikk
- R1/S1 kan velges I TILLEGG (erstatter 2P fellesfag)

| Trinn | Fellesfag | Felles prog. | Valgfrie | Totalt |
|-------|-----------|--------------|----------|--------|
| VG2 (med 2P) | 504t | 336t | 140t (1 fag) | 980t (minimum) |
| VG2 (med R1) | 420t | 336t | 280t (1 fag + R1) | 1036t |
| VG3 | 365t | 476t | 140t | 981t |

**Test VG2 - UTEN R1/S1:**
- [ ] 1 valgfritt programfag á 140t → GYLDIG (minimum)
- [ ] 0 valgfrie programfag → UGYLDIG
- [ ] 2 valgfrie programfag (uten R1) → UGYLDIG (for mange)

**Test VG2 - MED R1/S1:**
- [ ] R1 (140t) + 1 valgfritt programfag (140t) = 280t → GYLDIG
- [ ] R1 (140t) + 0 valgfrie programfag = 140t → UGYLDIG (mangler valgfritt fag)

**Test VG3:**
- [ ] Historie (113t) + 1 valgfritt (140t) = 253t → GYLDIG
- [ ] Uten historie → UGYLDIG
- [ ] Kun historie, 0 valgfrie → UGYLDIG

#### Medier og kommunikasjon

**VIKTIG: Matematikk-regel gjelder også her**
- Det 1 valgfrie programfaget (VG2) skal IKKE være matematikk
- R1/S1 kan velges I TILLEGG (erstatter 2P fellesfag)

| Trinn | Fellesfag | Felles prog. | Valgfrie | Totalt |
|-------|-----------|--------------|----------|--------|
| VG2 (med 2P) | 504t | 280t | 140t (1 fag) | 924t* (minimum) |
| VG2 (med R1) | 420t | 280t | 280t (1 fag + R1) | 980t |
| VG3 | 421t | 280t | 280t | 981t |

*Merknad: Kan variere noe pga kroppsøving-timer

**Test VG2 - UTEN R1/S1:**
- [ ] 1 valgfritt programfag á 140t → GYLDIG (minimum)
- [ ] 0 valgfrie programfag → UGYLDIG

**Test VG2 - MED R1/S1:**
- [ ] R1 (140t) + 1 valgfritt programfag (140t) = 280t → GYLDIG

**Test VG3:**
- [ ] Historie (113t) + 2 valgfrie (280t) = 393t → GYLDIG
- [ ] Uten historie → UGYLDIG
- [ ] Kun 1 valgfritt fag + historie → UGYLDIG (mangler 1 fag)

### 4.2 Obligatoriske fag

#### Historie VG3
- [ ] **Studiespesialisering VG3**: Historie SKAL velges i én av blokkene
- [ ] **Musikk VG3**: Historie SKAL velges i én av blokkene
- [ ] **Medier VG3**: Historie SKAL velges i én av blokkene
- [ ] Feilmelding vises hvis historie mangler
- [ ] Bruker kan ikke fullføre uten historie

#### Spansk I+II (betinget obligatorisk)
- [ ] Hvis fremmedspråk-filter = "Nei" → Spansk I+II er obligatorisk
- [ ] Spansk I+II reduserer valgfrie timer med 140t
- [ ] Tydelig melding til bruker om dette kravet

### 4.3 Fordypningskrav (kun studiespesialisering)

**Krav:** 2 fag nivå 2 (280 timer) på VG3

**Gyldige kombinasjoner:**
- [ ] R1 + R2 (matematikk fordypning)
- [ ] Fysikk 1 + Fysikk 2
- [ ] Biologi 1 + Biologi 2
- [ ] Kjemi 1 + Kjemi 2
- [ ] Markedsføring 1 + Markedsføring 2
- [ ] Psykologi 1 + Psykologi 2
- [ ] Entreprenørskap 1 + Entreprenørskap 2

**Ugyldige kombinasjoner:**
- [ ] Kun nivå 1-fag på VG3 → UGYLDIG
- [ ] Kun 1 nivå 2-fag på VG3 → UGYLDIG
- [ ] Feilmelding: "Du må ha fordypning i to fagområder"

### 4.4 Prerekvister

**Blokkerende prerekvister:**
| VG3 Fag | Krever fra VG2 | Feilmelding |
|---------|----------------|-------------|
| Matematikk R2 | Matematikk R1 | "For å velge Matematikk R2 må du ha hatt Matematikk R1 i VG2" |
| Fysikk 2 | Fysikk 1 | "For å velge Fysikk 2 må du ha hatt Fysikk 1 i VG2" |
| Kjemi 2 | Kjemi 1 | "For å velge Kjemi 2 må du ha hatt Kjemi 1 i VG2" |
| Markedsføring 2 | Markedsføring 1 | "For å velge Markedsføring og ledelse 2 må du ha hatt Markedsføring og ledelse 1 i VG2" |

**Test:**
- [ ] Velg R2 uten R1 → Feilmelding vises
- [ ] Velg R2 med R1 → OK
- [ ] Velg Fysikk 2 uten Fysikk 1 → Feilmelding vises
- [ ] Velg Kjemi 2 uten Kjemi 1 → Feilmelding vises

**Anbefalte prerekvister (ikke blokkerende):**
| VG3 Fag | Anbefalt fra VG2 | Advarsel |
|---------|------------------|----------|
| Biologi 2 | Biologi 1 | "Biologi 2 anbefales sammen med Biologi 1" |
| Psykologi 2 | Psykologi 1 | "Psykologi 2 anbefales sammen med Psykologi 1" |
| Rettslære 2 | Rettslære 1 | "Rettslære 2 anbefales sammen med Rettslære 1" |

- [ ] Velg Psykologi 2 uten Psykologi 1 → Advarsel (men tillatt)

### 4.5 Eksklusjoner

**Matematikk-konflikt:**
- [ ] Velg R1 → 2P blir utilgjengelig/grået ut
- [ ] Velg 2P → R1/R2 blir utilgjengelig/grået ut
- [ ] Feilmelding ved forsøk på ugyldig kombinasjon

**Matematikk R1 erstatter 2P:**
- [ ] Når R1 velges → 2P (fellesfag) markeres som "erstattet"
- [ ] Timeberegning oppdateres (84 timer frigjøres)

---

## 5. Brukergrensesnitt (UI)

### 5.1 Filter-seksjon

- [ ] Programområde-velger vises
- [ ] Alle 3 programmer er tilgjengelige (Studiespesialisering, Musikk, Medier)
- [ ] Fremmedspråk-filter vises ("Hadde du fremmedspråk på ungdomsskolen?")
- [ ] Standard-valg er fornuftig (Studiespesialisering, Ja)
- [ ] Endring av filter oppdaterer resten av UI

### 5.2 VG-kolonner

#### VG1-kolonne
- [ ] Header viser "VG1"
- [ ] Fellesfag vises (auto-populert)
- [ ] Fremmedspråk-valg fungerer
- [ ] Matematikk-valg (1P/1T) fungerer
- [ ] Obligatoriske programfag vises for Musikk/Medier

#### VG2-kolonne
- [ ] Header viser "VG2"
- [ ] Fellesfag vises (auto-populert)
- [ ] Programfag-slots vises (grå/klikbare)
- [ ] Riktig antall slots per program:
  - [ ] Studiespesialisering: 3 slots
  - [ ] Musikk: 1 slot
  - [ ] Medier: 1 slot
- [ ] Klikk på slot åpner blokkskjema-modal

#### VG3-kolonne
- [ ] Header viser "VG3"
- [ ] Fellesfag vises (auto-populert)
- [ ] Historie vises som obligatorisk/må velges
- [ ] Programfag-slots vises (grå/klikbare)
- [ ] Riktig antall slots per program:
  - [ ] Studiespesialisering: 3 slots
  - [ ] Musikk: 2 slots (1 valgfritt + historie)
  - [ ] Medier: 3 slots (2 valgfrie + historie)

### 5.3 Blokkskjema-modal

- [ ] Modal åpnes ved klikk på programfag-slot
- [ ] Riktige blokker vises basert på program og trinn
- [ ] Fag-bokser vises med:
  - [ ] Fagnavn
  - [ ] Timer
  - [ ] Eventuell prerekvitt-info
- [ ] Fag kan velges (toggle)
- [ ] Valgte fag markeres visuelt
- [ ] Bekreft-knapp finnes
- [ ] Avbryt-knapp finnes
- [ ] Modal lukkes ved bekreft/avbryt

### 5.4 Validerings-feedback

- [ ] Feilmeldinger vises tydelig (rød)
- [ ] Advarsler vises tydelig (gul/oransje)
- [ ] Suksess-meldinger vises (grønn)
- [ ] Feilmeldinger er på norsk
- [ ] Feilmeldinger er forståelige for elever

### 5.5 Responsivitet

- [ ] Desktop (1200px+): 3 kolonner side om side
- [ ] Tablet (768px-1199px): Tilpasset layout
- [ ] Mobil (<768px): 1 kolonne, vertikal scroll

---

## 6. Brukerflyt (UX)

### 6.1 Happy path - Studiespesialisering

**Scenario:** Elev med fremmedspråk fra ungdomsskolen velger realfag

1. [ ] Velg programområde: Studiespesialisering
2. [ ] Velg fremmedspråk: Ja
3. [ ] VG1: Velg matematikk (1T)
4. [ ] VG2: Klikk på første programfag-slot
5. [ ] Modal: Velg R1 fra Blokk 1
6. [ ] VG2: Klikk på andre programfag-slot
7. [ ] Modal: Velg Fysikk 1 fra Blokk 3
8. [ ] VG2: Klikk på tredje programfag-slot
9. [ ] Modal: Velg Biologi 1 fra Blokk 4
10. [ ] VG3: Klikk på første programfag-slot
11. [ ] Modal: Velg R2 fra Blokk 1 + Historie
12. [ ] VG3: Klikk på andre programfag-slot
13. [ ] Modal: Velg Fysikk 2 fra Blokk 3
14. [ ] VG3: Klikk på tredje programfag-slot
15. [ ] Modal: Velg Biologi 2 fra Blokk 2
16. [ ] Verifiser: Ingen feilmeldinger
17. [ ] Verifiser: Fordypningskrav oppfylt (R1→R2, Fysikk 1→2)

### 6.2 Happy path - Musikk

**Scenario:** Musikk-elev med fremmedspråk

1. [ ] Velg programområde: Musikk, dans og drama
2. [ ] Velg fremmedspråk: Ja
3. [ ] VG1: Velg matematikk (1P)
4. [ ] VG2: Klikk på programfag-slot
5. [ ] Modal: Kun Blokk 1 og 3 tilgjengelig
6. [ ] Velg Psykologi 1 fra Blokk 1
7. [ ] VG3: Klikk på første slot
8. [ ] Modal: Kun Blokk 3 og 4 tilgjengelig
9. [ ] Velg Historie (obligatorisk)
10. [ ] VG3: Klikk på andre slot
11. [ ] Velg valgfritt fag
12. [ ] Verifiser: Ingen feilmeldinger

### 6.3 Happy path - Medier

**Scenario:** Medie-elev uten fremmedspråk fra ungdomsskolen

1. [ ] Velg programområde: Medier og kommunikasjon
2. [ ] Velg fremmedspråk: Nei
3. [ ] Verifiser: Melding om Spansk I+II krav på VG3
4. [ ] VG1: Velg matematikk
5. [ ] VG2: Velg 1 programfag fra Blokk 1 eller 3
6. [ ] VG3: Velg Historie (obligatorisk)
7. [ ] VG3: Velg Spansk I+II (obligatorisk pga fremmedspråk=Nei)
8. [ ] VG3: Velg 1 valgfritt fag (280t - 140t Spansk = 140t igjen)
9. [ ] Verifiser: Spansk I+II telles mot valgfrie timer

### 6.4 Feilhåndtering - Prerekvitt mangler

1. [ ] Velg Studiespesialisering
2. [ ] VG2: Velg Biologi 1, Kjemi 1, Psykologi 1
3. [ ] VG3: Forsøk å velge Matematikk R2
4. [ ] Verifiser: Feilmelding "For å velge R2 må du ha hatt R1"
5. [ ] VG2: Endre ett fag til R1
6. [ ] VG3: Velg R2
7. [ ] Verifiser: Ingen feilmelding

### 6.5 Feilhåndtering - For få fag

1. [ ] Velg Studiespesialisering
2. [ ] VG2: Velg kun 2 fag
3. [ ] Forsøk å gå videre/bekrefte
4. [ ] Verifiser: Feilmelding om manglende fag

### 6.6 Feilhåndtering - Historie mangler

1. [ ] Velg et program
2. [ ] Fullfør VG2
3. [ ] VG3: Velg fag UTEN historie
4. [ ] Forsøk å bekrefte
5. [ ] Verifiser: Feilmelding "Du må velge Historie VG3"

---

## 7. Edge Cases og Feilhåndtering

### 7.1 API-feil

- [ ] Ingen nettverkstilgang → Fallback til mock data
- [ ] API returnerer 404 → Feilmelding til bruker
- [ ] API returnerer ugyldig JSON → Feilmelding til bruker
- [ ] Timeout → Retry eller feilmelding

### 7.2 Ugyldige tilstander

- [ ] Bruker endrer program etter å ha valgt fag → Reset valg eller advarsler
- [ ] Bruker endrer fremmedspråk-filter etter å ha valgt fag → Oppdater krav
- [ ] Bruker forsøker å velge fag som er utilgjengelig → Blokkert/grået ut

### 7.3 Browser-kompatibilitet

- [ ] Chrome (siste versjon)
- [ ] Firefox (siste versjon)
- [ ] Safari (siste versjon)
- [ ] Edge (siste versjon)
- [ ] iOS Safari
- [ ] Android Chrome

### 7.4 Tilgjengelighet (a11y)

- [ ] Tastaturnavigasjon fungerer
- [ ] Skjermleser kan lese innhold
- [ ] Fargekontrast er tilstrekkelig
- [ ] Focus-states er synlige

---

## 8. Fremtidig brukertesting

> **NB:** Denne seksjonen er for fremtidig referanse. Brukertesting med elever er IKKE aktuelt per nå.

### 8.1 Målgruppe
- VG1-elever som skal velge program
- VG2-elever som skal velge VG3-fag
- Foreldre/foresatte
- Rådgivere

### 8.2 Testscenarier for elever
1. Kan eleven forstå hvilke fag de må velge?
2. Forstår eleven prerekvitt-kravene?
3. Forstår eleven fordypningskravet?
4. Er feilmeldingene forståelige?
5. Klarer eleven å fullføre en gyldig plan?

### 8.3 Metrikker
- Tid til fullført plan
- Antall feilvalg før korrekt
- Forståelse av feilmeldinger (spørreundersøkelse)
- Generell brukertilfredshet

---

## 9. Testresultater (2025-11-21)

> **Testet via:** Nettleserkonsoll mot v2 API (GitHub Pages)
> **Testdata:** `https://fredeids-metis.github.io/school-data/api/v2/schools/bergen-private-gymnas/studieplanlegger.json`

### 9.1 Valgregler per program/trinn ✅

| Program | VG2 | VG3 | Status |
|---------|-----|-----|--------|
| Studiespesialisering | Min/Max: 3/3, Timer: 420, Blokker: 1-4 | Min/Max: 3/3, Timer: 420, Fordypning: 2 fag nivå 2 | ✅ |
| Musikk, dans og drama | Min/Max: 1/1, Timer: 140, Blokker: 1,3 | Min/Max: 2/2, Timer: 253, Blokker: 3,4 | ✅ |
| Medier og kommunikasjon | Min/Max: 1/1, Timer: 140, Blokker: 1,3 | Min/Max: 3/3, Timer: 393, Blokker: 2,3,4 | ✅ |

### 9.2 Forutsetninger (prerekvister) ✅

| Fag nivå 2 | Krever | Status |
|------------|--------|--------|
| matematikk-r2 | matematikk-r1 | ✅ |
| matematikk-s2 | matematikk-s1 | ✅ |
| fysikk-2 | fysikk-1 | ✅ |
| kjemi-2 | kjemi-1 | ✅ |
| markedsforing-og-ledelse-2 | markedsforing-og-ledelse-1 | ✅ |

**Merk:** Fag som biologi-2, psykologi-2, rettslare-2 har IKKE formelle forutsetninger iht. Udir.

### 9.3 Eksklusjoner ✅

| Kombinasjon | Resultat | Feilmelding |
|-------------|----------|-------------|
| R1 + S1 | ❌ Ekskludert | "Du kan ikke kombinere R-matematikk med S-matematikk" |
| R2 + S1 | ❌ Ekskludert | ✅ |
| R1 + 2P | ❌ Ekskludert | ✅ |
| S1 + 2P | ❌ Ekskludert | ✅ |

### 9.4 Simulerte fagvalg ✅

#### Normal elev (Studiespesialisering Realfag)
- **VG2:** biologi-1, kjemi-1, fysikk-1 + R1 = 560t ✅
- **VG3:** kjemi-2, fysikk-2, R2 + historie = 533t ✅
- **Fordypning:** 3 fagområder (Kjemi, Fysikk, Matte) ✅

#### Elev uten fremmedspråk fra ungdomsskolen
- **VG2:** psykologi-1, rettslare-1, sosialkunnskap + 2P = 504t ✅
- **VG3:** psykologi-2, rettslare-2 + Spansk I+II + historie = 533t ✅
- **Spansk-krav:** Korrekt identifisert og oppfylt ✅

#### Fordypning på tvers av år
- **VG2:** biologi-1, psykologi-1, okonomistyring + R1 (ingen fordypning innad) ✅
- **VG3:** biologi-2, psykologi-2, R2 (fordypning fra VG2→VG3) ✅
- **Prerekvister:** R2 krever R1 ✅, Bio/Psyk har ingen formell forutsetning ✅

### 9.5 Edge Cases og Feilhåndtering ✅

| Test | Forventet | Faktisk | Status |
|------|-----------|---------|--------|
| For få fag (2/3) | ❌ Avvist | ❌ "FOR FÅ FAG" | ✅ |
| For mange fag (4/3) | ❌ Avvist | ❌ "FOR MANGE FAG" | ✅ |
| For få timer (280/420) | ❌ Avvist | ❌ Feilmelding med timerkrav | ✅ |
| Mangler matematikk | ❌ Avvist | ❌ "Du må velge matematikk" | ✅ |
| VG3 uten historie | ❌ Avvist | ❌ "Historie VG3 er obligatorisk" | ✅ |
| R2 uten R1 | ❌ Avvist | ❌ Prerekvitt-feilmelding | ✅ |
| Fysikk 2 uten Fysikk 1 | ❌ Avvist | ❌ Prerekvitt-feilmelding | ✅ |

### 9.6 Konklusjon

**Alle tester bestått.** Data-handler.js og API v2 fungerer korrekt for:
- Alle tre programområder
- Begge trinn (VG2 og VG3)
- Prerekvister og eksklusjoner
- Edge cases og feilhåndtering
- Spesialtilfeller (elev uten fremmedspråk)

**Neste steg:** Widget UI-utvikling

---

## Endringslogg

| Dato | Versjon | Endring | Ansvarlig |
|------|---------|---------|-----------|
| 2025-11-21 | 1.0 | Opprettet dokument | Claude/Fredrik |
| 2025-11-21 | 1.1 | Lagt til testresultater fra konsoll-testing | Claude/Fredrik |

---

## Vedlegg

### A. Referansedokumenter
- `school-data/data/curriculum/REGLER.md` - Valideringsregler fra LK20
- `school-data/data/curriculum/TIMEFORDELING.md` - Timefordeling per program
- `school-data/data/schools/bergen-private-gymnas/blokkskjema_v2.yml` - Faktisk fagtilbud
- `school-widgets/widgets/studieplanlegger/SCOPE.md` - Widget-krav

### B. API v2 struktur
```javascript
{
  "metadata": { ... },
  "school": { ... },
  "blokkskjema": {
    "versjon": "v2-experimental",
    "struktur": { ... },
    "blokker": { ... }
  },
  "valgregler": {
    "studiespesialisering": { "vg2": {...}, "vg3": {...} },
    "musikk-dans-drama": { "vg2": {...}, "vg3": {...} },
    "medier-kommunikasjon": { "vg2": {...}, "vg3": {...} }
  },
  "regler": {
    "forutsetninger": [...],
    "eksklusjoner": [...],
    "erstatter": [...]
  },
  "timevalidering": { ... },
  "curriculum": { ... }
}
```

### C. Feilmeldinger (norsk)
| Kode | Melding |
|------|---------|
| ERR_PREREQ | "For å velge {fag} må du ha hatt {prerekvitt}" |
| ERR_EXCLUSION | "Du kan ikke kombinere {fag1} med {fag2}" |
| ERR_MIN_FAG | "Du må velge minst {antall} programfag" |
| ERR_MAX_FAG | "Du kan ikke velge mer enn {antall} programfag" |
| ERR_HISTORIE | "Du må velge Historie VG3" |
| ERR_SPANSK | "Du må velge Spansk I+II fordi du ikke hadde fremmedspråk på ungdomsskolen" |
| ERR_FORDYPNING | "Du må ha fordypning i to fagområder (to fag nivå 2)" |
| WARN_ANBEFALT | "{fag} anbefales sammen med {prerekvitt}" |
| INFO_ERSTATTER | "Matematikk R1 erstatter Matematikk 2P (fellesfag)" |
