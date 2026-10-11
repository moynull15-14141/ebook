// Front matter for the Draft Edition. Inline Markdown (**bold**, `code`) is allowed.
export default {
  edition: 'প্রথম পূর্ণাঙ্গ খসড়া সংস্করণ (Draft Edition) • অক্টোবর ২০২৬',
  coverTagline: '৩০টি অধ্যায় • ৩০টি Practical Project • Browser থেকে Backend, Testing, Security ও System Design',

  // Author details exactly as supplied by the author; nothing here is inferred.
  author: {
    name: 'Moynul Hasan',
    role: 'IT Officer, M&N Holidays',
    education: 'Computer Science and Engineering (CSE), Daffodil International University',
    address: 'Bogura, Bangladesh',
    phone: '01745334044',
  },

  copyright: [
    '**JavaScript Mastery — শূন্য থেকে প্রফেশনাল**',
    'লেখক: **Moynul Hasan**',
    'প্রথম পূর্ণাঙ্গ খসড়া সংস্করণ (Draft Edition), অক্টোবর ২০২৬',
    'যোগাযোগ: Moynul Hasan, Bogura, Bangladesh • ফোন: 01745334044',
    '© ২০২৬ Moynul Hasan। সর্বস্বত্ব সংরক্ষিত। লেখকের লিখিত অনুমতি ছাড়া এই বইয়ের কোনো অংশ কোনো মাধ্যমে পুনরুৎপাদন, সংরক্ষণ বা বিতরণ করা যাবে না।',
    '**খসড়া সংস্করণ সম্পর্কে:** এটি বইটির প্রথম পূর্ণাঙ্গ খসড়া। বিষয়বস্তু, Code, ভাষা ও বিন্যাস এখনো সম্পাদনা এবং কারিগরি পর্যালোচনার অধীনে রয়েছে। চূড়ান্ত সংস্করণে অধ্যায় সম্প্রসারণ, সংশোধন ও পুনর্বিন্যাস হতে পারে।',
    '**দায়মুক্তি:** এই বইয়ের সব Code, Project ও উদাহরণ শিক্ষামূলক উদ্দেশ্যে তৈরি। এগুলো Production System হিসেবে ব্যবহারের উপযোগী নয়; বাস্তব প্রয়োগের আগে নিজস্ব Security, Testing ও Code Review আবশ্যক। বইয়ের তথ্য ব্যবহারের ফলে সৃষ্ট কোনো ক্ষতির জন্য লেখক দায়ী নন। উদাহরণে ব্যবহৃত ব্যক্তি, Booking, Package, মূল্য ও অন্যান্য Data কাল্পনিক।',
    '**Trademark:** JavaScript যুক্তরাষ্ট্রে Oracle Corporation-এর Trademark। Node.js OpenJS Foundation-এর Trademark। TypeScript ও Windows Microsoft Corporation-এর এবং Chrome Google LLC-এর Trademark। বইয়ে উল্লিখিত অন্যান্য Product ও Service-এর নাম তাদের নিজ নিজ মালিকের Trademark; এখানে শুধু বর্ণনামূলক উদ্দেশ্যে ব্যবহৃত।',
    '**Software:** বইয়ের Code উদাহরণ ও Project-গুলো Node.js 20 বা পরবর্তী সংস্করণ এবং আধুনিক Browser (Chrome, Edge, Firefox) লক্ষ্য করে লেখা।',
  ],

  preface: `
JavaScript আজ শুধু Web Page-কে Interactive করার ভাষা নয়; Browser, Server, Mobile, Desktop এবং Cloud—সব জায়গায় এর ব্যবহার। এই বইয়ের লক্ষ্য তোমাকে একেবারে প্রথম \`console.log()\` থেকে শুরু করে পরীক্ষিত, নিরাপদ ও রক্ষণাবেক্ষণযোগ্য JavaScript Application তৈরির পেশাদার মানসিকতা পর্যন্ত নিয়ে যাওয়া।

## এই বই কার জন্য

- যারা Programming একেবারে নতুন শুরু করছে এবং বাংলায় ধাপে ধাপে শিখতে চায়।
- যারা JavaScript-এর মৌলিক বিষয় জানে, কিন্তু Async, Testing, Security, Architecture বা Backend-এ আত্মবিশ্বাসী হতে চায়।
- যারা Job Interview বা Portfolio Project-এর জন্য বাস্তবসম্মত প্রস্তুতি নিতে চায়।

## বইটির গঠন

বইটি ৩০টি অধ্যায়ে সাজানো, এবং প্রতিটি অধ্যায় আগের অধ্যায়ের ওপর ভিত্তি করে এগোয়:

- **অধ্যায় ১–৯ — মৌলিক ভিত্তি:** Variables, Data Types, Operators, Loops, Functions, Arrays, Objects, Strings এবং DOM ও Events।
- **অধ্যায় ১০–১৮ — আধুনিক JavaScript:** Asynchronous Programming, Error Handling, Modules, OOP, Closures, Browser APIs, Testing, Regular Expressions এবং Functional Programming।
- **অধ্যায় ১৯–২৪ — পেশাদার Engineering:** Performance, Security, Design Patterns, Testing Mastery, Profiling এবং TypeScript।
- **অধ্যায় ২৫–৩০ — Backend থেকে System Design:** Node.js Backend, Database, Real-Time Application, Deployment, Distributed System এবং Full-Stack Capstone ও Career Roadmap।

## প্রতিটি অধ্যায় কীভাবে সাজানো

প্রায় প্রতিটি অধ্যায়ে পাবে: শেখার লক্ষ্য, উদাহরণসহ ধারণার ব্যাখ্যা, একটি Practical Project, সাধারণ ভুল ও Debugging নির্দেশনা, অনুশীলনী ও তার সমাধান, এবং উত্তর ও ব্যাখ্যাসহ MCQ। প্রথমে নিজে চেষ্টা করো, তারপর সমাধান মিলিয়ে দেখো।

## Code ও Project চালানোর নির্দেশিকা

- প্রতিটি অধ্যায়ের Project-এর সম্পূর্ণ Source Code বইয়ের Companion Source Code-এর \`source-code/chapter-NN/\` Folder-এ রয়েছে (যেমন অধ্যায় ৫-এর জন্য \`source-code/chapter-05/\`)। বইয়ে মূল অংশগুলো ব্যাখ্যা করা হয়েছে।
- Browser Project-এর জন্য Project Folder-এ \`python -m http.server 8000\`-এর মতো একটি Local HTTP Server চালিয়ে \`http://localhost:8000\` খোলো; ES Modules সাধারণত \`file://\` থেকে ঠিকমতো চলে না।
- Automated Test চালাতে Node.js 20 বা পরবর্তী সংস্করণ Install করে Project Folder-এ \`node --test\` বা অধ্যায়ে দেওয়া Command চালাও।
- Code Block-এর ওপরের ছোট Label (JavaScript, Terminal, HTML ইত্যাদি) Code-এর ধরন নির্দেশ করে। দীর্ঘ Line পাতার প্রস্থে ভেঙে দেখানো হয়েছে; আসল File-এ সেগুলো এক Line।

## কিছু গুরুত্বপূর্ণ নীতি

- টাকার হিসাব সাধারণত পূর্ণসংখ্যা BDT বা Paisa-এর মতো Minor Unit-এ করা হয়েছে, যাতে Floating-Point ত্রুটি এড়ানো যায়।
- User Input দেখাতে \`innerHTML\`-এর বদলে \`textContent\` ব্যবহার করা হয়েছে—নিরাপত্তা এই বইয়ের একটি ধারাবাহিক বিষয়।
- বইয়ের Project-গুলো শেখার জন্য ইচ্ছাকৃতভাবে ছোট রাখা হয়েছে। প্রতিটি অধ্যায়ে স্পষ্টভাবে বলা আছে কোন অংশ Production-এর জন্য যথেষ্ট নয় এবং বাস্তবে আর কী প্রয়োজন।

## খসড়া সংস্করণ সম্পর্কে

এটি বইটির প্রথম পূর্ণাঙ্গ খসড়া সংস্করণ। পরবর্তী সংস্করণে অধ্যায়গুলো আরও বিস্তৃত করা, Diagram যোগ করা এবং ভাষা ও পরিভাষা আরও সামঞ্জস্যপূর্ণ করার পরিকল্পনা রয়েছে। ভুল বা অস্পষ্টতা চোখে পড়লে তা চিহ্নিত করে রাখো—তোমার প্রতিক্রিয়া পরবর্তী সংস্করণকে আরও ভালো করবে।

শুভ কোডিং!
`,
};
