const heading = document.createElement('h1');
heading.textContent = 'পুরোনো শিরোনাম';
document.body.append(heading);

document.querySelector('h1').textContent = 'নতুন শিরোনাম';
console.log(document.querySelector('h1').textContent);
