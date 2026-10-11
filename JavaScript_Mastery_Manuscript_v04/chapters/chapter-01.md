# অধ্যায় ১ — JavaScript-এর জগতে প্রথম পদক্ষেপ

> **EDITORIAL STATUS: RECONSTRUCTED DRAFT — original chapter text not recovered.** এই লেখা পরিচিত Chapter Outline অনুযায়ী নতুন করে প্রস্তুত করা হয়েছে। Original-এর হুবহু প্রতিলিপি নয়।

## শেখার লক্ষ্য

এই অধ্যায় শেষে পাঠক JavaScript-এর কাজ, HTML/CSS/JavaScript-এর ভূমিকা, Browser Console, Variable, Basic Function, DOM এবং একটি ছোট Interactive Application বুঝতে পারবে।

## ১.১ JavaScript কী এবং কেন প্রয়োজন?

JavaScript হলো একটি উচ্চস্তরের Programming Language, যা Browser-এ Interactive User Interface তৈরি করতে এবং Node.js-এর মাধ্যমে Server-Side Application চালাতে ব্যবহৃত হয়। HTML একটি Web Page-এর Structure নির্ধারণ করে; CSS এর Presentation নির্ধারণ করে; JavaScript Page-এর Behavior পরিচালনা করে। উদাহরণস্বরূপ, একটি Travel Package-এর Booking Button Click করলে Form Validation, Price Calculation এবং API Request পরিচালনায় JavaScript কাজ করতে পারে।

JavaScript এবং Java আলাদা ভাষা। JavaScript-এর Syntax-এর কিছু অংশ Java-র মতো দেখালেও Language Model, Runtime এবং Ecosystem ভিন্ন।

## ১.২ প্রথম JavaScript Program

Browser-এর Developer Tools খুলে Console Tab-এ লিখো:

```javascript
console.log('Hello, JavaScript!');
const destination = 'Bhutan';
console.log(`Next destination: ${destination}`);
```

`console.log()` Debugging ও Learning-এর জন্য সুবিধাজনক। Production Application-এ Sensitive User Data Console-এ Log করা উচিত নয়।

## ১.৩ HTML, CSS এবং JavaScript-এর সম্পর্ক

```text
HTML  → Page Structure
CSS   → Page Appearance
JS    → Page Behavior
```

Browser HTML Parse করে DOM Tree তৈরি করে। JavaScript DOM-এর Elements Select, Read এবং Update করতে পারে।

## ১.৪ Variables এবং Basic Values

```javascript
const packageName = 'Mountain Escape';
let availableSeats = 12;
const priceBdt = 65800;
const isAvailable = availableSeats > 0;

console.log({ packageName, availableSeats, priceBdt, isAvailable });
```

`const` Binding Reassignment বন্ধ করে; `let` পুনরায় Value Assign করতে দেয়। Object বা Array-এর Internal Values `const` থাকলেও পরিবর্তনযোগ্য হতে পারে—পরবর্তী অধ্যায়ে বিস্তারিত থাকবে।

## ১.৫ Functions: Reusable Behavior

```javascript
function makeGreeting(name) {
  const cleanName = name.trim();
  return cleanName ? `স্বাগতম, ${cleanName}!` : 'স্বাগতম!';
}

console.log(makeGreeting('Moynul'));
```

Function একই Logic বারবার না লিখে ব্যবহার করতে সাহায্য করে। Input Validation প্রয়োজন হলে Function-এর শুরুতেই যাচাই করা যায়।

## ১.৬ DOM এবং Events

`document.querySelector()` দিয়ে Element Select করা যায়। `addEventListener()` দিয়ে Click বা Input Event-এর Response লেখা যায়। User Input সরাসরি `innerHTML`-এ বসানো ঝুঁকিপূর্ণ; সাধারণ Text-এর জন্য `textContent` নিরাপদ Default।

## ১.৭ Practical Project — Greeting App

**Project Structure**

```text
greeting-app/
├── index.html
├── style.css
└── app.js
```

### index.html

