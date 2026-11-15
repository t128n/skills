#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.12"
# dependencies = ["icalendar>=6.3,<7", "tzdata>=2025.2"]
# ///

import importlib.util
import unittest
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

from icalendar import Calendar

spec = importlib.util.spec_from_file_location("generate", Path(__file__).parents[1] / "scripts" / "generate.py")
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)


class GeneratorTests(unittest.TestCase):
    def event(self, **overrides):
        return {"summary": "Meeting, planning; review", "start": "2026-03-23T18:00:00", "end": "2026-03-23T19:00:00", **overrides}

    def test_weekly_local_time_and_alarm(self):
        raw = generator.generate({"events": [self.event(recurrence={"frequency": "weekly", "byday": ["MO"], "count": 3}, reminders=[15])]})
        calendar = Calendar.from_ical(raw)
        self.assertEqual(len(calendar.walk("VTIMEZONE")), 1)
        event = calendar.walk("VEVENT")[0]
        self.assertEqual(str(event["summary"]), "Meeting, planning; review")
        self.assertEqual(event.decoded("dtstart").utcoffset(), timedelta(hours=1))
        next_week = event.decoded("dtstart") + timedelta(days=7)
        self.assertEqual(next_week.hour, 18)
        self.assertEqual(next_week.utcoffset(), timedelta(hours=2))
        self.assertEqual(event["rrule"]["BYDAY"], ["MO"])
        self.assertEqual(event.walk("VALARM")[0].decoded("trigger"), timedelta(minutes=-15))
        self.assertIn(b"DTSTART;TZID=Europe/Berlin:", raw)

    def test_multiple_all_day_and_uid(self):
        raw = generator.generate({"events": [self.event(uid="existing@example.invalid"), {"summary": "Holiday", "start": "2026-12-25", "end": "2026-12-26"}]})
        events = Calendar.from_ical(raw).walk("VEVENT")
        self.assertEqual(str(events[0]["uid"]), "existing@example.invalid")
        self.assertEqual(events[1].decoded("dtstart"), date(2026, 12, 25))
        self.assertEqual(events[1].decoded("dtend"), date(2026, 12, 26))
        self.assertNotEqual(str(events[0]["uid"]), str(events[1]["uid"]))
        self.assertIsNotNone(events[0].decoded("dtstamp").tzinfo)

    def test_until_is_utc_for_timed_and_date_for_all_day(self):
        timed = self.event(recurrence={"frequency": "weekly", "until": "2026-04-06"})
        all_day = {"summary": "Holiday", "start": "2026-03-23", "end": "2026-03-24", "recurrence": {"frequency": "weekly", "until": "2026-04-06"}}
        events = Calendar.from_ical(generator.generate({"events": [timed, all_day]})).walk("VEVENT")
        self.assertEqual(events[0]["rrule"]["UNTIL"][0], datetime(2026, 4, 6, 21, 59, 59, tzinfo=timezone.utc))
        self.assertEqual(events[1]["rrule"]["UNTIL"][0], date(2026, 4, 6))

    def test_invalid_inputs(self):
        invalid = [
            self.event(start="2026-03-29T02:30:00", end="2026-03-29T03:30:00"),
            self.event(start="2026-10-25T02:30:00", end="2026-10-25T03:30:00"),
            self.event(end="2026-03-23T17:00:00"),
            self.event(start="2026-03-23T18:00:00Z"),
            self.event(timezone="Not/AZone"),
            self.event(reminders=[True]),
            self.event(recurrence={"frequency": "monthly"}),
            self.event(recurrence={"frequency": "weekly", "byday": ["TU"]}),
            self.event(recurrence={"frequency": "weekly", "count": 2, "until": "2026-04-01"}),
            self.event(unsupported="no"),
        ]
        for item in invalid:
            with self.subTest(item=item), self.assertRaises(ValueError):
                generator.generate({"events": [item]})
        with self.assertRaises(ValueError):
            generator.generate({"events": [self.event(uid="same"), self.event(uid="same")]})


if __name__ == "__main__":
    unittest.main()
