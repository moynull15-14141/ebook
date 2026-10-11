# Technical QA Report — Chapter 01 Premium Sample

**Chapter:** অধ্যায় ১ — JavaScript-এর জগতে প্রথম পদক্ষেপ
**Date:** 11 October 2026
**Environment:** Windows 10 Pro (10.0.19045), Node.js v22.16.0, npm 10.9.2, Google Chrome 155.0.8059.40 (headless), Windows PowerShell 5.1

**Overall status: PASS**, with the untested areas listed in section 6.

Every result below comes from a command that was actually run. Raw output is saved in `qa-logs/`.

## 1. Summary

| Check | Result | Log |
| --- | --- | --- |
| JavaScript syntax (`node --check`), 4 files | 4 of 4 pass | `qa-logs/syntax-checks.log` |
| Unit tests for `createGreeting()` | 8 of 8 pass | `qa-logs/unit-tests.log` |
| Browser tests for the Greeting App | 12 of 12 pass | `qa-logs/browser-tests.log` |
| Chapter Node.js examples and solutions | 18 of 18 behave as expected | `qa-logs/node-examples.log` |
| Chapter web-page examples and browser solutions | 13 of 13 pass | `qa-logs/page-examples.log` |
| Manuscript cross-check against executed files | 12 of 12 pass | `qa-logs/manuscript-check.log` |
| Terminal commands in Windows PowerShell | 8 of 8 behave as described | `qa-logs/terminal-commands-windows.log` |
| Further Reading links | 5 of 5 resolve to the named page | checked online, see section 5 |

## 2. Commands and results

All commands run from `book-output/premium-samples/chapter-01/` unless stated.

### Syntax checks

```
cd project/interactive-greeting-app
node --check app.js
node --check tests/greeting.test.js
node --check tests/browser/run-browser-tests.mjs
node --check ../../examples/solutions/challenge-greeting-app/app.js
```

All four exit with code 0 and no output.

### Unit tests (pure logic, no browser)

```
cd project/interactive-greeting-app
node --test
```

Result: `# tests 8`, `# pass 8`, `# fail 0`.

The test loads the real `app.js` into an isolated context with a stub `document`, so the shipped file is tested without adding export code that a beginner would not understand. Cases: plain name, Bengali name, leading and trailing spaces, internal spaces preserved, empty string, spaces only, tabs and newlines only, HTML-like text returned unchanged.

### Browser tests (real Chrome, headless)

```
cd project/interactive-greeting-app
node tests/browser/run-browser-tests.mjs
```

Result: `12 passed, 0 failed`.

The script drives Chrome through the DevTools Protocol using Node's built-in WebSocket. It has no npm dependencies. Typing, mouse clicks and key presses are real input events, not synthetic DOM calls.

| # | Test | Result |
| --- | --- | --- |
| 1 | Page loads with an empty message and no console errors | PASS |
| 2 | Valid name + button click shows the greeting with the success class | PASS |
| 3 | Empty submission shows the warning and returns focus to the input | PASS |
| 4 | Whitespace-only submission shows the warning | PASS |
| 5 | Pressing Enter in the input submits (Bengali name) | PASS |
| 6 | Leading and trailing spaces are trimmed | PASS |
| 7 | `<b>Test</b>` is shown as text; no child element is created | PASS |
| 8 | A valid name after an error replaces the warning | PASS |
| 9 | Accessibility attributes: one associated label, `role="status"`, `aria-live="polite"`, `lang="bn"`, one `h1`, one `main` | PASS |
| 10 | Keyboard: Tab moves from input to button; Space submits | PASS |
| 11 | 360 px mobile viewport: no horizontal scroll, card inside the viewport, input font at least 16 px, button at least 44 px tall | PASS |
| 12 | No console errors during the whole run | PASS |

Screenshots taken during the run are in `project/interactive-greeting-app/tests/browser/screenshots/` (desktop, mobile success, mobile empty input, and the figure used in the book).

### Chapter examples

```
node examples/run-node-examples.mjs
node examples/check-page-examples.mjs
```

