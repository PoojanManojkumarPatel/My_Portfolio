# Shadow Portfolio — System HUD Theme

A dark, immersive developer portfolio template with a System HUD / RPG aesthetic.
Built with plain HTML, CSS, and vanilla JavaScript. No frameworks. No build tools. Just open and edit.

---

## Preview

Features a void-black background, ice-blue accent colours, animated scan lines, glitch effects on names, animated skill bars, and a scrolling timeline — all styled around a game-system UI theme.

---

## Getting Started

1. **Clone or download** this repository.
2. Open `index.html` and follow the comments — every section has inline notes telling you what to replace.
3. Open `index.html` in your browser directly, or use a local server (e.g. VS Code Live Server).

No install. No build step.

---

## Customisation Guide

### `index.html` — all content lives here

#### Global
| Placeholder | What to replace it with |
|---|---|
| `Your Name — Developer` | Your name and role (page `<title>`) |
| `XX` | Your initials (nav sigil and entity panel) |
| `CITY.COUNTRY` | Your city and country code (hero tag) |

#### Hero
| Placeholder | What to replace it with |
|---|---|
| `FirstName` / `LastName` | Your first and last name |
| `Role One`, `Role Two`, `Role Three` | Your roles / titles |
| Hero tagline | A short, personal one-liner about what you build |

#### About
| Placeholder | What to replace it with |
|---|---|
| `[Your Name]` | Your name |
| `[Your Degree]` | Your degree title |
| `[Your University]` | Your university name |
| `[Major]`, `[Minor]` | Your study majors |
| `[brief highlight...]` | One sentence on a key project or achievement |
| `[Hobby or interest]` | Personal interests (or remove the paragraph entirely) |
| `YOUR RANK` | A fun rank title, or your actual job title |
| `Your Status` | e.g. Open to Opportunities, Employed, Freelancing |
| `City, Country` | Your location |
| `Your Role` | Your current role / title |
| `N+ Projects` | Your project count |
| Stat boxes (`N+`, labels) | Your own stats — LeetCode solved, lines written, years exp, etc. |

#### Projects
Each project card has the same structure. For each one replace:
- `Project Name` — in both `data-text=""` and the visible text
- `Category · Sub-Category` — the project type
- The description paragraph
- Stack tags
- The GitHub `href`

Project `// 001` uses the `featured` class and spans two columns — best used for your strongest project.
Add or remove cards by copying / deleting the card `<div>` blocks.

To add a live demo link alongside GitHub, add a second anchor inside `.project-links`:
```html
<a href="https://your-live-demo.com" target="_blank" class="project-link">
  ↗ Live Demo
</a>
```

#### Skills
Three categories are provided: **Languages**, **Frameworks & Tools**, **Concepts & Craft**.
For each skill item replace:
- The skill name
- The level label (`ADVANCED`, `INTERMEDIATE`, `APPLIED`, `COMFORTABLE`, `STRONG`, `PRACTISED`)
- `data-width` — a number from `0` to `100` controlling the bar fill percentage

Add or remove `<div class="skill-item">` blocks freely within any category.

#### Experience (Timeline)
Four entries are provided, ordered most-recent first. For each entry replace:
- The date range — e.g. `[ JAN 2024 — DEC 2024 ]`
- Role title
- Organisation name and location
- Description paragraph
- Tags

Add or remove `<div class="timeline-item">` blocks as needed.

#### Contact
| Placeholder | What to replace it with |
|---|---|
| `your.email@example.com` | Your email address (both in `href` and visible text) |
| LinkedIn `href` | Your LinkedIn profile URL |
| GitHub `href` | Your GitHub profile URL |
| `/resume.pdf` | Path to your resume file |

#### Footer
Replace `Your Name`, `City, Country`, and `YYYY` with your details.

---

### `style.css` — design tokens

All colours are defined as CSS variables at the top of `style.css` under `:root`.
You can retheme the entire site by editing these values — no hunting through the file.

```css
:root {
  --ice:       #a8b8e8;   /* primary accent colour */
  --nightmare: #7b4fc8;   /* secondary / corruption accent */
  --gold:      #c9a84c;   /* legendary / highlight colour */
}
```

---

### `main.js` — behaviour

Handles:
- Scroll-reveal animations (`.reveal` elements fade in on scroll)
- Skill bar fill animations (triggered on scroll into view, reads `data-width`)
- Active nav link highlighting on scroll

No changes needed unless you want to adjust timing or thresholds.

---

## File Structure

```
/
├── index.html        ← all content and structure
├── style.css         ← all styles and design tokens
├── main.js           ← scroll animations and nav logic
├── images/
│   ├── github.png    ← GitHub icon (project cards + contact)
│   ├── linkedin.png  ← LinkedIn icon (contact)
│   └── resume.png    ← Resume icon (contact)
└── Readme.md
```

---

## Credits

Design inspired by the aesthetic of RPG system UIs.
Fonts: [Cinzel](https://fonts.google.com/specimen/Cinzel), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono), [Syne](https://fonts.google.com/specimen/Syne) via Google Fonts.
