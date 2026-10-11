function dayType(day) {
  let type = 'কর্মদিবস';

  switch (day) {
    case 'fri':
    case 'sat':
      type = 'সাপ্তাহিক ছুটি';
      break;
    case 'sun':
      type = 'সপ্তাহের প্রথম কর্মদিবস';
      break;
    default:
      break;
  }

  return type;
}

console.log(dayType('fri'));
console.log(dayType('sat'));
console.log(dayType('mon'));
