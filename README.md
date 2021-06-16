# XForm
A simple, lightweight, and automated way to manage forms with vanilla javascript, fetch and/or XHR.

## Setup
Setting up XForm is really easy. XForm will look for `<form data-xform></form>` and will get all inputs, checkbox, radio, select, etc. You can either change it to select items with `data-xform-item` or you can ignore items with `data-xform-ignore`. You can also change selectors for form, item and ignore through the config object.

You can pass the form selector as the first argument and the config object as the second, or you can just the selector or even just the config object for that matter. It will detect if the first argument is a string or an object.

### Example
A simple example can be done with a very few and simple clean code.
#### HTML
```html
<form data-xform>
  <input id="text" name="text" placeholder="Sample text..." type="text">
</form>
```

#### JS 
```javascript
// Setup form
var form = new XForm({
  url: "http://example.com/form.php",
  method: "post" // Default
}).init();

// Event listener
form.submit.addEventListener('click', () => {
  // Check items from form and making data objects
  var check = form.check();
  // Send it with fetch
  check.$fetch()
    // Getting response
    .then(res => {
      console.log('Fetch Response:', res.json);
    })
    // If we have an error, catch it
    .catch(error => {
      console.log('Error:', error);
    })
}, false);
```

#### PHP

A simple small code to see if we got the data and send it back with an status message or code.
```php
// Default status is error
$status = !empty($_POST) ? "success" : "error";
// Response
$res->post = $_POST;
$res->files = $_FILES;
$res->status = $status;
// Echo
echo json_encode($res);
```

##### PHP Response
In this case a very usefull response looks like this:
```javascript
{
  post: {...},
  files: {files: {...}},
  status: "success"
}
```

## Functions

### $fetch()
`$fetch()` is a simple wrapper arround the javascript fetch api. You can only pass the config object to fetch as the url is taken from `XForm.config.url` so there is no need to pass it again.

This is how the fetch api is implemented in the source code:
```javascript
fetch(this.config.url, {
  method: this.config.method,
  body: this.formData
})
```

#### $fetch() Example
`$fetch()` will return the `fetch()` response with an aditional `res.json` and `res.error` in the object for easy of use.

```javascript
// Setup form
var form = new XForm().init();
// Event listener
form.submit.addEventListener('click', () => {
  var check = form.check();
  // Fetch
  check.$fetch().then(res => {
    console.log('Fetch Response:', res.json);
  }).catch(error => {
    console.log('Fetch Error:', error);
  })
}, false);
```

### $xhr()
`$xhr()` will return the `XMLHttpRequest` with an aditional `res.json` and `res.error` in the object for easy of use.
#### $xhr() Example
```javascript
// Setup form
var form = new XForm().init();
// Event listener
form.submit.addEventListener('click', () => {
  var check = form.check();
  // XHR
  check.$xhr(res => {
    console.log('XHR Response:', res.json);
  });
}, false);
```