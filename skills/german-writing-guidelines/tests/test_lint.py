import os
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "scripts"))
import lint  # noqa: E402


def findings(text):
    with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as fh:
        fh.write(text)
    try:
        return lint.lint(fh.name)
    finally:
        os.unlink(fh.name)


def messages(text):
    return [m for _, _, m in findings(text)]


class LintTest(unittest.TestCase):
    def test_clean_document(self):
        self.assertEqual(findings("# Sandbox einrichten\n\nDu legst eine Sandbox an.\n\n- Datei: 64 KB\n"), [])

    def test_typography(self):
        out = "\n".join(messages("# T\n\nEin Satz — mit Strich und ... Punkten, 64KB und 99%.\n"))
        self.assertIn("Geviertstrich", out)
        self.assertIn('"..."', out)
        self.assertIn("Einheit ohne Leerzeichen", out)

    def test_code_is_skipped(self):
        text = "# T\n\n```bash\necho \"einfach — 64KB\"\n```\n\nText mit `einfach` im Code.\n"
        self.assertEqual(messages(text), [])

    def test_fence_without_language_and_long_block(self):
        body = "\n".join("x" for _ in range(30))
        out = "\n".join(messages(f"# T\n\n```\n{body}\n```\n"))
        self.assertIn("ohne Sprachangabe", out)
        self.assertIn("über 25 Zeilen", out)

    def test_du_sie_switch(self):
        out = "\n".join(messages("# T\n\nDu klickst dort.\n\nWenn Sie fertig sind, gehen Sie weiter.\n"))
        self.assertIn("Wechsel zwischen du", out)

    def test_hard_wrap_and_rule(self):
        out = "\n".join(messages("# T\n\nErste Zeile\nzweite Zeile\n\n---\n"))
        self.assertIn("hart umbrochener Absatz", out)
        self.assertIn("horizontale Linie", out)

    def test_frontmatter_is_skipped(self):
        self.assertEqual(messages("---\ntitle: einfach — gut\n---\n\n# T\n"), [])

    def test_bare_url_and_link_text(self):
        out = "\n".join(messages("# T\n\nSiehe https://example.com und [hier](https://example.com).\n"))
        self.assertIn("nackte URL", out)
        self.assertIn("Linktext", out)

    def test_exit_code(self):
        with tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8") as fh:
            fh.write("# T\n\nDas ist einfach.\n")
        try:
            script = os.path.join(HERE, "..", "scripts", "lint.py")
            r = subprocess.run([sys.executable, script, fh.name], capture_output=True, text=True)
            self.assertEqual(r.returncode, 1)
            self.assertIn("[S]", r.stdout)
        finally:
            os.unlink(fh.name)


if __name__ == "__main__":
    unittest.main()
