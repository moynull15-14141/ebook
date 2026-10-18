function demo() {
  try {
    return 'ক';
  } finally {
    console.log('খ');
  }
}

console.log(demo());
