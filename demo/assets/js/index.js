// Setup form
var form = new XForm('form', {
  url: 'http://localhost:3000/demo/assets/php/form.php',
}).init();

console.log(form);

// Form button `[data-xform-submit]`
form.submit.addEventListener('click', () => {
  var check = form.check();
  // Alert for missing inputs that have `[required]`
  if(!check.ready) {
    // alert('Required inputs missing');
    return;
  }
  // Fetch
  check.$fetch().then(res => {
    console.log('Fetch Response:', res.json);
    console.log('Fetch Error:', res.error);
  }).catch(error => {
    console.log('Error:', error);
  })
  // XHR
  check.$xhr(res => {
    console.log('XHR Response:', res.json);
    console.log('XHR Error:', res.error);
  });
}, false);