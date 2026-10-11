# Interactive Greeting App

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**, অধ্যায় ১-এর Project।

ব্যবহারকারী নিজের নাম লিখে Button চাপলে (অথবা `Enter` চাপলে) Page তাঁকে নাম ধরে শুভেচ্ছা জানায়। নাম ফাঁকা থাকলে একটি সতর্কবার্তা দেখায়।

> এটি একটি শিক্ষামূলক Project। বাস্তব ব্যবহারকারীদের জন্য তৈরি Application নয়: এখানে কোনো Data সংরক্ষণ করা হয় না এবং Server-এর সঙ্গে কোনো যোগাযোগ নেই।

## File-এর তালিকা

| File | কাজ |
| --- | --- |
| `index.html` | Page-এর কাঠামো: Form, Label, Input, Button এবং বার্তার জায়গা |
| `style.css` | Page-এর চেহারা এবং ছোট-বড় পর্দায় মানিয়ে নেওয়ার নিয়ম |
| `app.js` | শুভেচ্ছা তৈরি এবং Form Submit সামলানোর Code |
| `tests/greeting.test.js` | `createGreeting()` Function-এর ৮টি Automated Test |
| `tests/browser/run-browser-tests.mjs` | আসল Browser-এ পুরো Page-এর ১২টি Automated Test |
| `tests/browser/screenshots/` | Browser Test চলার সময় তোলা Screenshot |

## চালানোর নিয়ম

কোনো কিছু Install করার প্রয়োজন নেই।

1. এই Folder-টি আপনার Computer-এ রাখুন।
2. `index.html` File-টিতে Double-click করুন। Page-টি আপনার Browser-এ খুলবে।
3. নাম লিখে **শুভেচ্ছা দেখান** Button-এ Click করুন, অথবা `Enter` চাপুন।

## প্রত্যাশিত আচরণ

| আপনি যা করবেন | যা দেখা যাওয়ার কথা |
| --- | --- |
| `Rahim` লিখে Button-এ Click | সবুজ রঙে: স্বাগতম, Rahim! JavaScript শেখার যাত্রা শুরু হোক। |
| নাম লিখে `Enter` চাপা | একই শুভেচ্ছা-বার্তা |
| কিছু না লিখে Button-এ Click | লাল রঙে: অনুগ্রহ করে আপনার নাম লিখুন।; Cursor Input ঘরে ফেরে |
| শুধু Space লিখে Click | একই সতর্কবার্তা |
| নামের আগে-পরে Space দিয়ে Click | বাড়তি Space ছাড়া শুভেচ্ছা |
| `<b>Test</b>` লিখে Click | লেখাটি হুবহু দেখায়; মোটা অক্ষর হয় না |

## Test চালানো

Test চালাতে Node.js প্রয়োজন। সব Command এই Folder-এর ভেতর থেকে চালাতে হবে। কোনো npm Package লাগে না।

### ১. Syntax যাচাই

```bash
node --check app.js
```

কোনো লেখা না দেখালে Syntax ঠিক আছে।

### ২. `createGreeting()` Function-এর Test

```bash
node --test
```

শেষে `# pass 8` এবং `# fail 0` দেখানোর কথা।

### ৩. Browser Test

```bash
node tests/browser/run-browser-tests.mjs
```

এই Test একটি আসল Chrome বা Edge Browser-কে পর্দা ছাড়া (Headless) চালিয়ে Page-এ নাম লেখে, Button-এ Click করে এবং `Enter` চাপে। শেষে `12 passed, 0 failed` দেখানোর কথা।

- প্রয়োজন: Node.js 22 বা পরবর্তী সংস্করণ, এবং Computer-এ Install করা Chrome অথবা Edge।
- Browser স্বয়ংক্রিয়ভাবে খুঁজে না পেলে `CHROME_PATH` Environment Variable-এ Browser-এর Path দিন।

Browser Test যা যাচাই করে: সঠিক নাম, ফাঁকা নাম, শুধু Space, `Enter` Key, আগে-পরের Space বাদ যাওয়া, HTML-এর মতো লেখা নিরাপদে দেখানো, ভুলের পর সঠিক নাম, Label ও Status Region, Keyboard দিয়ে চালানো (`Tab` ও `Space`), ৩৬০ Pixel চওড়া Mobile পর্দায় বিন্যাস, এবং Console-এ কোনো Error না থাকা।

### হাতে যাচাই করার তালিকা

নিচের বিষয়গুলো Automated Test-এ নেই; এগুলো নিজে পরীক্ষা করতে হবে।

- [ ] Firefox এবং Safari-তে Page-টি খুলে ওপরের টেবিলের প্রতিটি সারি পরীক্ষা করা।
- [ ] একটি আসল Mobile Phone-এ Page-টি খুলে লেখা ও Button ব্যবহারযোগ্য কি না দেখা।
- [ ] একটি Screen Reader (যেমন NVDA বা VoiceOver) চালু রেখে Label এবং ফলাফলের বার্তা পড়ে শোনানো হয় কি না দেখা।
- [ ] Browser-এর Zoom ২০০% করে লেখা কাটা পড়ে কি না দেখা।

## পরীক্ষিত পরিবেশ

এই Project-এর Test Windows 10-এ Node.js v22.16.0 এবং Chrome 155 (Headless) দিয়ে চালানো হয়েছে। অন্য Operating System, Browser বা আসল Mobile Device-এ পরীক্ষা করা হয়নি।

## আরও চেষ্টা করুন

অধ্যায়ের অনুশীলনী ১০, ১১ ও ১২-এ এই Project-এ তিনটি নতুন সুবিধা যোগ করতে বলা হয়েছে: শুভেচ্ছার সংখ্যা গণনা, **মুছে ফেলুন** Button এবং শহরের নামের জন্য দ্বিতীয় Input। তিনটির সম্মিলিত সমাধান `examples/solutions/challenge-greeting-app/` Folder-এ আছে।
