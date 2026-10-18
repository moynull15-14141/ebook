'use strict';

const account = {
  owner: 'Sara',
  describe() {
    return `${this.owner}`;
  },
};

const describe = account.describe;
console.log(describe());
