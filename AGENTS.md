# AGENTS.md

Context for any AI coding agent working in this repository — OpenAI Codex / ChatGPT coding
agents, Claude Code, Cursor, GitHub Copilot, Gemini CLI, or anything else.

**This file is the single source of truth.** `CLAUDE.md`, `GEMINI.md`,
`.github/copilot-instructions.md` and `.cursor/rules/` are thin pointers that redirect
here, because each tool only reads its own filename. Put changes in this file, not in the
pointers.

## What this is

A static Turkish-language marketing site for **Küme Eğitim Kurumları**, a dershane
(exam-prep school) in Ankara Kızılay, founded 1997. Live at **https://kumeegitim.com**
via GitHub Pages. The end users are the school's owners and prospective students/parents.

`README.md` is the operating manual written for the school owner (how to use the admin
panel, how the domain is wired) and is current — read it for that side; this file covers
architecture and constraints.

Hand-written HTML + vanilla JS + Tailwind via CDN. **There is no build step, no
package.json, no test framework, and no backend.** Files are served exactly as they sit
in the repo. Do not introduce a bundler, framework, or npm dependency without being asked —
the no-build constraint is deliberate so the non-technical owner can be handed the repo.

## Working on it

```bash
python3 -m http.server 8000        # yerel önizleme → http://localhost:8000
```

Deployment: **push to `main` and GitHub Pages publishes within 1–2 minutes.** There is no
CI, no staging branch, and no PR flow. The user's standing instruction is to commit and
push changes directly to `main` without asking for approval.

There are no automated tests in the repo. Verification is done ad hoc with Playwright
against a local `http.server`; see "Testing notes" below for the constraints that trip
tests up in this sandbox.

## Language and audience

**All user-facing text, commit messages and code comments are Turkish.** Match that.
Identifier names in JS are also Turkish (`veri`, `haberler`, `dosyaYaz`, `kucult`,
`programCiz`) — keep new code consistent rather than mixing in English names.

## Architecture

### Pages

16 HTML files at the repo root, each fully self-contained (shared `<head>`, header and
footer are **copy-pasted, not templated**). A change to navigation, footer, or `<head>`
must be applied to all of them — script it rather than editing by hand.

Programs are organised **by grade level, not by exam type**. This was an explicit redesign;
do not reintroduce TYT/AYT/LGS as top-level categories:

| Page | Program |
|---|---|
| `sinif-8.html` | 8. Sınıf · LGS Hazırlık |
| `sinif-9/10/11.html` | Akademik Gelişim Programı |
| `sinif-12.html`, `mezun.html` | YKS (TYT–AYT) Hazırlık |

Plus `index`, `kurslar`, `hakkimizda`, `basarilarimiz`, `haberler`, `sss`, `iletisim`,
`gizlilik` (KVKK), `admin`, `404`.

### JavaScript

Each file in `assets/js/` is a standalone IIFE that finds its own hook element and exits
if absent. There is no module system and no shared runtime.

- `main.js` — mobile menu, scroll reveal, FAQ accordion, counters, and the auto-updating
  year values (see below)
- `chatbot.js` — the Turkish assistant (see below)
- `haberler.js` — renders `#haber-listesi` (list, or detail when `?id=` is present) and
  `#son-haberler` (latest 3 on the homepage) from `data/haberler.json`
- `program.js` — on class pages, reads `data/programlar.json` and injects the schedule
  image into `#ders-programi`; **removes the entire section when no image is set**
- `form.js` — contact form; see below
- `admin.js` — the admin panel
- `tw-config.js` — Tailwind theme; must load immediately after the Tailwind CDN script

### Cache busting

CSS/JS are referenced with `?v=N`. **When you edit a JS or CSS file you must bump `?v=` on
every page that loads it**, or returning visitors keep the old cached copy. This has already
caused one "you didn't add the feature" false alarm. Versions drift per file (currently
`chatbot.js?v=16`, `form.js?v=14`, most others `v=13`) — that is expected, not a bug.

### Auto-updating values

Never hard-code the academic year or the years-in-business; `main.js` computes them:

- `[data-academic-year]` → rolls over in **February** (`d.getMonth() >= 1`), so Feb 2027
  starts showing "2027–2028"
- `[data-years-since="1997"]` and `[data-count-year="1997"]` → current year minus 1997.
  Note `data-count-year` animates to the **age** (29), not to the year 1997.

### The assistant (`chatbot.js`)

Rule-based, not an LLM — a static site cannot hold an API key. It normalises Turkish text
(İ/ı, ş, ğ, ü, ö, ç stripped to ASCII) and scores intents by weighted substring match:

```js
sc += key.length * a;   // a = intent weight
```

Two rules matter when editing `INTENTS`:

1. **Set the weight `a`.** Class-specific and `gizlilik` intents use `a: 3`, `kayit`/`ucret`
   use `a: 2`, general ones default to 1. Without weights, a long generic keyword beats a
   short specific one — this is why "kvkk metniniz nerede" once returned the address
   (`nerede` 6 chars > `kvkk` 4 chars).
2. **Keys must be stems, written in normalised form.** Write `basvur`, not `basvuru`, so
   "başvurabilirim" matches. Remember normalisation runs first: "sıkça" becomes `sikca`,
   so a key of `sik sorulan` will *not* match it.

The generic program intent is deliberately last so class-specific intents win ties.

### Contact form (`form.js`)

Uses **no third-party service** — the user explicitly declined Formspree and similar.
It composes a message from the form fields and opens either
`wa.me/905052463218` or `mailto:info@kumeegitim.com`. Nothing is submitted anywhere.

### Admin panel (`admin.html` + `admin.js`)

