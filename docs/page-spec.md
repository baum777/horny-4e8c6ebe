# Page Spec (Canonical)

## 1) PageShell Tokens (Required)
Every routed page must wrap content in `PageShell` and set deterministic tokens:

- `page` (string): stable page key (e.g. `home`, `game`, `profile`).
- `flavor` (string): visual flavor token.
- `energy` (number): 1–5 intensity scale.
- `state` (optional): `active` | `teaser` | `locked`.
- `tier` (optional): tier key when needed (e.g. `user-tier`).

`PageShell` writes these values onto `document.body.dataset` so global styles can respond consistently.

## 2) Global Design Rules (Non‑Negotiable)

- **No pulsing backgrounds or looping motion beyond blur.** Avoid `animate-pulse` or similar pulsing
  effects on backgrounds/teasers. Static blur/opacity is fine.
- **One accent per page.** Use a single accent pattern per page (e.g. the tier element). Remove
  extra neon borders, glows, and gradients outside that accent.
- **No routing breakage.** Pages must keep current routes and `PageShell` tokens intact.

## 3) Page-by-Page Constraints

### `/` Home
- **Hero H1:** `Forge memes. Earn status.`
- **Hero subline:** `Create, remix and compete inside the $HORNY universe.`
- Keep hero CTA copy consistent with `copyContent.landing.marketingMini`.

### `/game` (Teaser)
- Keep `state: "teaser"` in `PageShell`.
- **Subtitle:** `$Horny Runner unlocking soon`
- No pulsing elements (remove `animate-pulse` usage in the teaser silhouette).

### `/badges` (Locked)
- Title copy must be: `Coming Soon — stay $Horny`.

### `/profile`
- Keep `tier` tokens on the page shell.
- Enforce **one accent per page** by removing extra neon/gradient accents in the header and stats.

### `/forge`
- Teaser is allowed for now (`state: "teaser"`).

## 4) Copy Source of Truth
- **Hero + CTA copy**: `src/lib/content.ts`.
- **Teaser titles/subtitles**: `src/pages/GamePage.tsx` and `src/pages/BadgesPage.tsx`.
- **Footer copy**: `src/components/layout/Footer.tsx`.
