# STUDIEPLANLEGGER - TODO / FIXES

> **Dette dokumentet leses av Claude ved oppstart.**
> Legg til punkter her for ting som skal fikses eller forbedres.

---

## Bugs / Feil som må fikses

- [ ] _Legg til bugs her..._

---

## Forbedringer / Ønsker

- [ ] _Legg til forbedringer her..._

---

## Testing som må gjøres

- [ ] Test at R1 + R2 fungerer uten konflikt
- [ ] Test at R1 + S1 blokkeres korrekt
- [ ] Test at forutsetninger (Fysikk 2 krever Fysikk 1) viser warning i VG3
- [ ] Test fordypning-beregning (560t fra 2 fagområder)
- [ ] Test Spansk I+II validering når harFremmedsprak=false

---

## Sist oppdatert

**Dato:** 2024-11-21

**Siste endringer:**
- Fikset konfliktGrupper-format for matematikk-eksklusjoner (R1+R2 OK, R+S blokkert)
- Lagt til visning av forslag fra API i feilmeldinger
- Forbedret CSS for warnings (.missing-prerequisite)
- Lagt til Spansk-validering for VG3 når harFremmedsprak=false

---

## Arkitektur-notater

- **Regler lastes fra API:** `https://fredeids-metis.github.io/school-data/api/v1/curriculum/regler.json`
- **Single Source of Truth:** `school-data/data/curriculum/regler.yml`
- **ValidationService:** Henter regler ved init(), har fallback hvis API feiler
