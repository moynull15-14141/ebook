const html = '<b>সতর্ক</b> এবং <i>দ্রুত</i>';

console.log(html.match(/<.+>/)[0]);
console.log(html.match(/<.+?>/)[0]);
console.log(html.match(/<[^>]+>/g).join(' '));
