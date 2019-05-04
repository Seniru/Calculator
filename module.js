//module.js

let openedBraces = 0;

// storing original trig functions
let originalSin = Math.sin;
let originalCos = Math.cos;
let originalTan = Math.tan;

// new trig functions which deals with degrees
let newSin = (theta, mode) => {
  return mode === 'd' ? originalSin(toDeg(theta)) : originalSin(theta);
};
let newCos = (theta, mode) => {
  return mode === 'd' ? originalCos(toDeg(theta)) : originalCos(theta);
};
let newTan = (theta, mode) => {
  return mode === 'd' ? originalTan(toDeg(theta)) : originalTan(theta);
};

// unpacking Math object
let {PI, E, sqrt, cbrt, sin, cos, tan, asin, acos, atan, log10, log, abs, random} = Math;

// modifying some of the trignometric functions in math object to deal with degreees
sin = (theta) => {
  return newSin(theta, mode);
};
cos = (theta) => {
  return newCos(theta, mode);
};
tan = (theta) => {
  return newTan(theta, mode);
};

// dictionary for holding special symbols
const sym = {
  π: 'PI',
  '√': 'sqrt',
  '∛': 'cbrt',
  MOD: '%',
  '\\^': '**',
  '÷': '/',
  '×': '*',
  log: 'log10',
  ln: 'log'

};

// dictionary for corresponding inversed function for each functions
const inverseDict = {
  sin: 'asin',
  cos: 'acos',
  tan: 'atan',
  deg: 'deg'
};

// dictionary to store the formatting options (opened)
const formatDict = {
  number: '<',
  operator: '[',
  function: '{',
  none: ''
};

// dictionary to store the formatting options (closed)
const formatDictClosing = {
  number: '>',
  operator: ']',
  function: '}',
  none: ''
};

// dictionary containing corresponding HTML codes of formatted codes
const htmlCode = {
  '<': "<input onchange='changeTemp()' type='number' value='",
  '>': "'>",
  '\\[': `
      <select class='oprtr-model' onchange='changeTemp()'>
        <option>`,
  '\\]': `</option>
      <option>+</option>
      <option>-</option>
      <option>×</option>
      <option>÷</option>
      <option>^</option>
      </select>
    `,
  '\\{': `<select class='func-model' onchange='changeTemp()'><option>`,
  '\\}': `</option>
    <option>sin</option>
    <option>cos</option>
    <option>tan</option>
    <option>asin</option>
    <option>acos</option>
    <option>atan</option>
    <option>fact</option>
    <option>log</option>
    <option>abs</option>
    <option>√</option>
    <option>∛</option>
    </select>
    `,
  '⟨': '<span>(</span>',
  '⟩': '<span>)</span>',
  'π': PI,
  E: E

};

// Converts radians into degrees and return it.
function toDeg (rad) {
  return rad * PI / 180;
}

// Checks if the last value in the math input panel is an operator
function lastIsOperator () {
  return input.value === '' && (/(\+|-|\/|\*|\^|÷|×)/.test(temp.charAt(temp.length - 1)) || temp.endsWith('MOD '));
}
// Checks  if the last symbol, π or E
function lastIsNumber ( ) {
    return /[\dπE\.]/.test(input.value.charAt(input.value.length-1));
}

// Checks if the decimal has been used in the input panel
function hasDecimal () {
  let expressions = input.value.split(/(\+|-|\/|\*|\^|MOD)/g);
  return /\./g.test(expressions.pop());
}
// Handles braces according to the entered values in input
function handleBraces () {
  /* Braces are allowed to open if,
   * there are no expressions in the input or exp panel yet
   * the last character in exp panel is an arithmetic symbol
   * the last character seen is not a number or a point
   */

  /* Bracese should close if,
   * last character is a number or an opening or closing bracket
   */
  if (temp === '' && input.value === '') {
    addBracket();
  } else if (input.value === '' && (/(\+|-|÷|×|\^)/.test(temp.charAt(temp.length - 1)) || temp.endsWith('MOD '))) {
    addBracket();
  } else if (openedBraces !== 0 && lastIsNumber()) {
    closeBracket();
  } else if (openedBraces === 0 && lastIsNumber()) {
    exp.innerText += input.value + '×';
    temp += input.value + '×';
    input.value = "";
    addBracket();

  } else if (input.value.endsWith('(') || temp.endsWith('(')) {
    addBracket();
  } else if ((input.value.endsWith(')') || temp.endsWith(')')) && openedBraces !== 0) {
    closeBracket();
  } else if ((input.value.endsWith(')') || temp.endsWith(')')) && openedBraces === 0) {
    exp.innerText += input.value + '×';
    temp += input.value + '×';
    exp.innerText += input.value + '×';
    input.value = "";
    addBracket();
  }
}

