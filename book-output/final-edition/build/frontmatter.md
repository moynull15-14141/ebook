<!-- jsm:part kind=title id=title-page -->
# JavaScript Mastery

শূন্য থেকে প্রফেশনাল

৩০টি অধ্যায় • ৩০টি পরীক্ষিত Project • Browser থেকে Backend, Testing, Security, Deployment ও System Design

**Moynul Hasan**

সম্পূর্ণ সংস্করণ • প্রকাশ-পূর্ব Proof, অক্টোবর ২০২৬

<!-- jsm:part kind=copyright id=copyright -->
# স্বত্ব ও প্রকাশনা তথ্য

**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**

লেখক: **Moynul Hasan**

© ২০২৬ Moynul Hasan। সর্বস্বত্ব সংরক্ষিত। লেখকের লিখিত অনুমতি ছাড়া এই বইয়ের কোনো অংশ কোনো মাধ্যমে পুনরুৎপাদন, সংরক্ষণ বা বিতরণ করা যাবে না।

সংস্করণ: সম্পূর্ণ সংস্করণ, প্রকাশ-পূর্ব Proof (সম্পাদকীয় Proofread-এর জন্য), অক্টোবর ২০২৬

ISBN: **[প্রকাশকের কাছ থেকে প্রাপ্তব্য — এখনো নির্ধারিত হয়নি]**

প্রকাশক: **[এখনো নির্ধারিত হয়নি]**

প্রথম প্রকাশের তারিখ: **[এখনো নির্ধারিত হয়নি]**

Companion Code-এর License: **[লেখক নির্ধারণ করবেন — এখনো নির্ধারিত হয়নি]**

**দায়মুক্তি:** এই বইয়ের সব Code, Project ও উদাহরণ শিক্ষামূলক উদ্দেশ্যে তৈরি। প্রতিটি অধ্যায়ে স্পষ্ট বলা আছে কোন অংশ Production-এর জন্য যথেষ্ট নয়। বাস্তব প্রয়োগের আগে নিজস্ব Security Review, Testing ও Code Review করুন। লেখক ও প্রকাশক এই Code-এর ব্যবহারজনিত কোনো ক্ষতির জন্য দায়ী নন।

**Trademark:** JavaScript যুক্তরাষ্ট্রে Oracle Corporation-এর Trademark। Node.js OpenJS Foundation-এর Trademark। TypeScript ও Windows Microsoft Corporation-এর, Chrome Google LLC-এর, এবং Docker Docker Inc.-এর Trademark। বইয়ে উল্লিখিত অন্যান্য Product ও Service-এর নাম তাদের নিজ নিজ মালিকের Trademark হতে পারে; এখানে শুধু পরিচয়ের জন্য ব্যবহৃত।

**যাচাই:** বইয়ের প্রতিটি চালানো-যোগ্য Listing ও প্রতিটি Project-এর Test Windows 10, Node.js 22.16.0 ও Chrome 155-এ চালিয়ে দেখা হয়েছে। যা চালানো সম্ভব হয়নি (যেমন Docker Build বা PostgreSQL), তা সংশ্লিষ্ট অধ্যায়ে স্পষ্টভাবে চিহ্নিত।

<!-- jsm:part kind=front id=author -->
# লেখক পরিচিতি

**Moynul Hasan** বর্তমানে M&N Holidays-এ IT Officer হিসেবে কর্মরত। তাঁর শিক্ষার ক্ষেত্র Computer Science and Engineering (CSE), Daffodil International University। এই বইয়ের অনেক উদাহরণ ও Project ভ্রমণ-ব্যবসার প্রেক্ষাপটে সাজানো—Package, Booking, Visa ও গ্রাহকসেবা।

| | |
| --- | --- |
| নাম | Moynul Hasan |
| পেশা | IT Officer, M&N Holidays |
| শিক্ষা | Computer Science and Engineering (CSE), Daffodil International University |
| ঠিকানা | Bogura, Bangladesh |
| যোগাযোগ | 01745334044 |

<!-- jsm:part kind=front id=preface -->
# ভূমিকা

JavaScript আজ শুধু Web Page-কে চলমান করার ভাষা নয়। Browser, Server, Mobile, Desktop ও Cloud—সব জায়গায় এর ব্যবহার। বাংলাভাষী শিক্ষার্থীদের অনেকেই এই ভাষা শিখতে চান, কিন্তু ভালো মানের উপকরণের বেশির ভাগই ইংরেজিতে, আর বাংলায় যা পাওয়া যায় তা প্রায়ই মৌলিক Syntax-এ থেমে যায়। এই বইয়ের লক্ষ্য সেই ফাঁক পূরণ করা: একেবারে প্রথম `console.log()` থেকে শুরু করে পরীক্ষিত, নিরাপদ ও রক্ষণযোগ্য পেশাদার Application পর্যন্ত একটি ধারাবাহিক পথ।

