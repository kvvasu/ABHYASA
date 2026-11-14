# Roadmap

Each phase ends with tests, a production build, documentation updates, a GitHub
checkpoint, and an approval gate. Do not start the next phase without approval.

| Phase | Branch                           | Deliverable                                       | Exit criteria                                                      |
| ----- | -------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------ |
| 0     | `feature/phase-00-discovery`     | Architecture documents                            | Risks and accounts are known. Approved plan.                       |
| 1     | `feature/phase-01-foundation`    | Astro + Tailwind + test setup + Cloudflare config | Dev server, build, unit test, and health check pass.               |
| 2     | `feature/phase-02-design-system` | Captions Light tokens and components              | Preview page matches reference. Keyboard and contrast checks pass. |
| 3     | `feature/phase-03-public-pages`  | Public website                                    | All public pages render on mobile and desktop. No auth required.   |
| 4     | `feature/phase-04-cms`           | Markdown collections and Decap CMS                | Instructor edits content. OAuth works. No private IDs in content.  |
| 5     | `feature/phase-05-auth`          | Firebase login and API token verification         | Expired and invalid tokens rejected.                               |
| 6     | `feature/phase-06-database`      | Firestore schema, rules, server data layer        | Rules tests prove students cannot write commercial data.           |
| 7     | `feature/phase-07-payments`      | Razorpay checkout and webhook                     | Verified payment grants access. Duplicate webhook does not.        |
| 8     | `feature/phase-08-enrollment`    | Protected lesson API                              | Only active enrollments receive lesson data.                       |
| 9     | `feature/phase-09-player`        | Plyr player and progress                          | Progress persists across devices.                                  |
| 10    | `feature/phase-10-instructor`    | Instructor dashboard                              | Instructor manages lessons and access without code.                |
| 11    | `feature/phase-11-testing`       | Full test and security pass                       | No critical finding. Performance documented.                       |
| 12    | `feature/phase-12-launch`        | Production deployment and handoff                 | One approved real purchase works end to end.                       |

## Approval gates

- Phase 0: architecture and provider choices.
- Phase 4: GitHub OAuth app creation.
- Phase 7: Razorpay test keys and webhook secret.
- Phase 10: R2 decision if paid PDFs are required.
- Phase 12: production Razorpay activation and real payment test.

## Deferred items

- Certificates.
- Advanced analytics.
- Coupons and bundles.
- Email delivery service.
- DRM.

Add a deferred item only after explicit approval. Report cost and free-tier
impact before adding any service.
