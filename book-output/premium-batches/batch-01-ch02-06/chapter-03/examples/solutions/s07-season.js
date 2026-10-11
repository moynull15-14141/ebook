function seasonOf(month) {
  switch (month) {
    case 12:
    case 1:
    case 2:
      return 'শীত';
    case 3:
    case 4:
    case 5:
      return 'গ্রীষ্ম';
    case 6:
    case 7:
    case 8:
    case 9:
      return 'বর্ষা';
    case 10:
    case 11:
      return 'হেমন্ত';
    default:
      return 'অজানা';
  }
}

console.log(seasonOf(1));
console.log(seasonOf(7));
console.log(seasonOf(13));
