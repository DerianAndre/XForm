// Setup form
var form = new XForm({
  action: 'http://localhost:3000/demo/assets/php/form.php',
  items: {
    key: 'id'
  }
}).init();

console.log(form)
console.log('Action:', form.config.action)

// On button submit
form.submit.addEventListener('click', () => {
  var check = form.check();
  var ready = check.ready;
  console.log(check)
  console.log('Data:', check.data)
  console.log('Form Data:', ...check.formData)
  console.log('Ready:', ready)
  // Alert for missing inputs that have [required]
  if(!ready) {
    setTimeout(() => {
      alert('Required inputs missing');
    }, 100);
    return;
  }
  console.log('XForm send');
  // Do a callback function with send()
  check.send(res => {
    console.log('Response:', res);
  });
}, false);