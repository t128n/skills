---
name: calendar
description: Create validated iCalendar (.ics) files for import into calendar apps. Use when a user asks to create calendar events, appointments, reminders, recurring schedules, or an ICS file.
---

# Calendar files

Convert the user's request into structured event data and use `scripts/generate.py` to serialize it. Do not hand-write iCalendar syntax. The script requires `uv`; its inline metadata installs the Python dependencies when needed. Run it with `uv run --script <skill-directory>/scripts/generate.py <input.json> <output.ics>`.

## Workflow

1. Determine each event's title, date, start and end, and any explicitly requested recurrence or reminders. Ask when a date, time, duration, recurrence, or reminder is ambiguous; do not invent them. Resolve relative dates against the current date. Default the timezone to `Europe/Berlin` unless the user specifies another IANA timezone.
2. Write a UTF-8 JSON input file using the contract below and run the generator. Fix invalid input or ask the user for clarification. The generator validates inputs and reparses the result, but cannot guarantee that a particular calendar supports every property.
3. Deliver the `.ics` file and summarize its events and timezone. Explain that the user can import it into a compatible calendar app. Import is one-way, not synchronization; changes made in the calendar app are not visible to the agent. Avoid promising that a re-import will update an existing event, since behavior varies by app.

For an update, use the original event UID supplied by the user or obtained from the existing ICS file. If it is unavailable, ask rather than silently create a different event. Preserve it in `uid`. New events receive unique UIDs; retain the generated file if a later update may be needed.

## Input contract

The root object contains an `events` array. Every event has `summary`, `start`, and `end`. Timed values are local ISO 8601 datetimes without an offset, e.g. `2026-11-09T18:00:00`; set `timezone` to an IANA name when it differs from the default. All-day values are ISO dates, e.g. `2026-11-09`. An all-day `end` is **exclusive**: a one-day event on November 9 ends on November 10. Timed and all-day values cannot be mixed.

Optional fields: `description`, `location`, `uid`, `reminders` (a list of nonnegative integer minutes before the event), and `recurrence`. Recurrence is weekly only: `{"frequency":"weekly", "interval":1, "byday":["MO"], "count":10}`. `interval`, `byday`, and `count` are optional; `until` is an inclusive ISO date and is an alternative to `count`. Omit both for an ongoing series. Do not silently approximate unsupported recurrence rules or exceptions.

Example:

```json
{
  "events": [{
    "summary": "Weekly meeting",
    "start": "2026-11-09T18:00:00",
    "end": "2026-11-09T19:00:00",
    "timezone": "Europe/Berlin",
    "recurrence": {"frequency": "weekly", "byday": ["MO"]},
    "reminders": [15]
  }]
}
```

The generator includes timezone transitions from 1900 through 2100. For events or recurrence end dates outside that range, use another solution; ongoing series may need a refreshed timezone definition after 2100. A recurring local time that becomes ambiguous or nonexistent on a later daylight-saving transition may be interpreted differently by calendar applications; flag this possibility to the user when applicable.
