Plan — Dodanie listy uczestników do kart zajęć

Cel:
- Wyświetlić na karcie każdej aktywności listę uczestników (bulleted list), ładnie sformatowaną i bezpieczną.

Kroki implementacji:
1. Drobne przygotowania
   - Dodać pomocniczą funkcję `escapeHtml` w `src/static/app.js` by uniknąć XSS.

2. Zmiana renderowania kart w `src/static/app.js`
   - Zamiast bezpośredniego użycia `details.participants.length`, utworzyć `participantsArr = Array.isArray(details.participants) ? details.participants : []`.
   - Obliczyć `spotsLeft` z defensywną walidacją `max_participants`.
   - Zbudować HTML sekcji uczestników:
     - Pokaż do N (np. 3) pierwszych uczestników jako listę punktowaną (`<ul class="participants-list">`).
     - Jeżeli jest więcej — dodać element „and X more” z klasą `.more`, który po kliknięciu rozwija pełną listę (toggle klasy `expanded` na `.activity-card`).
     - Jeżeli brak uczestników — pokazać stylizowany komunikat `No participants yet` (`.participants-empty`).
   - Używać `escapeHtml` dla wszystkich wstrzykiwanych tekstów (nazwa aktywności, opis, uczestnicy).

3. Stylowanie w `src/static/styles.css`
   - Dodać reguły:
     - `.participants-list` — odstępy, mniejsza czcionka, max-height z `overflow:hidden`.
     - `.participant-pill` — opcjonalne (jeżeli chcemy pigułkowy wygląd).
     - `.participants-empty` — kursywa i przygaszony kolor.
     - `.participants-list .more` — niebieski, klikalny wygląd.
     - `.activity-card.expanded .participants-list` — usuń ograniczenie wysokości.

4. Opcjonalne poprawki po stronie serwera (`src/app.py`)
   - Normalizować e‑maile (`.strip().lower()`), odrzucać duplikaty i sprawdzać `max_participants` przed dodaniem.
   - Zwracać sensowne błędy (400) przy duplikacie lub pełnej liście.

5. Testy i walidacja
   - Uruchomić serwer i otworzyć `http://localhost:5000`.
   - Sprawdzić: brak błędów JS w konsoli, poprawne wyświetlanie listy, toggle "and X more", zachowanie przy pustej liście.
   - Testować edge cases: brak pola `participants`, długie listy, złośliwe ciągi tekstowe.

6. Commit i opis
   - Stworzyć commit z nazwą typu: `feat(ui): show participants on activity cards`.
   - Dodać krótki opis zmian i ewentualne notatki dotyczące migracji danych.

Przykładowe fragmenty kodu (do wklejenia):
- `escapeHtml` helper (JS):
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

- Budowa participants HTML (pseudokod):
const participantsArr = Array.isArray(details.participants) ? details.participants : [];
const maxShow = 3;
const visible = participantsArr.slice(0, maxShow);
const remaining = participantsArr.length - visible.length;
const participantsHtml = visible.length
  ? `<ul class="participants-list">${visible.map(p => `<li>${escapeHtml(p)}</li>`).join('')}${remaining>0?`<li class="more">and ${remaining} more</li>`:''}</ul>`
  : `<p class="participants-empty">No participants yet</p>`;

Następne kroki (mogę wykonać od razu):
- Wprowadzić zmiany w `src/static/app.js` i `src/static/styles.css` oraz przetestować lokalnie.
- Opcjonalnie poprawić `src/app.py` aby zapobiec podwójnym zapisom.

--
Plik ten jest draftem planu; jeśli chcesz, wprowadzę zmiany automatycznie teraz.