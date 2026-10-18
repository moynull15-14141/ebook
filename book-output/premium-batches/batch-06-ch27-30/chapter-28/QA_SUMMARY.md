# QA Summary — Chapter 28

**Chapter:** অধ্যায় ২৮ — Professional JavaScript Deployment, Docker, CI/CD, Cloud Infrastructure এবং Production Monitoring
**Status: PASS** — 10 of 10 automated gates passed (last QA run 2026-10-18T11:10:03.538Z)
**Source:** `JavaScript_Mastery_Manuscript_v30/chapters/chapter-28.md` (title and scope); text rewritten for the premium edition
**Built with:** `book-output/master-design-system/` 1.0.0 (with the approved 2026-10-15 listing-label fix; not modified in this phase)

## Deliverables

| File | Result |
| --- | --- |
| `chapter-28-premium.md` | 4946 explanatory words (code and inline code excluded; 10003 words including code); 27 sections |
| `chapter-28-premium.pdf` | 43 pages (A4); 1235 KB |
| `chapter-28-premium.docx` | 65 KB; structural validation passed; opened and exported by Microsoft Word (47 pages reported by Word) |
| `project/deploy-ready/` | src/config.mjs, logger.mjs, metrics.mjs, jobs.mjs, app.mjs, server.mjs; main.mjs; healthcheck.mjs; scripts/check-deploy.mjs, smoke.mjs; Dockerfile; .dockerignore; compose.yaml; .env.example; .github/workflows/ci.yml; README with run commands, runtime versions and limitations; tests |

## Checks

| Check | Result | Log |
| --- | --- | --- |
| Listings written from the chapter and run in Node.js | 16 run; 10 compared with a printed Output or Error panel; 0 mismatch | `qa-logs/listings-run.log` |
| Project tests (`node --test`) | 14 passed, 0 failed, 0 skipped | `qa-logs/unit-tests.log` |
| Environment-specific | Deploy validation (`qa-logs/deploy-validation.log`): compose.yaml and ci.yml parsed with yaml 2.8.3 and js-yaml 3.14.2 (identical data) and checked structurally; production-mode start and smoke test pass; smoke test fails correctly without the token. **NOT RUN:** `docker build` / `docker compose up` (Docker daemon not reachable) and the GitHub Actions workflow (not pushed) | `qa-logs/` |
| Manuscript rules | 26 passed, 0 failed, 1 warning | `qa-logs/manuscript-check.log` |
| PDF checks (all 43 pages) | 13 passed, 0 failed, 0 warning | `qa-logs/pdf-check.log` |
| DOCX structural checks | 29 passed, 0 failed | `qa-logs/docx-check.log` |
| Bengali text layer (ActualText-aware reader) | 3732 of 3732 words intact | `qa-logs/typography-audit.log` |

Content: 30 source listings, 13 output panels, 0 error panels; 10 tables; 1 callouts; 12 exercises (beginner, intermediate, challenge) with 12 solutions; 10 MCQs with 4 options each and an explained answer table.

## Curriculum overlap

| | |
| --- | --- |
| Previously learned | Chapter 22 (CI workflow), Chapter 25 (graceful shutdown, request IDs, health), Chapter 26 (backup). |
| Decision | Earlier topics are extended, not repeated: fail-fast configuration, Docker/Compose/CI files, drain-based graceful shutdown with tests, Prometheus exposition format, SLO/error budget/burn rate, canary analysis. Project DeployReady Travel Operations API kept from v30. |
| v30 heading | v30 heading kept. |

## Real findings during production

- The healthcheck test first used `spawnSync`, which blocked the event loop of the very server it was checking and failed; switched to async `spawn`.
- Output lines of the logger and metrics examples exceeded the code width; the examples were adjusted (object output, shorter route label).

## Warnings

- 47 code line(s) will wrap with a hanging indent: line 70 (69 chars, Bengali); line 77 (69 chars, Bengali); line 109 (69 chars, Bengali); line 143 (76 chars, Bengali); line 149 (82 chars, Bengali); line 157 (79 chars, Bengali); line 184 (80 chars, Bengali); line 190 (70 chars, Bengali); line 274 (73 chars, Bengali); line 277 (76 chars, Bengali); line 284 (71 chars, Bengali); line 321 (74 chars, Bengali); line 377 (75 chars, Bengali); line 388 (71 chars, Bengali); line 393 (79 chars, Bengali); line 394 (80 chars, Bengali); line 399 (82 chars); line 414 (78 chars, Bengali); line 415 (72 chars, Bengali); line 416 (69 chars, Bengali); line 419 (72 chars, Bengali); line 436 (71 chars, Bengali); line 448 (73 chars, Bengali); line 449 (70 chars, Bengali); line 452 (71 chars, Bengali); line 514 (76 chars, Bengali); line 552 (72 chars, Bengali); line 588 (75 chars, Bengali); line 594 (72 chars, Bengali); line 669 (71 chars, Bengali); line 755 (69 chars, Bengali); line 762 (80 chars, Bengali); line 839 (70 chars, Bengali); line 909 (69 chars, Bengali); line 915 (76 chars, Bengali); line 1000 (71 chars, Bengali); line 1013 (78 chars, Bengali); line 1078 (73 chars, Bengali); line 1099 (79 chars, Bengali); line 1100 (74 chars, Bengali); line 1147 (73 chars, Bengali); line 1292 (74 chars, Bengali); line 1320 (80 chars, Bengali); line 1321 (73 chars, Bengali); line 1377 (75 chars, Bengali); line 1379 (79 chars, Bengali); line 1432 (70 chars, Bengali)

## Visual inspection

PDF pages 1, 7, 20, 41, 43 were rendered to images and looked at by eye (opening, Dockerfile panel and table, Prometheus output with SLO listing, MCQ answers, final). No page was flagged by the white-space check. No rendering defect was found: Bengali shaping, code panels, "Part N of M" captions, tables and callouts display correctly; long titles make the running header wrap to two lines (template behaviour). The remaining pages passed the automated layout checks only.

## Not done

- No second-reader Bengali proofread.
- No test on macOS or Linux, or in Firefox or Safari.
