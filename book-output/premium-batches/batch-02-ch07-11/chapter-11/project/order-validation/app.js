'use strict';

// ?offline=1 দিলে Network বিচ্ছিন্নতার অভিনয়; ?delay= কৃত্রিম Server-এর দেরি।
const params = new URLSearchParams(location.search);
const send = params.has('offline')
  ? async () => { throw new TypeError('Failed to fetch'); }
  : createDemoServer(STOCK, Number(params.get('delay') ?? 300));

const FIELDS = ['customer', 'email', 'productId', 'quantity'];
const form = document.querySelector('#order-form');
const submitButton = form.querySelector('button[type="submit"]');
const statusView = document.querySelector('#status');
const historyList = document.querySelector('#history');

function showFieldErrors(fields = {}) {
  for (const name of FIELDS) {
    const message = fields[name] ?? '';
    document.querySelector(`#${name}-error`).textContent = message;
    form.elements[name].setAttribute('aria-invalid', String(message !== ''));
  }

  const firstInvalid = FIELDS.find((name) => fields[name]);
  if (firstInvalid) {
    form.elements[firstInvalid].focus();
  }
}

function addToHistory(order, receipt) {
  const item = document.createElement('li');
  item.textContent =
    `${receipt}: ${order.customer}, ${order.productName} ${order.quantity}টি, ` +
    formatTaka(order.total);
  historyList.prepend(item);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  statusView.textContent = 'পাঠানো হচ্ছে...';

  try {
    const result = await placeOrder(Object.fromEntries(new FormData(form)), send);

    if (result.ok) {
      showFieldErrors();
      addToHistory(result.order, result.receipt);
      statusView.textContent =
        `Order গৃহীত: ${result.receipt}, মোট ${formatTaka(result.order.total)}।`;
      form.reset();
      return;
    }

    showFieldErrors(result.fields);
    statusView.textContent = result.message;
    if (result.cause) {
      console.warn('Order পাঠানো যায়নি:', result.cause);
    }
  } catch (error) {
    // অপ্রত্যাশিত: Program-এর ভুল। ব্যবহারকারী পান নিরাপদ বার্তা,
    // ডেভেলপার পান পুরো বিবরণ।
    statusView.textContent =
      'অপ্রত্যাশিত সমস্যা হয়েছে। Page Reload করে আবার চেষ্টা করুন।';
    console.error('OrderGuard-এ অপ্রত্যাশিত ত্রুটি:', error);
  } finally {
    submitButton.disabled = false;
  }
});
