# Design System

Source: Captions Light. Tokens live in `src/styles/global.css`.
Preview: `/design` (noindex, review only).

## Fonts

Licensed Exposure and DenimINK files were not available. Approved substitutes:

| Role                              | Font              | License               |
| --------------------------------- | ----------------- | --------------------- |
| Display and headings              | Libre Baskerville | SIL Open Font License |
| Navigation, body, labels, buttons | Inter             | SIL Open Font License |

Both are self-hosted through Fontsource. No external font CDN request.

## Color

All supplied tokens are present. The brand palette is unchanged.

| Token         | Value     | Use                                          |
| ------------- | --------- | -------------------------------------------- |
| Paper White   | `#ffffff` | Page background                              |
| Air Wash      | `#effbff` | Workspaces and feature panels                |
| Mist Border   | `#e8eff2` | Thin card borders                            |
| Steel Inset   | `#d0d6d7` | Inset backgrounds, progress track            |
| Ash Copy      | `#7e8486` | Disabled text only. 3.80:1 on white.         |
| Graphite Copy | `#434647` | Body text. 9.52:1 on white.                  |
| Editorial Ink | `#2a2c2d` | Headings                                     |
| Charcoal      | `#1d1f20` | Primary buttons, navigation                  |
| Prism Cyan    | `#00d0ff` | Small control accents only. 1.83:1 on white. |
| Sky Fade      | `#a6ecff` | Text on charcoal, soft highlights            |
| Cyan Halo     | `#ccf6ff` | Selected backgrounds, focus halo             |

Functional additions:

| Token       | Value     | Use                                      |
| ----------- | --------- | ---------------------------------------- |
| Alert Ink   | `#a3342a` | Error text and borders. 6.81:1 on white. |
| Success Ink | `#1e6b4a` | Success text.                            |

Do not use Ash Copy or Prism Cyan for body text. Do not use color as the only
signal; pair it with text and an icon.

## Typography

| Role            | Token                  | Size                    |
| --------------- | ---------------------- | ----------------------- |
| Utility         | `text-utility`         | 11px, tracked uppercase |
| Caption         | `text-caption`         | 13px                    |
| Editor label    | `text-label`           | 14px                    |
| Body            | `text-body`            | 16px                    |
| Feature label   | `text-feature-label`   | 18px                    |
| Card heading    | `text-card-heading`    | 24px                    |
| Feature heading | `text-feature-heading` | 28–32px                 |
| Hero heading    | `text-hero-heading`    | 36–48px                 |
| Large display   | `text-large-display`   | 44–72px                 |

Display sizes use `clamp()` for responsive scaling. No breakpoint ladder.

## Spacing

| Token           | Value    |
| --------------- | -------- |
| Gutter          | 20–32px  |
| Section         | 64–112px |
| Compact section | 40–64px  |
| Dashboard       | 16px     |

Public pages use `py-section` and `px-gutter`. The student workspace uses compact
sections and 16px base spacing.

## Radius

| Token             | Value  | Use                      |
| ----------------- | ------ | ------------------------ |
| `rounded-card`    | 12px   | Cards, buttons, inputs   |
| `rounded-media`   | 20px   | Images and media panels  |
| `rounded-nav`     | 30px   | Floating navigation      |
| `rounded-feature` | 40px   | Large feature containers |
| `rounded-pill`    | 9999px | Pills and badges         |

## Elevation

Thin borders separate surfaces. Shadows are limited to floating navigation and
layered controls:

- `shadow-float` for navigation and popovers.
- `shadow-lift` for raised cards where needed.

## Components