**This panel is operated by the school owner, who is not technical.** Error messages and
labels must stay plain Turkish, and destructive actions must keep their confirm dialogs.

It manages `data/haberler.json` (news) and `data/programlar.json` (class schedule images)
by committing straight to this repo through the **GitHub Contents API** (GET for `sha`,
then PUT with base64 content). Constants live at the top of `admin.js`
(`OWNER`, `REPO`, `BRANCH`, `PROG_YOL`, `PROG_DIZIN`).

Auth is a **fine-grained GitHub PAT** (Contents: Read and write) pasted by the user and
kept only in `localStorage` under `kume_admin_token`; `girisYap()` verifies it via
`/repos/{o}/{r}` and checks `permissions.push`. There is deliberately **no password** —
on static hosting a JS-embedded password is not security, and a previous request for one
was declined for that reason. Don't add one.

Schedule uploads are resized in-browser to max 1600px JPEG via `<canvas>` before upload
(`kucult()`), then written to `assets/img/program/<sinif>.jpg`.

Data shapes are nested — note these are **not** bare arrays:

```jsonc
// data/haberler.json
{ "guncelleme": "...", "haberler": [ { id, baslik, ozet, icerik, tarih, kategori, gorsel } ] }
// data/programlar.json
{ "guncelleme": "...", "programlar": { "sinif-8": { "gorsel": "", "guncelleme": "" }, ... } }
```

Six schedule keys exist: `sinif-8`…`sinif-12`, `mezun`.

### Icons and SEO

`/favicon.ico` **must stay at the repo root** — Google's favicon crawler falls back to it,
and its absence was why search results showed the default globe. Icon `<link>`s are
root-absolute and carry no `?v=` query string (Google wants clean icon URLs). The
Search-facing PNGs (48/96/144/192) are multiples of 48 because Google requires that; the
512 is there for the web manifest. Icons are drawn from geometry
measured off `assets/img/LOGO2.png` (radius .306, stroke .082), with stroke weight
optically thickened at 16/32px.

`sitemap.xml` must stay in sync with the `<link rel="canonical">` of each indexable page —
`robots.txt` advertises it, and it previously 404'd. `admin.html` and `404.html` are
excluded (admin is `noindex` + disallowed in robots.txt).

## Content ground rules

The site is **final** with respect to several items the user explicitly refused to supply.
Do not re-add placeholder cards, invent content, or reintroduce "Eklenecek" badges for:

- real student names / dereceler / sıralama on `basarilarimiz.html`
- student or parent testimonials
- pricing or lesson-hour details
- KVKK legal specifics (VERBİS no, resmi ünvan, saklama süresi)

Verified real data already in the site — don't "correct" it: phone/WhatsApp
**0505 246 32 18**, `info@kumeegitim.com`, Instagram `@kume_egitim` (Facebook exists but is
12 years stale, so Instagram is featured), Pazartesi–Cumartesi 09:00–19:00, Atatürk Bulvarı
Bulvar Palas İş Merkezi, Kızılay. Owners are Yaşar Fırat Özseven and Ünal Karatekin.
The footer credits the repo owner's GitHub (`deniz-bigboss`) at their request.

Theme is **monochrome black & white** (`assets/js/tw-config.js`); both `brand` and `accent`
scales are greys. Don't introduce colour.

## Testing notes

The site itself has no tests. Verification has been done by driving it with Playwright
against a local `http.server`. The traps below are real and cost hours to diagnose — the
first two are specific to the Claude Code web sandbox (different paths elsewhere), the rest
apply to any headless browser:

- Chromium lives at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` — pass it as
  `executable_path`.
- External CDNs are blocked, so abort non-`127.0.0.1` requests via `ctx.route(...)` and add
  `add_init_script("window.tailwind=window.tailwind||{};")` to stop `tw-config.js` throwing.
- With the Tailwind CDN blocked, the `hidden` class has **no CSS rule**, so visibility
  assertions lie. Either inject `.hidden{display:none}` or assert on class tokens. For a
  faithful layout test, build real CSS: `npx tailwindcss@3 -c <config> -i <in.css> -o <out>`
  pointed at this repo's HTML, using the theme from `tw-config.js`.
- The chat panel toggles via `opacity`/`pointer-events`, not `display` — Playwright reports
  it "visible" either way. Assert on the `open` class or computed opacity.
- The test Chromium lacks H.264, so `kurum-tanitim.mp4` reports `readyState 0`; the file is
  fine in real browsers.
- `loading="lazy"` images need a scroll pass *and* a wait for `img.complete` before
  `naturalWidth` means anything.
- Root-absolute `fetch('/favicon.ico')` fails through a Playwright route handler; verify
  such URLs with `context.request.get()`, which bypasses page routes.

If your environment proxies outbound HTTPS and returns 403 for arbitrary sites (the Claude
Code web sandbox does), note that **raw sockets to kumeegitim.com on ports 80 and 443 still
work**, so the live site can be verified directly with `socket` + `ssl`. In that sandbox TLS
is intercepted, so certificate checks are meaningless (issuer reads "Anthropic") — don't
draw conclusions about the real certificate from inside it.

## Gotchas

- (Claude Code web / any ephemeral container.) After a restart the working copy may
  reappear on the stale branch
  `claude/dershane-website-github-access-4ruhnv` at commit `f454253`, which predates almost
  all of the work. **Check `git branch --show-current` first**; if it isn't `main`, run
  `git fetch origin main && git checkout -B main origin/main`. Nothing is lost — `origin/main`
  is the source of truth.
- `assets/img/LOGO2.png` and `reklam1.png` are unreferenced by any page. They are kept
  deliberately as brand source assets (the favicons are derived from LOGO2); a static audit
  will flag them as unused — that is expected.