বইটির একটি মূল নীতি আছে: **যা দেখানো হয়েছে, তা চালিয়ে দেখা হয়েছে।** প্রতিটি Code Listing একটি আসল File থেকে নেওয়া, প্রতিটি Output Panel আসল চালনার ফল, এবং প্রতিটি অধ্যায়ের Project-এর স্বয়ংক্রিয় Test আছে। যেখানে কিছু চালানো সম্ভব হয়নি—যেমন Docker Build বা একটি আলাদা Database Server—সেখানে তা স্পষ্টভাবে বলা হয়েছে। Production-এর জন্য কী যথেষ্ট নয়, তা-ও প্রতিটি Project-এর README ও অধ্যায়ে লেখা।

আরেকটি নীতি: প্রযুক্তিগত শব্দ ইংরেজিতেই রাখা হয়েছে (Function, Promise, Transaction), কারণ কাজের জগতে, Documentation-এ ও Error-বার্তায় আপনি এগুলোই দেখবেন; ব্যাখ্যা বাংলায়। প্রতিটি অধ্যায়ের শেষে একটি পরিভাষার সারণি আছে, আর বইয়ের শেষে সব পরিভাষার একটি একত্রিত কোষ।

বইয়ের বহু উদাহরণ ভ্রমণ-ব্যবসার প্রেক্ষাপটে: Package, Booking, Visa বা Loyalty Point—বাস্তব সমস্যা, বাস্তব নিয়ম। আশা করি সেগুলো আপনার নিজের Project-এর জন্যও অনুপ্রেরণা হবে।

শুভকামনাসহ,
**Moynul Hasan**

<!-- jsm:part kind=front id=about -->
# বইটি সম্পর্কে

## এই বই কার জন্য

- যাঁরা Programming একেবারে নতুন শুরু করছেন এবং বাংলায় ধাপে ধাপে শিখতে চান।
- যাঁরা JavaScript-এর মৌলিক বিষয় জানেন, কিন্তু Asynchronous Programming, Testing, Security, Architecture বা Backend-এ আত্মবিশ্বাসী হতে চান।
- যাঁরা চাকরির Interview বা Portfolio-র জন্য বাস্তবসম্মত প্রস্তুতি নিতে চান।

## বইটির গঠন

বইটি ৩০টি অধ্যায়ে সাজানো; প্রতিটি অধ্যায় আগের অধ্যায়ের ওপর দাঁড়িয়ে:

| অংশ | অধ্যায় | বিষয় |
| --- | --- | --- |
| ভিত্তি | ১-৯ | প্রথম পদক্ষেপ, Variable ও Data Type, Operator, Loop, Function, Array, Object, String, DOM ও Event |
| আধুনিক JavaScript | ১০-১৮ | Asynchronous Programming, Error Handling, Modules, OOP, Closure, Browser API, Debugging ও Testing, Regular Expression, Functional Programming |
| পেশাদার Engineering | ১৯-২৪ | Performance, Security, Design Pattern, Testing Mastery, Profiling, TypeScript |
| Backend থেকে System Design | ২৫-৩০ | Node.js Backend, Database, Real-Time, Deployment, Distributed System, Full-Stack Capstone ও Career Roadmap |

## প্রতিটি অধ্যায়ের কাঠামো

প্রতিটি অধ্যায় একই ক্রমে সাজানো, যাতে আপনি জানেন কোথায় কী পাবেন: শেখার লক্ষ্য; পূর্বশর্ত; অধ্যায়টি কেন গুরুত্বপূর্ণ; ধাপে ধাপে ধারণা ও চালানো-যোগ্য উদাহরণ; একটি পূর্ণাঙ্গ Project ও তার ব্যাখ্যা; সাধারণ ভুল; Debugging নির্দেশিকা; পেশাদার অভ্যাস; প্রাথমিক, মধ্যম ও চ্যালেঞ্জ স্তরের অনুশীলনী ও তাদের সমাধান; দশটি MCQ ও ব্যাখ্যাসহ উত্তর; সারসংক্ষেপ; পরিভাষা; এবং আরও পড়ার তালিকা।

<!-- jsm:part kind=front id=how-to-use -->
# বইটি কীভাবে ব্যবহার করবেন

## ক্রমানুসারে পড়ুন, কিন্তু হাতে-কলমে

অধ্যায়গুলো ক্রমানুসারে পড়ার জন্য লেখা। প্রতিটি উদাহরণ নিজে লিখে চালান—Copy-Paste নয়। একটি Output Panel-এর সঙ্গে নিজের ফল মিলিয়ে দেখুন; না মিললে কারণ খুঁজুন। সেটিই সবচেয়ে বড় শিক্ষা।

## Code Panel পড়ার নিয়ম

