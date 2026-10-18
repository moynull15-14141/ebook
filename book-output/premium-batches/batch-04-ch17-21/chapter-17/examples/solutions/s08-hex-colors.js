const css = 'color: #1d4f9c; background: #FFF; border: 1px solid #12305f80;';

console.log(css.match(/(?<=#)(?:[0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])/gi));
