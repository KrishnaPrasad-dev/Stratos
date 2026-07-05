import unittest

from scraper_service import generate_fallback_events


class ScraperServiceTests(unittest.TestCase):
    def test_fallback_events_include_competitor_names(self):
        events = generate_fallback_events(["Nexa", "Orbit"], "Stratos")

        self.assertEqual(len(events), 2)
        self.assertTrue(all("Nexa" in event["label"] or "Orbit" in event["label"] for event in events))
        self.assertTrue(all(event["category"] == "Event" for event in events))


if __name__ == "__main__":
    unittest.main()
