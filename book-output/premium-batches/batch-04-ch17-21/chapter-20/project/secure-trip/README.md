# SecureTrip

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ২০-এর Project।

একটি স্থানীয় Trip Request Portal (Node.js `node:http` + `node:sqlite`, কোনো npm Package নয়): Login, নিজের Trip-এর অনুরোধ তৈরি ও দেখা, Admin সব দেখেন। প্রতিটি নিরাপত্তা-নিয়ন্ত্রণ Test দিয়ে যাচাই করা।

> **সতর্কতা:** এটি একটি **শিক্ষামূলক Demo**, Production-এর উপযুক্ত নয়। Server শুধু `127.0.0.1`-এ চলে, তথ্য Memory-তে থাকে এবং বন্ধ করলে মুছে যায়। কোনো স্বাধীন Security Review বা Penetration Test হয়নি। এটি Internet-এ Deploy করবেন না। বাস্তব System-এ যা লাগবে, তার তালিকা অধ্যায়ের অনুচ্ছেদ ২০.১২-এ।

## চালানো

Node.js 22.5 বা নতুন (`node:sqlite`)। চালানোর সময় SQLite-এর একটি "ExperimentalWarning" দেখা যায়; তা স্বাভাবিক।

```bash
node server.mjs
node --test
```

`node server.mjs` ঠিকানা (`http://127.0.0.1:3020`), তিনটি Demo ব্যবহারকারী (`rafi@example.com`, `mina@example.com`, `admin@example.com`) এবং সেই চালানোর এলোমেলো Demo Password দেখায়। নিজের Password দিতে চাইলে `SECURETRIP_DEMO_PASSWORD` Environment Variable; অন্য Port-এর জন্য `PORT`।

`node --test` ২৪টি Test চালায়: `units.test.mjs` ১১টি, এবং আসল HTTP Server-এর বিরুদ্ধে `api.test.mjs` ১৩টি (শুধু 127.0.0.1, এলোমেলো Port)। শেষে `# pass 24`, `# fail 0`।

## File

| File | কাজ |
| --- | --- |
| `server.mjs` | চালু করে, Demo ব্যবহারকারী তৈরি |
| `src/start.mjs` | সব অংশ জুড়ে Server (`startServer`) |
| `src/app.mjs` | Route, Authentication, Object-level Authorization, CSRF, Static File |
| `src/http.mjs` | Security Header, `readJson` (আকার, ধরন), Cookie |
| `src/passwords.mjs` | scrypt Hash, `timingSafeEqual` |
| `src/sessions.mjs` | Session ও CSRF Token, `safeEqual` |
| `src/validate.mjs` | Allowlist Validation, Server-এর Catalog-এর দাম |
| `src/db.mjs` | SQLite, Parameterized Query |
| `src/limiter.mjs` | ব্যর্থ Login-এর সীমা |
| `src/log.mjs` | Redaction-সহ Log |
| `public/` | UI: `index.html`, `app.mjs`, `style.css` (কোনো Inline Script নেই) |

## Error Handling

- অবৈধ Body: 400 (ভাঙা JSON), 413 (১০ KB-র বেশি), 415 (JSON নয়), 422 (Validation, কারণসহ)।
- 401 Login নেই; 403 CSRF Token বা Origin ভুল; 404 নেই অথবা অন্যের Trip; 429 অনেকবার ব্যর্থ Login।
- অপ্রত্যাশিত Error: ব্যবহারকারী পান সাধারণ বার্তা ও 500; বিস্তারিত শুধু Server-এর Log-এ, Redaction-সহ।
