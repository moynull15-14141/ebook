# Table, Callout, Exercise and MCQ Standards

## 1. Tables

Write GitHub-style pipe tables. Use a table when the reader compares items across the same properties; use a list otherwise.

**Rules**

1. **Two to four columns.** A wider comparison should be split or turned into a list.
2. **A header row is required.** It repeats at the top of each page the table continues on.
3. **A row is never split across pages.**
4. **Keep cells short:** a phrase or one or two sentences. A cell that needs a paragraph belongs in the text.
5. **No code blocks inside cells.** Inline code is fine.
6. **Column widths are set automatically** from the longest cell in each column, with a minimum width, and are the same in the PDF and the DOCX. Do not try to force widths with spaces.
7. **No merged cells, no nested tables, no cell alignment markup.**

**Look:** tinted header with a navy rule beneath it, hairline cell borders, light zebra rows, 9.7 pt text, 1.55 mm × 2.5 mm cell padding.

`check-docx.py` verifies that every table has a repeating header and unsplittable rows, and that the table count matches the Markdown.

## 2. Callouts

A callout is a blockquote that opens with one of four bold labels. Any other blockquote stops the build.

| Label | Type | Use for | Edge and tint |
| --- | --- | --- | --- |
| `**নোট:**` | Note | Background a careful reader will want | Cyan |
| `**সতর্কতা:**` | Warning | Something that will cause loss, a security problem or wasted hours | Amber, double rule |
| `**পরামর্শ:**` | Tip | A better way to work | Green |
| `**মনে রাখুন:**` | Remember | A rule the reader will rely on later | Navy |

Example:

```
> **সতর্কতা:** Software সব সময় নির্মাতার নিজস্ব Website থেকে Download করুন।
```

**Rules**

1. **The label carries the meaning.** In grayscale the four tints look alike; the label, and the warning's double rule, tell them apart.
2. **One idea per callout,** normally one to three sentences.
3. **Do not put essential steps in a callout.** A reader who skips every callout must still be able to complete the chapter.
4. **At most one callout per page on average.** Too many and none stand out.
5. **No code blocks inside callouts.** Inline code is fine.
6. A callout is never split across pages.

## 3. Exercises

Section heading: `## N.x অনুশীলনী`. Three levels, each an H3, in this order:

1. `### প্রাথমিক স্তর` — recall and small changes
2. `### মধ্যম স্তর` — writing a small piece from scratch
3. `### চ্যালেঞ্জ স্তর` — extending the chapter project

**Rules**

1. **One numbered list across all three levels** (1, 2, 3 … without restarting), so "exercise 7" is unambiguous.
2. **Every exercise must be solvable with material from this chapter or earlier ones.**
3. A challenge exercise opens with a bold short name: `**গণনা:** …`.
4. State the expected result precisely enough that the reader can check their own answer.

## 4. Solutions

Section heading: `## N.y অনুশীলনীর সমাধান`, directly after the exercises.

Each solution starts with a paragraph that begins `**সমাধান N**`. That label is drawn as a boxed tab with a rule above it, so a solution cannot be mistaken for an exercise statement.

**Rules**

1. **One solution per exercise, with the same number.** `check-manuscript.mjs` compares the two lists.
2. **Solution code is executed** and follows all the rules in `CODE_BLOCK_STANDARDS.md`.
3. Where the answer is a change to an existing file, use a `fragment=` listing and say where the lines go.
4. Where more than one answer is right, say so.

## 5. MCQs

Section heading: `## N.z MCQ: নিজেকে যাচাই করুন`.

```
**প্রশ্ন ১.** Web Page-এ JavaScript-এর প্রধান ভূমিকা কী?

- ক) Page-এর কাঠামো তৈরি করা
- খ) Page-এর রং ও Font ঠিক করা
- গ) Page-এর আচরণ নিয়ন্ত্রণ করা
- ঘ) Page-কে Internet-এ প্রকাশ করা
```

**Rules**

1. **Exactly 10 questions, each with exactly four options labelled ক, খ, গ, ঘ.**
2. **One correct answer per question.** Wrong options must be plausible, not jokes.
3. **Correct answers must use at least three of the four positions.**
4. A question and its options are kept together on one page, with a rule down the left.
5. **Answers are in the next section,** never beside the question.

## 6. MCQ answers

Section heading: `## N.z+1 MCQ-এর উত্তর ও ব্যাখ্যা`.

1. First, a **quick answer key** on one line, for a reader who only wants to mark their answers:
   `**দ্রুত উত্তরমালা:** ১–গ · ২–ক · ৩–ঘ · …`
2. Then a three-column table: question number, answer letter, explanation.

**Rules**

1. **Every answer has an explanation** that says why it is right and, where useful, why the tempting wrong option is wrong.
2. **The quick key must match the table.** `check-manuscript.mjs` compares them.

## 7. Figures

`![চিত্র N.M — caption](path/to/file.png)` on a line of its own.

1. **PNG only.** A screenshot must come from the real, tested project; where possible it is produced by the chapter's browser test so it can be regenerated.
2. **The caption describes what the figure shows**; it is also the image's alternative text.
3. Number figures `N.M` with Bengali numerals.
4. A figure is 96 mm wide, centred, and never split from its caption.