| Component    | Path                                   | Notes                                                            |
| ------------ | -------------------------------------- | ---------------------------------------------------------------- |
| Button       | `src/components/ui/Button.astro`       | Primary, secondary, ghost, cyan. Three sizes. Disabled state.    |
| Card         | `src/components/ui/Card.astro`         | Paper, wash, ink, halo tones. Optional link.                     |
| Badge        | `src/components/ui/Badge.astro`        | Pill label.                                                      |
| Nav          | `src/components/ui/Nav.astro`          | Translucent floating bar, 30px radius. Native mobile disclosure. |
| Section      | `src/components/ui/Section.astro`      | Page rhythm, tones, responsive headings.                         |
| Input        | `src/components/ui/Input.astro`        | Label, hint, error, required, disabled.                          |
| Textarea     | `src/components/ui/Textarea.astro`     | Same field contract as Input.                                    |
| Select       | `src/components/ui/Select.astro`       | Native select with the same field contract.                      |
| Accordion    | `src/components/ui/Accordion.astro`    | Native `details` and `summary`. Keyboard accessible.             |
| LoadingState | `src/components/ui/LoadingState.astro` | Spinner, polite live region, skeleton rows.                      |
| ErrorState   | `src/components/ui/ErrorState.astro`   | Assertive alert, icon and text, action slot.                     |

## Accessibility

- Body text uses Graphite Copy. Contrast is 9.52:1 on white and 9.03:1 on Air
  Wash.
- Primary buttons use Paper White on Charcoal. Contrast is 16.55:1.
- Input borders use Ash Copy (3.80:1) to meet the 3:1 non-text contrast requirement.
  Focus adds a charcoal border and cyan halo.
- Every form control has a visible label. Hints and errors are linked with
  `aria-describedby`. Errors use `role="alert"` and `aria-invalid`.
- The navigation uses native `details` and `summary`. Desktop links use
  `aria-current="page"`.
- Accordions use native disclosure elements. The whole summary row is the target.
- The skip link is the first focusable element.
- Focus outlines are visible and offset.
- Motion is reduced when `prefers-reduced-motion` is set.
- Status messages use text and icons, not color alone.

## Differences from the reference

The Captions Light reference file and licensed font files were not available. The
build follows the supplied tokens and component rules. These differences are
recorded for approval:

1. Headings use Libre Baskerville instead of Exposure. Body text uses Inter instead
   of DenimINK. Both substitutes are open licensed.
2. Two functional colors are added: Alert Ink `#a3342a` and Success Ink `#1e6b4a`.
   The supplied brand palette is unchanged. Error and success states need
   accessible contrast that the brand palette cannot provide for small text.
3. Input borders use Ash Copy `#7e8486` instead of Steel Inset `#d0d6d7`. Steel
   Inset is 1.47:1 on white and fails the 3:1 non-text contrast requirement. Ash
   Copy is 3.80:1.
4. Ash Copy is used only for disabled text. Prism Cyan is used only for accents and
   the focus halo. Both fail AA for normal body text on white.
5. Buttons add a `cyan` variant for learning controls. Primary, secondary, and
   ghost variants follow the supplied rules.
6. The mobile navigation uses a native `details` disclosure instead of a
   JavaScript drawer. This keeps keyboard and screen reader behavior simple.
7. Grain is limited to one feature panel. It is not used behind body text.
8. The navigation is sticky with a 16px top offset, not fixed to the viewport
   edge. This preserves the floating appearance and avoids covering anchors.
9. The type scale uses `clamp()` so mobile sizes stay readable. The desktop sizes
   match the supplied table.

## Review checklist (Phase 2)

| Check                                    | Result                              |
| ---------------------------------------- | ----------------------------------- |
| All 11 supplied color tokens present     | Pass. Two functional colors added.  |
| All 9 typography roles present           | Pass.                               |
| Radius rules: 12, 20, 30, 40, 9999px     | Pass.                               |
| Thin borders over large shadows          | Pass. One navigation shadow.        |
| Translucent floating navigation          | Pass.                               |
| Mobile navigation works with keyboard    | Pass. Playwright test.              |
| Form controls have labels, hints, errors | Pass.                               |
| Responsive typography on mobile          | Pass. `clamp()` tokens.             |
| WCAG AA body text contrast               | Pass. Graphite on white 9.52:1.     |
| Focus visible on all controls            | Pass. Charcoal outline with offset. |
| Production build                         | Pass.                               |
