function createNotifier(channel) {
  const notifiers = {
    sms: { send: (to, text) => `SMS ${to}: ${text.slice(0, 40)}` },
    email: { send: (to, text) => `Email ${to}: ${text}` },
    console: { send: (to, text) => `LOG ${to}: ${text}` },
  };
  if (!Object.hasOwn(notifiers, channel)) {
    throw new Error(`অজানা Channel: ${channel}`);
  }
  return notifiers[channel];
}

for (const channel of ['sms', 'email']) {
  const notifier = createNotifier(channel);
  console.log(notifier.send('rafi', 'আপনার Visa আবেদন জমা হয়েছে'));
}
try {
  createNotifier('fax');
} catch (error) {
  console.log(error.message);
}
