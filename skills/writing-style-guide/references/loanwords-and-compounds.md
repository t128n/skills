# Loanwords & Compounds Reference (English in German Prose)

German technical documentation regularly uses English terms alongside German grammar. Without explicit rules in the glossary, different authors will guess different articles, plurals, and hyphenation.

## 1. Decide: translate or keep English?

Use the glossary to settle this once per concept:

- **Translate** when an established, unambiguous German term exists and matches the UI (for example *access control* → *die Zugriffskontrolle*, *setting* → *die Einstellung*).
- **Keep English** when the German translation sounds artificial, obscures a widely used industry term, or diverges from the UI/domain (for example *das Deployment*, *der Webhook*, *der Workspace*).
- **Never mix arbitrarily:** Do not write *Workspace* in one paragraph and *Arbeitsbereich* in the next. Record the rejected form in `Do not use`.

## 2. Record article and plural for every noun

German readers and authors need the grammatical gender (`der`, `die`, `das`) and plural form for English nouns used in German sentences.

| Pattern | Example | How to record in `Deutsch` |
|---|---|---|
| Masculine (`der`) | *der Workspace*, *der Endpoint*, *der Branch* | `der Workspace (Pl. Workspaces)` |
| Feminine (`die`) | *die Pipeline*, *die Session*, *die Query* | `die Pipeline (Pl. Pipelines)` |
| Neuter (`das`) | *das Deployment*, *das Token*, *das Repository* | `das Deployment (Pl. Deployments)` |

If Duden or team convention allows two genders (for example *der* vs *das* Filter, *der* vs *das* Event), pick one in the glossary and note the rejected article in `Notes` or `Do not use`.

## 3. Hyphenate mixed compounds consistently

When combining an English loanword or acronym with a German noun, use a hyphen (`Durchkopplung`) so the boundary stays readable:

| English | Preferred German compound | Avoid |
|---|---|---|
| API key | `der API-Schlüssel` | `API Schlüssel`, `APISchlüssel` |
| build pipeline | `die Build-Pipeline` | `Build Pipeline`, `Buildpipeline` |
| error log | `das Error-Log` (or `das Fehlerprotokoll`) | `Error Log` |
| webhook URL | `die Webhook-URL` | `Webhook URL` |
| access token | `das Access-Token` (or `das Zugriffstoken`) | `Access Token` |

Three-part compounds also stay hyphenated throughout: `CI/CD-Pipeline-Konfiguration`, `API-Schlüssel-Verwaltung`.

## 4. Verbs and adjectives from English stems

Avoid awkward Denglish verbs when a clean German verb exists:

- Prefer *einen Branch erstellen* or *deployen* only if the team explicitly accepts it; otherwise *bereitstellen*, *ausrollen*, or *aktualisieren*.
- If an English verb is accepted (such as *deployen*, *mergen*, *pushen*), note its participle in `Notes` (for example `Partizip: gemergt / deployed — avoid "gemerged"`).

## 5. Code identifiers and UI labels

- **Code stays verbatim:** Function names, CLI commands, config keys, and log strings stay in backticks in their original English spelling (`git checkout`, `skills.lock.json`, `--dry-run`). Do not inflect code identifiers in German prose (write `die Option --dry-run`, not `das --dry-run-Flag` unless needed for clarity).
- **UI labels match the active UI language:** If the UI is localized into German, the glossary's `Deutsch` column must match the exact German UI string and note `(matches UI label)` in `Notes`. If the UI is English-only, quote the English UI label verbatim even in German docs.
