// Setup form
var form = new XForm({
  url: 'http://localhost:3000/demo/assets/php/form.php',
}).init();

console.log(form);
console.log(form.data);
console.log(form.length);

// Form button `[data-xform-submit]`
form.submit.addEventListener('click', () => {
  var check = form.check();
  // Alert for missing inputs that have `[required]`
  if(!check.ready) {
    // alert('Required inputs missing');
    return;
  }
  console.log(check.data);
  check.data.password = encrypt(check.data.password, 'asdfasdf');
  console.log(check.data.password)
  // Fetch
  check.$fetch().then(res => {
    console.log('Fetch Response:', res.json);
    console.log('Fetch Response Data JSON:', JSON.parse(res.json.post.dataJSON));
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

function encrypt(password, text) {
 
  // move text to base64 so we avoid special chars
  const base64 = btoa( text );

  // text string to array
  const arr = base64.split('');
  // array of password
  const arrPass = password.split('');
  let lastPassLetter = 0;

  // encrypted string
  let encrypted = '';

  // encrypt
  for (let i=0; i < arr.length; i++) {
 
    const letter = arr[ i ];
 
    const passwordLetter = arrPass[ lastPassLetter ];
 
    const temp = getLetterFromAlphabetForLetter( 
      passwordLetter, letter );
 
    if (temp) {
      // concat to the final response encrypted string
      encrypted += temp;
    } else {
      // if any error, return null
      return null;
    }  
 
    /*
      This is important: if we're out of letters in our 
      password, we need to start from the begining.
    */
    if (lastPassLetter == (arrPass.length - 1) ) {
      lastPassLetter = 0;
    } else {
      lastPassLetter ++;
    }  
}

// We finally return the encrypted string
return encrypted;
}

function getLetterFromAlphabetForLetter(letter, letterToChange) {
  // this is the alphabet we know, plus numbers and the = sign 
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789=ABCDEFGHIJKLMNOPQRSTUVWXYZ';
   
  // get the position of the given letter, according to our abc
  const posLetter = abc.indexOf( letter );
  
  // if we cannot get it, then we can't continue
  if (posLetter == -1) {
   console.log('Password letter ' + letter + ' not allowed.');
   return null;
  }
  // according to our abc, get the position of the letter to encrypt
  const posLetterToChange = abc.indexOf( letterToChange );
  
  // again, if any error, we cannot continue...
  if (posLetterToChange == -1) {
   console.log('Password letter ' + letter + ' not allowed.');
   return null;
  }
  
  // let's build the new abc. this is the important part
  const part1 = abc.substring(posLetter, abc.length);
  const part2 = abc.substring(0, posLetter);
  const newABC = '' + part1 + '' + part2;
  
  // we get the encrypted letter
  const letterAccordingToAbc = newABC.split('')[ posLetterToChange ];
  
  // and return to the routine...
  return letterAccordingToAbc; 
 }