- **Node.js examples:** 6 teaching examples and 6 exercise solutions run with exit code 0. The 6 deliberate-error files fail with exit code 1, as intended. Their real messages are the ones printed in the chapter.
- **Web-page examples:** the first page works with `defer`; without `defer` Chrome reports `Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')`; a wrong file name reports `Failed to load resource: net::ERR_FILE_NOT_FOUND`. Both messages are quoted in the chapter exactly as observed.
- **Browser solutions:** solution 8 and the combined solutions 10, 11 and 12 behave as the chapter describes.

### Manuscript cross-check

```
node build/check-manuscript.mjs
```

- 24 source listings are character-for-character identical to a file that was executed. 3 are deliberate fragments (solutions 10 to 12); every line of each exists in the tested combined solution.
- 54 lines of printed output and error text were found in the recorded run logs. None is invented.
- All 27 source listings state where they run (Node.js, Browser, or both).
- 10 MCQs, 40 options, 10 answers with explanations; the answer key uses all four positions.

## 3. Requirements checklist for the Greeting App

| Requirement | Status | Evidence |
| --- | --- | --- |
| Semantic HTML | PASS | `main`, `h1`, `form`, `label`, `button`; browser test 9 |
| Accessible form label | PASS | `label for="name"`; browser test 9 |
| Keyboard-accessible interaction | PASS | browser tests 5 and 10 |
| Responsive CSS | PASS | browser test 11 at 360 px; desktop screenshot at 900 px |
| No `innerHTML` for user text | PASS | only `textContent` is used; browser test 7 |
| No inline event attributes | PASS | handlers attached with `addEventListener` |
| Input trimming and empty handling | PASS | unit tests 3, 5, 6, 7; browser tests 3, 4, 6 |
| No external dependencies | PASS | no `package.json`, no network requests |
| Separate HTML, CSS and JavaScript files | PASS | three files |
| Pure logic tests separate from DOM tests | PASS | `tests/greeting.test.js` and `tests/browser/` |

## 4. Technical corrections to the original chapter

| Original (v30) | Issue | Premium chapter |
| --- | --- | --- |
| Click handler plus a separate `keydown` handler that calls `greetButton.click()` | Duplicated logic; Enter handling done by hand | A `form` with one `submit` handler, which covers click and Enter natively |
| `<!doctype html>` and compressed one-line CSS rules | Hard for a beginner to read and type | Standard formatting, one declaration per line |
| Project introduces `'use strict'`, arrow functions and `event.key` with no explanation | Concepts used before being taught | Every construct in the project is introduced earlier in the chapter |
| No expected output for any example | Reader cannot confirm success | Every runnable example is followed by its real output |
| Exercise 1 needs `new Date().getHours()` | Not taught in the chapter | All 12 exercises use only chapter material |
| 5 MCQs, answers inline after each question | Below the required count; answer visible while reading | 10 MCQs; answers and explanations in a separate section |
| Exercise solutions are one-line hints | Not complete | Full solutions with code, all executed |

## 5. External references

Checked online on 11 October 2026:

- The five Further Reading links (MDN JavaScript Guide, MDN Learn web development, Node.js Learn, VS Code Docs, Chrome DevTools) each open the page named in the chapter.
- `nodejs.org/en/about/previous-releases` lists v22 and v24 as LTS lines, v24 as the latest LTS, and v20 as end-of-life. The chapter tells readers to install whichever release the site marks LTS and gives no version to install, so it will not go stale.

## 6. Not tested

These are stated plainly so they are not mistaken for verified behaviour.

- **Other browsers.** Firefox, Safari and Edge were not run. The chapter's statement that Firefox words the same errors differently was not verified here.
- **Real devices.** The mobile check is a 360 px emulated viewport in desktop Chrome, not a phone.
- **Screen readers.** The attributes are present and correct, but no screen reader was run.
- **macOS and Linux.** The terminal command table was verified only in Windows PowerShell. Keyboard shortcuts for macOS were not verified.
- **Installation steps.** The Browser, VS Code and Node.js installers were not run; the software was already installed.
- **Native Enter in other engines.** Enter-to-submit was tested with a real key event in Chrome only.
- **Chrome's console paste warning.** Not checked, and the chapter does not mention it.

## 7. Note for the Draft Edition

The Draft Edition's copyright page says the code targets "Node.js 20 বা পরবর্তী সংস্করণ". Node.js 20 is now end-of-life according to nodejs.org. The Draft Edition was not modified, as instructed; this should be updated when the full book is rebuilt.
