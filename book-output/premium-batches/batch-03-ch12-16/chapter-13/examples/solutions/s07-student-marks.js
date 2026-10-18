class Student {
  #marks = 0;

  constructor(name, marks) {
    this.name = name;
    this.marks = marks;
  }

  get marks() {
    return this.#marks;
  }

  set marks(value) {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new RangeError(`নম্বর 0 থেকে 100-এর মধ্যে হতে হবে: ${value}`);
    }
    this.#marks = value;
  }
}

const student = new Student('Sara', 88);
console.log(student.marks);

try {
  student.marks = 120;
} catch (error) {
  console.log(error.message);
}
console.log(student.marks);
