#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = ["icalendar>=6.3,<7", "tzdata>=2025.2"]
# ///

"""Generate an iCalendar file from the calendar skill's JSON contract."""

import argparse
import json
import sys
import uuid
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from icalendar import Alarm, Calendar, Event, Timezone

FIRST_YEAR = 1900
LAST_YEAR = 2100
DAYS = {"MO", "TU", "WE", "TH", "FR", "SA", "SU"}
EVENT_FIELDS = {"summary", "start", "end", "timezone", "description", "location", "uid", "reminders", "recurrence"}


def text(value, name):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} must be a nonempty string")
    return value


def integer(value, name, minimum):
    if isinstance(value, bool) or not isinstance(value, int) or value < minimum:
        raise ValueError(f"{name} must be an integer >= {minimum}")
    return value


def parse_date(value, name):
    text(value, name)
    try:
        parsed = date.fromisoformat(value)
        if parsed.isoformat() != value or not FIRST_YEAR <= parsed.year <= LAST_YEAR:
            raise ValueError()
        return parsed
    except ValueError:
        raise ValueError(f"{name} must be an ISO date between {FIRST_YEAR} and {LAST_YEAR}") from None


def local_datetime(value, name, zone):
    text(value, name)
    try:
        if "T" not in value:
            raise ValueError()
        parsed = datetime.fromisoformat(value)
        if parsed.tzinfo is not None or parsed.microsecond or not FIRST_YEAR <= parsed.year <= LAST_YEAR:
            raise ValueError()
    except ValueError:
        raise ValueError(f"{name} must be a local ISO datetime without an offset between {FIRST_YEAR} and {LAST_YEAR}") from None

    # A round trip detects gaps; distinct valid UTC instants detect overlaps.
    candidates = set()
    for fold in (0, 1):
        candidate = parsed.replace(tzinfo=zone, fold=fold)
        utc = candidate.astimezone(timezone.utc)
        if utc.astimezone(zone).replace(tzinfo=None) == parsed:
            candidates.add(utc)
    if len(candidates) != 1:
        raise ValueError(f"{name} is ambiguous or nonexistent in {zone.key}: {value}")
    return parsed.replace(tzinfo=zone)


def make_event(data, zones, stamp):
    if not isinstance(data, dict):
        raise ValueError("each event must be an object")
    unknown = data.keys() - EVENT_FIELDS
    if unknown:
        raise ValueError(f"unknown event fields: {', '.join(sorted(unknown))}")
    summary = text(data.get("summary"), "summary")
    start_raw, end_raw = data.get("start"), data.get("end")
    if not isinstance(start_raw, str) or not isinstance(end_raw, str):
        raise ValueError("start and end must be ISO date or local datetime strings")
    all_day = "T" not in start_raw
    if all_day != ("T" not in end_raw):
        raise ValueError("start and end must both be dates or both be datetimes")
    zone_name = text(data.get("timezone", "Europe/Berlin"), "timezone")
    try:
        zone = ZoneInfo(zone_name)
    except (ZoneInfoNotFoundError, ValueError):
        raise ValueError(f"unknown timezone: {zone_name}") from None
    if all_day:
        start, end = parse_date(start_raw, "start"), parse_date(end_raw, "end")
    else:
        start, end = local_datetime(start_raw, "start", zone), local_datetime(end_raw, "end", zone)
        zones[zone_name] = zone
    if end <= start or (not all_day and end.astimezone(timezone.utc) <= start.astimezone(timezone.utc)):
        raise ValueError("end must be after start")

    event = Event()
    event.add("summary", summary)
    event.add("dtstart", start)
    event.add("dtend", end)
    event.add("uid", text(data["uid"], "uid") if "uid" in data else f"{uuid.uuid4()}@calendar.invalid")
    event.add("dtstamp", stamp)
    for field in ("description", "location"):
        if field in data:
            event.add(field, text(data[field], field))

    if "recurrence" in data:
        recurrence = data["recurrence"]
        if not isinstance(recurrence, dict) or recurrence.keys() - {"frequency", "interval", "byday", "count", "until"}:
            raise ValueError("recurrence must be an object with supported fields only")
        if recurrence.get("frequency") != "weekly":
            raise ValueError("only weekly recurrence is supported")
        rule = {"freq": "weekly"}
        if "interval" in recurrence:
            rule["interval"] = integer(recurrence["interval"], "interval", 1)
        if "byday" in recurrence:
            days = recurrence["byday"]
            if not isinstance(days, list) or not days or any(not isinstance(day, str) or day not in DAYS for day in days) or len(set(days)) != len(days):
                raise ValueError("byday must be a nonempty list of distinct weekday codes")
            if ("MO", "TU", "WE", "TH", "FR", "SA", "SU")[start.weekday()] not in days:
                raise ValueError("byday must include the start date's weekday")
            rule["byday"] = days
        if "count" in recurrence and "until" in recurrence:
            raise ValueError("recurrence cannot have both count and until")
        if "count" in recurrence:
            rule["count"] = integer(recurrence["count"], "count", 1)
        if "until" in recurrence:
            until = parse_date(recurrence["until"], "until")
            if until < (start if all_day else start.date()):
                raise ValueError("until must not precede start")
            # RFC 5545 requires a UTC UNTIL for a timezone-aware DTSTART.
            rule["until"] = until if all_day else datetime.combine(until, time.max, zone).astimezone(timezone.utc).replace(microsecond=0)
        event.add("rrule", rule)

    reminders = data.get("reminders", [])
    if not isinstance(reminders, list):
        raise ValueError("reminders must be a list of minutes")
    for minutes in reminders:
        integer(minutes, "reminder", 0)
        alarm = Alarm()
        alarm.add("action", "DISPLAY")
        alarm.add("description", summary)
        alarm.add("trigger", -timedelta(minutes=minutes))
        event.add_component(alarm)
    return event


def generate(data):
    if not isinstance(data, dict) or set(data) != {"events"} or not isinstance(data["events"], list) or not data["events"]:
        raise ValueError("input must be an object containing a nonempty events array")
    zones = {}
    stamp = datetime.now(timezone.utc)
    events = [make_event(item, zones, stamp) for item in data["events"]]
    uids = [str(event["uid"]) for event in events]
    if len(set(uids)) != len(uids):
        raise ValueError("event UIDs must be unique within a file")
    calendar = Calendar()
    calendar.add("prodid", "-//Calendar Skill//Calendar//EN")
    calendar.add("version", "2.0")
    for zone in zones.values():
        calendar.add_component(Timezone.from_tzinfo(zone, first_date=date(FIRST_YEAR, 1, 1), last_date=date(LAST_YEAR, 12, 31)))
    for event in events:
        calendar.add_component(event)
    result = calendar.to_ical()
    parsed = Calendar.from_ical(result)
    if len(parsed.walk("VEVENT")) != len(events):
        raise ValueError("serialized calendar failed validation")
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="UTF-8 JSON input")
    parser.add_argument("output", type=Path, help="destination .ics file")
    args = parser.parse_args()
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        result = generate(data)
        if args.input.resolve() == args.output.resolve():
            raise ValueError("input and output paths must differ")
        args.output.write_bytes(result)
    except (OSError, ValueError, OverflowError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1
    print(f"Wrote {args.output}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
