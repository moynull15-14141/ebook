interface Traveler {
  name: string;
  passport?: string;
}

const travelers: Traveler[] = [{ name: 'Rafi', passport: 'BX1234567' }];
const found = travelers.find((t) => t.name === 'Mina');
console.log(found.name.toUpperCase());
console.log(travelers[0].passport.slice(0, 2));
