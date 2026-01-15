# UI → Code Mapping (Hero/Logo/Text)

| UI-Element-Name | Beschreibung | Dateipfad im Repository | Code-Referenz |
| --- | --- | --- | --- |
| Navbar Logo | Logo-Text in der Top-Navigation (`$HORNY`). | `src/components/layout/Navbar.tsx` | `Navbar` Logo `<Link>` |
| Landing Hero H1 | Hero-Headline **"Forge memes. Earn status."** | `src/lib/content.ts` + `src/components/home/Hero.tsx` | `copyContent.landing.hero.headline` / `Hero` H1 |
| Landing Hero Subline | Hero-Subline **"Create, remix and compete inside the $HORNY universe."** | `src/lib/content.ts` + `src/components/home/Hero.tsx` | `copyContent.landing.hero.subline` |
| Hero CTA Primary | Primary CTA (Connect/Start-Button). | `src/lib/content.ts` + `src/components/home/Hero.tsx` | `copyContent.landing.marketingMini.ctaPrimary` |
| Hero CTA Secondary | Secondary CTA (Gallery-Link). | `src/lib/content.ts` + `src/components/home/Hero.tsx` | `copyContent.landing.marketingMini.ctaSecondary` |
| Hero Trust Microcopy | Trust line items unter den CTAs. | `src/lib/content.ts` + `src/components/home/Hero.tsx` | `copyContent.landing.hero.trust` |
| KPI Band (Ticker) | Laufender KPI-Band mit Price/FDV/Volume/Holders. | `src/components/home/LiveTicker.tsx` | `LiveTicker` / `TickerSegment` |
| Lore Section | Lore-Headline + Beschreibung + Kapiteltexte. | `src/components/home/LoreSection.tsx` | `LoreSection` / `loreChapters` |
| Interact Section | Section-Headline + CTA "Enter Interaction Hub". | `src/components/home/InteractPreview.tsx` | `InteractPreview` / CTA Button |
| Social Icon CTAs | Social-Icons (Dex, Discord, X). | `src/components/ui/SocialGroup.tsx` | `SocialGroup` anchor tags |
| Contract Address | Contract Address Anzeige + Copy-Button. | `src/components/ui/ContractAddress.tsx` | `ContractAddress` / `CA` const |
| Game Teaser Title/Subline | Title + Subline **"$Horny Runner unlocking soon"**. | `src/pages/GamePage.tsx` | `TeaserLayout` props |
| Game Teaser Overlay | Overlay Copy "System Initializing". | `src/pages/GamePage.tsx` | Overlay `<p>` text |
| Badges Overlay Title | Badge-Teaser Titel **"Coming Soon — stay $Horny"**. | `src/pages/BadgesPage.tsx` | `TeaserLayout` title |
| Footer Brand Block | Footer Brand-Text + Microcopy. | `src/components/layout/Footer.tsx` | `Footer` brand + microcopy |
