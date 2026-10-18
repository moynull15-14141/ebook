type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number };

function assertNever(value: never): never {
  throw new Error(`অপ্রত্যাশিত: ${JSON.stringify(value)}`);
}

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    default:
      return assertNever(shape);
  }
}

const shapes: Shape[] = [
  { kind: 'circle', radius: 1 },
  { kind: 'rectangle', width: 2, height: 3 },
];
console.log(shapes.map((s) => area(s).toFixed(2)));