// Method for appending brackets
function addBracket () {
  input.value += '(';
  openedBraces++;
  speak('Open Brakcet');
}

// Method for closing brackets
function closeBracket () {
  input.value += ')';
  openedBraces--;
  speak('close bracket');
}

// Deletes the last number, symbol or function
function back () {
    let last = input.value.charAt(input.value.length - 1);
    if (/[\d\.πE]/i.test(last)) {
        input.value = input.value.substring(0, input.value.length - 1);
    } else if (last === ')') {
        // Removing a closed bracket results in extra unclosed brackets.
        openedBraces++;
        input.value = input.value.substring(0, input.value.length - 1);
    } else if (last === '(') {
        openedBraces--;
        input.value = input.value.substring(0, input.value.length - 1);
    } else if (/[a-zA-Z]/i.test(last)) {
        // removing all the characters related to a single function using a recursive method
        input.value = input.value.substring(0, input.value.length - 1);
        back();
    }
    
}


// Calculates the factorial in the most famous one - liner method.
const fact = n => n < 2 ? 1 : fact(n - 1) * n;
// Gets the result of the expression
function getResult (expression) {
  let ans;
  let f = expression;
  for (let [k, v] of Object.entries(sym)) {
    f = f.replace(new RegExp(k, 'gi'), v);
  }
  try {
    exp.innerHTML = '';
    ans = eval(f);
    return ans;
  } catch (e) {
    console.error('Error: ' + e.message);
    speak('OOPS! An error occured');
    return expression;
  } finally {
    if (typeof ans !== 'undefined') {
      // check if the no history message box exists and if yes remove it, otherwise silently ignore it.
      document.querySelector('#no_hist_msg') ? document.querySelector('#no_hist_msg').remove() : false;
      hist.innerHTML = '<var>' + expression + '</var><br /><b>' + ans + '</b><br /><hr />' + hist.innerHTML;
      memory.push(ans);
      speak('Equals ' + ans);

      console.log(memory);
    }
  }
}
// Formats expression to a symobl format
function formatExpression (ex) {
  /*
    format reference
      integers: <n>
      operators: []
      functions: {}
  */
  let chunks = ex.replace(/\(/g, '⟨').replace(/\)/g, '⟩').split('');
  let lastElemType = getType(chunks[0]);
  let formatted = formatDict[lastElemType];
  // let fragmentClosed = false;
  for (let c of chunks) {
    console.log(c + ':  ' + getType(c));
    if (getType(c) === lastElemType) {
      formatted += c;
      // fragmentClosed = false;
    } else {
      // TODO: search a way to format brackets -> Line 296 originally doesn't had that ternary operation
      formatted += formatDictClosing[lastElemType] + formatDict[getType(c)] + c;
      lastElemType = getType(c);
    }
  }
  return formatted;
}

function formatToHTML (form) {
  if (temp === '') {
    return '';
  }
  for (let [k, v] of Object.entries(htmlCode)) {
    form = form.replace(new RegExp(k, 'g'), v);
  }
  return form;
}

// Returns the mathematical type of the passed element
function getType (elem) {
  if (/[\dπ.]/.test(elem)) {
    return 'number';
  } else if (/(\+|-|\/|\*|\^|÷|×)/.test(elem)) {
    return 'operator';
  } else if (/[\w∛√]/.test(elem)) {
    return 'function';
  } else {
    return 'none';
  }
}

// Handles onchange eventes of elements in exp and change the temp accordingly
function changeTemp () {
  temp = '';
  Object.values(exp.children).forEach(x => {
    // checking if the element contains a bracket (generally span elements store brackets)
    if (x.nodeName === 'SPAN') {
      temp += x.innerText;
    } else {
      // add the value stored in the element if it is not a span (bracket)
      temp += x.value;
      resizable(x);
    }
  });
  return temp;
}

// function for speak if soundEnabled and other factors are passed
function speak (str) {
  responsiveVoice.cancel();
  if (soundEnabled) {
    responsiveVoice.speak(str);
  }
}

// Adds mathematical functions to the expressions
function addFunction (func) {
  if (input.value !== '') {
    input.value = func + '(' + input.value + ')';
  }
}

// function for retriving speech text and speak the text
function getSpeechText (elem) {
  if (elem.getAttribute('speak') !== null && elem.getAttribute('speak') !== '!custom') {
    speak(elem.getAttribute('speak'));
  }
}

/*
  *Changes the width of input fields according to the number of characters in it
  *Credits: Max Chuhryaev - Codepen (link: https://codepen.io/w3core/pen/DjLml)
*/
function resizable (el, factor) {
  var int = Number(factor) || 7.7;
  function resize () { el.style.width = ((el.value.length + 1) * int) + 'px'; }
  resize();
}

