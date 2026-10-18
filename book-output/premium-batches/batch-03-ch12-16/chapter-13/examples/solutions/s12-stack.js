class Stack {
  #items = [];

  push(item) {
    this.#items.push(item);
    return this;
  }

  pop() {
    if (this.#items.length === 0) {
      throw new RangeError('Stack ফাঁকা');
    }
    return this.#items.pop();
  }

  peek() {
    return this.#items.at(-1);
  }

  get size() {
    return this.#items.length;
  }
}

const stack = new Stack().push('ক').push('খ').push('গ');
console.log(stack.pop(), stack.peek(), stack.size);
stack.pop();
stack.pop();

try {
  stack.pop();
} catch (error) {
  console.log(error.message);
}
