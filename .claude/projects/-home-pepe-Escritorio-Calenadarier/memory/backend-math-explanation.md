---
name: backend-math-explanation
description: Explanation of the date handling and availability logic in the Calenadarier backend
metadata:
  type: reference
---

# Backend Math & Availability Logic (Calenadarier)

This document explains how the backend handles date‑related calculations, availability creation/batch updates, and clearing operations. The code lives in:

* `src/app/api/calendars/[slug]/availability/route.ts` – single‑day availability
* `src/app/api/calendars/[slug]/batch/route.ts` – range‑based availability (insert or clear)
* `src/lib/constants.ts` – date‑formatting helpers (`MONTH_SHORT`, `fmtDate`, etc.)
* `src/lib/validate.ts` – Zod schemas for input validation

---

## 1. Common date helpers

### `fmtDate` (used in `SetupView.tsx` and elsewhere)

```ts
function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00"); // use noon to avoid TZ shift when extracting date parts
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth() + 1]}`;
}
```

* Adding `T12:00:00` guarantees that the date component is interpreted in UTC‑local time without being shifted by the browser’s timezone when we later call `getDate()` / `getMonth()`.  
* The function returns a string like `"5 Jul"` (day + abbreviated month).

### Month arrays

* `MONTH_SHORT[1] = "Ene"` … `MONTH_SHORT[12] = "Dic"` – used for UI labels and for formatting dates in the UI.

---

## 2. Single‑day availability (`POST /api/calendars/[slug]/availability`)

**Schema (`availabilitySchema`)**

```zod
{
  person_id: string (uuid),
  date: string ( ISO‑8601, e.g. "2026-07-15" ),
  code: string | null   // null means “free / no code”
}
```

**Handler flow**

1. **Validate** the payload with `validate(availabilitySchema, body)`.
2. **Lookup** the calendar via `requireCalendarAccess(slug, session)`.
3. **Upsert** into the `availability` table:

```ts
const { error } = await supabase
  .from("availability")
  .upsert(
    { person_id, date, code }, // unique constraint: (person_id, date)
    { onConflict: ["person_id", "date"] }
  );
```

*The `upsert` with `onConflict` means that if a row for the same person & date already exists, its `code` column is replaced with the new value (or set to `null`).*  
No extra math is needed – the date string is stored as‑is (ISO `YYYY‑MM‑DD`).  

---

## 3. Batch availability (`POST /api/calendars/[slug]/batch`)

Used for two operations:

* **Assign a code to a range of days** (when `code` is present)  
* **Clear a range of days** (when `code` is `null`)

**Schema (`batchAvailabilitySchema`)**

```zod
{
  person_id: string (uuid),
  code: string | null,
  start_date: string (ISO),
  end_date: string (ISO)
}
```

**Math – generating the date list**

```ts
const start = new Date(startDate + "T00:00:00Z");
const end   = new Date(endDate   + "T00:00:00Z");
const days = [];
let cur = new Date(start);
while (cur <= end) {
  days.push(cur.toISOString().slice(0, 10)); // "YYYY-MM-DD"
  cur.setDate(cur.getDate() + 1);           // add one day (handles month/year rollover)
}
```

* The dates are forced to UTC (`T00:00:00Z`) so that adding 24 h via `setDate` never jumps across a DST boundary incorrectly.  
* `toISOString().slice(0,10)` extracts just the `YYYY-MM-DD` part for storage.

**Upsert loop**

```ts
for (const d of days) {
  await supabase.from("availability").upsert(
    { person_id, date: d, code },
    { onConflict: ["person_id", "date"] }
  );
}
```

* If `code` is `null`, the row’s `code` column becomes `NULL`, effectively marking the day as “free”.

**Error handling** – any failure jumps to the `catch` block and returns a generic 500 response (the route swallows the error to avoid leaking DB details).

---

## 4. Clearing all availability for a calendar (`DELETE /api/calendars/[slug]/clear`)

No date math is needed here – the request simply deletes every row whose `calendar_id` matches the calendar:

```ts
const { error } = await supabase
  .from("availability")
  .delete()
  .eq("calendar_id", calendar.id);
```

* This operation is used when a user wants to wipe the whole slate (e.g., “Reset availability” button).

---

## 5. Validation & safety notes

* **Zod schemas** guarantee that `person_id` is a valid UUID and that date strings are non‑empty.  
* The backend trusts the `date` strings supplied by the client; they are expected to be in ISO `YYYY‑MM‑DD` format (no time‑DD` without time‑zone offset). By appending `T00:00:00Z` (batch) or `T12:00:00` (single‑day formatting) we avoid accidental timezone shifts when extracting day/month values for UI display.  
* The `ON CONFLICT (`person_id`, `date`)` clause guarantees at most one row per person per day, preventing duplicate entries.

---

## 6. Summary of the “math”

| Operation | What is computed | How |
|-----------|------------------|-----|
| **Single‑day set/clear** | Just the given date string | Passed through unchanged (stored as ISO date) |
| **Batch set/clear** | List of every date from `start_date` to `end_date` inclusive | Loop: start at midnight UTC, add one day (`setDate(date+1)`) until passing end date |
| **Display formatting** | `DD Mon` (e.g., `5 Jul`) | `new Date(iso + "T12:00:00")` → `getDate()` + `MONTH_SHORT[month]` |
| **Clear all** | No date math – bulk delete by `calendar_id` | Direct Supabase delete |

These calculations are deliberately simple and deterministic, relying on JavaScript’s `Date` arithmetic (with UTC anchoring) to avoid off‑by‑one errors caused by time‑zones or daylight‑saving changes.

---

**References in the codebase**

* `src/lib/constants.ts` – `MONTH_SHORT`, `fmtDate`‑style usage in UI.
* `src/app/api/calendars/[slug]/availability/route.ts` – single‑day upsert.
* `src/app/api/calendars/[slug]/batch/route.ts` – date‑range generation and upsert/clear loop.
* `src/lib/validate.ts` – `availabilitySchema` and `batchAvailabilitySchema`.
* `supabase/schema.sql` (see `datos/` folder) – unique constraint on `availability (person_id, date)`.

--- 

*This explanation covers the arithmetic and logical steps the backend performs when handling availability, ensuring correct date ranges, safe upserts, and proper UI‑friendly formatting.*