const names = ['রফিক', 'অনিক', 'তানিয়া', 'ইমরান', 'খাদিজা'];

console.log(names.toSorted(new Intl.Collator('bn').compare));
