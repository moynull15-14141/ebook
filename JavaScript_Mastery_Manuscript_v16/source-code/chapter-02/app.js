"use strict";
const form = document.querySelector("#result-form");
const output = document.querySelector("#output");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const name = document.querySelector("#student-name").value;
    const ids = ["bangla", "english", "math"];
    const marks = ids.map((id) => {
      const raw = document.getElementById(id).value.trim();
      if (raw === "") throw new RangeError("সব বিষয়ের নম্বর দিতে হবে।");
      return Number(raw);
    });
    const result = calculateResult(name, marks);
    output.className = "success";
    output.textContent = `নাম: ${result.name}\nমোট: ${result.total}/300\nগড়: ${result.average.toFixed(2)}\nফল: ${result.passed ? "পাস" : "ফেল"}\nগ্রেড: ${result.grade}`;
  } catch (error) {
    output.className = "error";
    output.textContent = error.message;
  }
});
