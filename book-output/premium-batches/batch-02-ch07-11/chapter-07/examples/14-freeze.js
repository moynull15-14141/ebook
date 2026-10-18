const settings = Object.freeze({ theme: 'light', size: { font: 14 } });

settings.theme = 'dark';
console.log(settings.theme);

settings.size.font = 18;
console.log(settings.size.font);
