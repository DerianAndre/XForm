# XForm
A simple, lightweight and automated way to manage forms with XHR.

## Setup
Setting up XForm is really easy.
```javascript
// Setup form
var form = new XForm().init();
// Event listener
form.submit.addEventListener('click', () => {
  var check = form.check();
  check.send(res => {
    console.log(res);
  });
}, false);
```

## Demo
Check out the demo!