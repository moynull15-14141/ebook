const buffer = new ArrayBuffer(8 * 1024 * 1024);

const copy = structuredClone(buffer);
console.log(`Clone-এর পরে: মূল ${buffer.byteLength}, Copy ${copy.byteLength}`);

const moved = structuredClone(buffer, { transfer: [buffer] });
console.log(`Transfer-এর পরে: মূল ${buffer.byteLength}, নতুন ${moved.byteLength}`);
