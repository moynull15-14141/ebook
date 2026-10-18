const { hour, minute } = /^(?<hour>\d{2}):(?<minute>\d{2})$/.exec('14:35').groups;

console.log(Number(hour) * 60 + Number(minute));
