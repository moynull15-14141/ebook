const state = {
  user: { profile: { city: 'Bogura', zip: '5800' }, name: 'Sara' },
};

const next = {
  ...state,
  user: { ...state.user, profile: { ...state.user.profile, city: 'Dhaka' } },
};

const { city, zip } = next.user.profile;
console.log(state.user.profile.city, city, zip);
