const prices = 'Pen ৳50, Book ৳450, Bag $30';
console.log(prices.match(/(?<=৳)\d+/g).join(', '));

const withCommas = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
console.log(withCommas(1234567), withCommas(950));

const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const samples = ['Dhaka2026', 'dhaka2026', 'Dk2026'];
console.log(samples.map((sample) => strong.test(sample)).join(' '));
