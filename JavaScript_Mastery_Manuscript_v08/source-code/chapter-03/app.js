'use strict';

const form = document.querySelector('#checkout-form');
const result = document.querySelector('#result');
const money = value => `BDT ${value.toLocaleString('en-BD')}`;

form.addEventListener('submit', event => {
  event.preventDefault();
  result.replaceChildren();
  result.classList.remove('error');

  const priceText = document.querySelector('#price').value.trim();
  const quantityText = document.querySelector('#quantity').value.trim();
  const price = priceText === '' ? NaN : Number(priceText);
  const quantity = quantityText === '' ? NaN : Number(quantityText);

  try {
    const order = calculateOrder({
      price,
      quantity,
      coupon: document.querySelector('#coupon').value,
      isMember: document.querySelector('#member').checked
    });
    const rows = [
      ['Subtotal', order.subtotal],
      ['Coupon Discount', -order.couponDiscount],
      ['Member Discount', -order.memberDiscount],
      ['Delivery Fee', order.deliveryFee],
      ['Grand Total', order.grandTotal]
    ];
    const summary = document.createElement('dl');
    summary.className = 'summary';
    for (const [label, value] of rows) {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = money(value);
      if (label === 'Grand Total') {
        dt.className = 'grand';
        dd.className = 'grand';
      }
      summary.append(dt, dd);
    }
    result.append(summary);
  } catch (error) {
    result.classList.add('error');
    result.textContent = error.message;
  }
});