```html
<!doctype html>
<html lang="bn">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Greeting App</title>
  <link rel="stylesheet" href="style.css">
  <script src="app.js" defer></script>
</head>
<body>
  <main class="card">
    <h1>JavaScript Greeting App</h1>
    <label for="name">তোমার নাম</label>
    <input id="name" type="text" maxlength="80" autocomplete="name">
    <button id="greet" type="button">Say Hello</button>
    <p id="result" role="status" aria-live="polite"></p>
  </main>
</body>
</html>
```

### style.css

```css
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: system-ui, sans-serif; background: #f0f5ff; color: #183153; }
.card { width: min(92vw, 460px); padding: 28px; background: white; border: 1px solid #d9e4f4; border-radius: 18px; }
label, input, button { display: block; width: 100%; }
input, button { padding: 12px; margin-top: 10px; border-radius: 8px; }
input { border: 1px solid #b8c8dc; }
button { border: 0; background: #175cd3; color: white; cursor: pointer; }
#result { min-height: 28px; font-weight: 600; }
```

### app.js

```javascript
'use strict';
const nameInput = document.querySelector('#name');
const greetButton = document.querySelector('#greet');
const result = document.querySelector('#result');

function greeting(name) {
  const cleanName = name.trim();
  return cleanName ? `স্বাগতম, ${cleanName}! JavaScript শেখা শুরু হোক।` : 'অনুগ্রহ করে তোমার নাম লিখো।';
}

greetButton.addEventListener('click', () => {
  result.textContent = greeting(nameInput.value);
});
nameInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') greetButton.click();
});
```

### Run ও Test

`index.html` Browser-এ Open করো। নাম লিখে Button Click করো; ফাঁকা Input দিয়ে Validation পরীক্ষা করো; Enter চাপলেও Greeting দেখাবে। কোনো External Dependency প্রয়োজন নেই।

## ১.৮ Exercises

১. Greeting-এর সঙ্গে বর্তমান সময় অনুযায়ী Morning/Afternoon/Evening Message যোগ করো।

২. Input ফাঁকা থাকলে Error Message দেখাও।

৩. Button Click Count দেখাও।

৪. Greeting Text-এর Color পরিবর্তন করার Button যোগ করো।

৫. `console.log()` এবং `textContent`-এর ব্যবহারিক পার্থক্য ব্যাখ্যা করো।

### Suggested Solutions

**১:** `new Date().getHours()` থেকে Hour নিয়ে Conditional Greeting তৈরি করো। **২:** `name.trim().length === 0` যাচাই করো। **৩:** `let clickCount = 0` দিয়ে Event Handler-এ Increment করো। **৪:** `classList.toggle('highlight')` ব্যবহার করো। **৫:** Console Developer Output; `textContent` Page-এর Visible DOM Text Update করে।

## ১.৯ Knowledge Check

**Q1. HTML-এর প্রধান কাজ কী?** A) Data Query B) Structure C) Deployment D) Encryption। **উত্তর: B**।

**Q2. `const` কী বন্ধ করে?** A) Reassignment B) All Mutation C) All Functions D) DOM Events। **উত্তর: A**।

**Q3. Safe Plain Text DOM Update কোনটি?** A) `eval` B) `innerHTML` C) `textContent` D) `document.write`। **উত্তর: C**।

**Q4. Button Click শোনার জন্য কোন API?** A) `addEventListener` B) `fetch` C) `JSON.parse` D) `setInterval`। **উত্তর: A**।

**Q5. JavaScript Server-Side-এ চালাতে কোন Runtime ব্যবহৃত হতে পারে?** A) CSS B) Node.js C) HTML D) PNG। **উত্তর: B**।

## ১.১০ অধ্যায়ের সারসংক্ষেপ

আমরা JavaScript-এর উদ্দেশ্য, Browser Console, Variables, Functions, DOM এবং Event-Driven UI-এর প্রথম Practical Project শিখেছি। পরবর্তী অধ্যায়ে Data Types, Variable Scope এবং Memory Model গভীরভাবে আলোচনা করব।
