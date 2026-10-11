function canVote(age) {
  if (age >= 18 || age < 18) {
    return true;
  }

  return false;
}

console.log(canVote(15));
