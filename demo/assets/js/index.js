// Setup form
var form = new XForm({
  url: 'http://localhost:3000/demo/assets/php/form.php',
}).init();

console.log('XForm:', form);
console.log('XForm Initial Data:', form.data);
console.log('XForm No. of Items:', form.length);

// Form button `[data-xform-submit]`
form.submit.addEventListener('click', () => {
  var check = form.check();
  console.log('XForm Check Data:', check.data);
  // Alert for missing inputs that have `[required]`
  if(!check.ready) {
    // alert('Required inputs missing');
    return;
  }
  // Fetch
  check.$fetch().then(res => {
    console.log('Fetch Response:', res.json);
    console.log('Fetch Response Data JSON:', JSON.parse(res.json.post.dataJSON));
    console.log('Fetch Response Error:', res.error);
  }).catch(error => {
    console.log('Fetch Error:', error);
  })
  // XHR
  check.$xhr(res => {
    console.log('XHR Response:', res.json);
    console.log('XHR Error:', res.error);
  });
}, false);