- **Panel-এর শিরোনাম:** File-এর নাম, ভাষা (JavaScript, HTML, Terminal ইত্যাদি) এবং কোথায় চলবে (চলবে: Node.js, Browser, বা দুটিই)।
- **অংশ N / M (Part N of M):** একটি দীর্ঘ File কয়েকটি Panel-এ ভাগ করা; সব অংশ মিলে সম্পূর্ণ File। `// ...` চিহ্ন বলে এখানে আগের বা পরের অংশ জোড়া লাগবে।
- **নির্বাচিত অংশ (Selected Excerpt):** File-এর শুধু প্রাসঙ্গিক অংশ; সম্পূর্ণ File Companion Code-এ।
- **Output / Error Message:** ঠিক আগের Listing চালালে যা দেখা যায়, আসল চালনা থেকে নেওয়া। সময় বা যন্ত্রভেদে বদলায় এমন মান (যেমন Millisecond) কোথাও কোথাও বাদ রাখা হয়েছে, এবং তা লেখায় বলা আছে।
- **Terminal:** Command Line-এ লেখার Command।
- **দীর্ঘ Line:** পাতার প্রস্থে ভেঙে একটু ডানে সরিয়ে দেখানো; আসল File-এ সেটি এক Line।

## অনুশীলনী ও MCQ

প্রতিটি অধ্যায়ের অনুশীলনী তিন স্তরে: প্রাথমিক, মধ্যম ও চ্যালেঞ্জ। আগে নিজে চেষ্টা করুন, তারপর সমাধান দেখুন। MCQ-গুলোর উত্তর ব্যাখ্যাসহ দেওয়া; ভুল হলে ব্যাখ্যাটি পড়ে সংশ্লিষ্ট অনুচ্ছেদে ফিরে যান।

<!-- jsm:part kind=front id=requirements -->
# প্রযুক্তিগত প্রয়োজন

| বিষয় | প্রয়োজন | মন্তব্য |
| --- | --- | --- |
| Node.js | ২২.৫ বা নতুন | অধ্যায় ১-২৫ Node.js ২০-এও চলে; অধ্যায় ২৬, ২৭-এর Outbox, ২৯ ও ৩০-এর জন্য `node:sqlite` লাগে (২২.৫+)। যাচাই: Node.js 22.16.0 |
| Browser | আধুনিক Chrome, Edge বা Firefox | যাচাই: Chrome 155 |
| Code Editor | যেকোনো (যেমন Visual Studio Code) | — |
| npm Package | অধিকাংশ Project-এ লাগে না | অধ্যায় ২৪: typescript, @types/node; অধ্যায় ২৫: express; অধ্যায় ২৭: ws; অধ্যায় ৩০: ঐচ্ছিক Type Check-এর জন্য typescript |
| Database | আলাদা Server লাগে না | SQLite Node.js-এর অন্তর্নির্মিত; PostgreSQL-এর Code (অধ্যায় ২৬) ঐচ্ছিক ও চালানো হয়নি |
| Docker | ঐচ্ছিক | অধ্যায় ২৮-এর Dockerfile ও Compose File; এই বইয়ের যাচাইয়ে Docker Build চালানো হয়নি |
| Operating System | Windows, macOS বা Linux | যাচাই শুধু Windows 10-এ |

Browser-এর Project-গুলো `file://` থেকে নয়, একটি Local HTTP Server থেকে খুলুন (যেমন Project Folder-এ `npx serve` বা `python -m http.server 8000`), কারণ ES Module ও `fetch` সাধারণত `file://`-এ ঠিকমতো চলে না।

<!-- jsm:part kind=front id=companion-code -->
# Companion Code

বইয়ের সঙ্গে একটি Companion Code Archive দেওয়া আছে: `JavaScript_Mastery_Companion_Code.zip`। এর গঠন:

```text kind=structure
JavaScript_Mastery_Companion_Code/
├── README.md              প্রয়োজন, চালানোর নিয়ম, যাচাই-পরিবেশ
├── chapter-01/
│   ├── project/
│   │   └── interactive-greeting-app/
│   └── examples/          অধ্যায়ের উদাহরণ ও সমাধানের File
├── chapter-02/
│   ├── project/student-result-calculator/
│   └── examples/
├── ...
└── chapter-30/
    ├── project/travel-master-pro/
    └── examples/
```

প্রতিটি Project Folder-এ একটি README আছে, যেখানে চালানোর Command, প্রয়োজনীয় Node.js সংস্করণ ও সীমাবদ্ধতা লেখা। সাধারণ নিয়ম:

1. ZIP খুলে সংশ্লিষ্ট অধ্যায়ের Folder-এ যান।
2. `package.json`-এ Dependency থাকলে প্রথমে `npm install` চালান (মাত্র কয়েকটি Project-এ লাগে)।
3. Test চালাতে Project Folder-এ `npm test` বা `node --test`; Browser Project হলে Local HTTP Server দিয়ে `index.html` খুলুন।

বইয়ের Listing-এর ওপরে বা লেখায় যে Path দেখানো (যেমন `project/travel-live/src/gateway.mjs` বা `examples/02-sse-basic.mjs`), তা সংশ্লিষ্ট অধ্যায়ের Folder থেকে হুবহু একই: `chapter-27/project/travel-live/src/gateway.mjs`। উদাহরণের File-গুলো Project-এর Code `../project/...` Path দিয়ে Import করে, তাই Folder-এর গঠন বদলাবেন না। পরিশিষ্ট খ-তে প্রতিটি অধ্যায়ের Project-এর একটি তালিকা আছে।
