# Phase 02 — Design System

Status: Awaiting approval.
Date: 2026-11-14.
Branch: `feature/phase-02-design-system`.

## Goal

Implement the Captions Light design system and a review page.

## Work completed

1. Added full color tokens from the supplied palette.
2. Added two functional status colors for accessible error and success messages.
3. Added responsive typography tokens for all nine roles.
4. Added spacing, radius, and shadow tokens.
5. Added Libre Baskerville 400/700 and Inter variable fonts, self-hosted.
6. Built Button, Card, Badge, Nav, Section, Input, Textarea, Select, Accordion,
   LoadingState, and ErrorState.
7. Built the `/design` preview page with all foundations and components.
8. Updated the home page to use the navigation and new tokens.
9. Added keyboard, mobile navigation, and component browser tests.

## Design decisions

- White page background, pale blue workspaces, charcoal actions, cyan accents.
- Thin borders instead of large shadows. Floating navigation uses one soft shadow.
- Ash Copy is restricted to disabled text because its contrast is 3.80:1.
- Prism Cyan is restricted to accents because its contrast is 1.83:1 on white.
- Native `details` elements provide the mobile menu and accordions. No framework
  or custom keyboard handler.
- Error and success colors are functional additions, not brand replacements.

## Files created

- `src/components/ui/Button.astro`
- `src/components/ui/Card.astro`
- `src/components/ui/Badge.astro`
- `src/components/ui/Nav.astro`
- `src/components/ui/Section.astro`
- `src/components/ui/Input.astro`
- `src/components/ui/Textarea.astro`
- `src/components/ui/Select.astro`
- `src/components/ui/Accordion.astro`
- `src/components/ui/LoadingState.astro`
- `src/components/ui/ErrorState.astro`
- `src/pages/design.astro`
- `tests/e2e/design.spec.ts`
- `docs/DESIGN_SYSTEM.md`

## Changed files

- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro`

## Acceptance

| Criterion | Result |
|---|---|
| Components match the design reference | Partially verifiable. Reference file was not supplied. Tokens and rules are implemented as specified. |
| Mobile and desktop layouts work | Pass. Checked at 1440×900 and 390×844 with screenshots. |
| Keyboard navigation works | Pass. Skip link, desktop links, mobile disclosure, form controls, and accordions are focusable. Playwright tests pass. |
| Text contrast passes agreed checks | Pass. Body 9.52:1, white on charcoal 16.55:1, alert 6.81:1. Ash and cyan restricted. |
| Production build succeeds | Pass. |

## Known limitations

- No licensed Exposure or DenimINK files. Approved substitutes are in use.
- No design reference file to compare pixel-for-pixel.
- `grain` is decorative and limited to feature panels.
- Focus ring on charcoal buttons uses the white gap from the outline offset.
