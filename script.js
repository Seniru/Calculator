let input;
let exp;
let openedBraces = 0;
let inversed = false;
let expCont = '';
let temp = '';

// unpacking Math object
const {PI, sqrt, cbrt, sin, cos, tan, asin, acos, atan, log10, abs} = Math;

// dictionary for holding special symbols
const sym = {
  π: 'PI',
  '√': 'sqrt',
  '∛': 'cbrt',
  MOD: '%',
  '\\^': '**'
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
    <select onchange='changeTemp()'>
      <option>`,
  '\\]': `</option>
    <option>+</option>
    <option>-</option>
    <option>*</option>
    <option>/</option>
    <option>^</option>
    </select>
  `,
  '\\{': `<select onchange='changeTemp()'><option>`,
  '\\}': `</option>
  <option>sin</option>
  <option>cos</option>
  <option>tan</option>
  <option>asin</option>
  <option>acos</option>
  <option>atan</option>
  <option>fact</option>
  <option>log10</option>
  <option>abs</option>
  <option>√</option>
  <option>∛</option>
  </select>
  `,
  '⟨': '<span>(</span>',
  '⟩': '<span>)</span>',
  'π': PI

};

window.onload = () => {
  input = document.querySelector('#input-panel');
  exp = document.querySelector('#expressions');

  document.querySelectorAll('.btn').forEach(x => {
    // Handler for button clicks
    x.onclick = () => {
      // check if the button is a valued one and append it to the input panel
      if (x.name === 'value') {
        // check that the button is not an operator
        if (x.className.indexOf('oprtr') === -1) {
          input.value += x.value;
        } else {
          // if the button is an operator and the last is not an operator, the operator and previous entries in input will append to exp panel while clearing all the entries in the input panel.
          if (!lastIsOperator() && (temp !== '' || input.value !== '')) {
            exp.innerText += input.value + '' + x.value;
            temp += input.value + '' + x.value;
            input.value = '';
          }
        }
      // Checks if a function is associated with the button (like equals, sqrt, etc.)
      } else if (x.name === 'func') {
        switch (x.value) {
          case '=':
            // input.value = getResult(input.value);
            if (input.value !== '') {
              input.value = getResult(temp + input.value);
              exp.innerText = '';
              temp = '';
            } else {
              input.value = getResult(temp.substring(0, temp.length - 1) + input.value);
              exp.innerText = '';
              temp = '';
            }
            break;
          case '.':
            if (!hasDecimal()) {
              input.value += '.';
            }
            break;
          case '←':
            input.value = input.value.substring(0, input.value.length - 1);
            break;
          case 'C':
            input.value = '';
            exp.innerText = '';
            temp = '';
            break;
          case 'CE':
            input.value = '';
            break;
          case '±':
            input.value = '-(' + input.value + ')';
            break;
          case '%':
            if (!(input.value === '' && temp === '')) {
              input.value = getResult(temp + input.value + '*100');
              exp.innerText = '';
              temp = '';
            }
            break;
          case '()':
            handleBraces();
        }
      }
    };
  });

  // listener for changes in #exp
  setInterval(() => {
    if (exp.innerHTML !== expCont) {
      oncontent();
      expCont = exp.innerHTML;
      console.log(temp);
    }
  }, 300);



  // advanced button handlers here...

  // handler for buttons with common mathematical functions
  document.querySelectorAll('.func').forEach(x => {
    x.onclick = () => {
      addFunction(x.value);
    };
  });

  document.getElementById('pi').onclick = () => {
    if (lastIsOperator() || input.value === '') {
      input.value = 'π';
    }
  };

  document.getElementById('inverse').onclick = () => {
    inversed = !inversed;
    document.querySelectorAll('.inversable').forEach(x => {
      // format the buttons for the inversed version
      if (inversed) {
        document.getElementById('inverse').style.backgroundColor = 'rgb(144, 223, 228)';
        x.style.backgroundColor = 'rgb(144, 223, 228)';
        x.innerHTML = inverseDict[x.value];
        x.value = inverseDict[x.value];
      // format the button for the normal version
      } else {
        document.getElementById('inverse').style.backgroundColor = 'white';
        x.style.backgroundColor = 'white';
        for (let [k, v] of Object.entries(inverseDict)) {
          if (x.value === v) {
            x.value = k;
            x.innerHTML = k;
          }
        }
      }
    });
  };
};

// Checks if the last value in the math input panel is an operator
function lastIsOperator () {
  return input.value === '' && (/(\.|\+|-|\/|\*|\^)/.test(temp.charAt(temp.length - 1)) || temp.endsWith('MOD '));
}

// Checks if the decimal has been used in the input panel
function hasDecimal () {
  let expressions = input.value.split(/(\+|-|\/|\*|\^|MOD)/g);
  return /\./g.test(expressions.pop());
}

// Adds mathematical functions to the expressions
function addFunction (func) {
  if (input.value !== '') {
    input.value = func + '(' + input.value + ')';
  }
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
  } else if (input.value === '' && (/(\+|-|\/|\*|\^)/.test(temp.charAt(temp.length - 1)) || temp.endsWith('MOD '))) {
    addBracket();
  } else if (openedBraces !== 0 && /\d/.test(input.value.charAt(input.value.length - 1))) {
    closeBracket();
  } else if (input.value.endsWith('(') || temp.endsWith('(')) {
    addBracket();
  } else if ((input.value.endsWith(')') || temp.endsWith(')')) && openedBraces !== 0) {
    closeBracket();
  }
  console.log(openedBraces);
}

// Method for appending brackets
function addBracket () {
  input.value += '(';
  openedBraces++;
}

// Method for closing brackets
function closeBracket () {
  input.value += ')';
  openedBraces--;
}

// Calculates the factorial in the most famous one - liner method.
const fact = n => n < 2 ? 1 : fact(n - 1) * n;

// Gets the result of the expression
function getResult (expression) {
  let f = expression;
  for (let [k, v] of Object.entries(sym)) {
    f = f.replace(new RegExp(k, 'gi'), v);
  }
  try {
    return eval(f);
  } catch (e) {
    console.error('Error: ' + e.message);
    return expression;
  }
}

// Handler for content changes
function oncontent () {
  exp.innerHTML = formatToHTML(formatExpression(temp));
}

// Formats expression to a symobl format
function formatExpression (ex) {
  /*
    format reference
      integers: <n>
      operators: []
      functions: {}
  */
  let chunks = ex.replace(/\(/g,"⟨").replace(/\)/g,"⟩").split('');
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
      formatted += formatDictClosing[lastElemType] + formatDict[getType(c)] +  c;
      lastElemType = getType(c);
    }
  }
  return formatted;
}

function formatToHTML (form) {
  for (let [k, v] of Object.entries(htmlCode)) {
    form = form.replace(new RegExp(k, 'g'), v);
    console.log(form);
  }
  return form;
}

// Returns the mathematical type of the passed element
function getType (elem) {
  if (/[\dπ.]/.test(elem)) {
    return 'number';
  } else if (/(\+|-|\/|\*|\^)/.test(elem)) {
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
    console.log(x.nodeName);
    if (x.nodeName === 'SPAN') {
      temp += x.innerText;
    } else {
      // add the value stored in the element if it is not a span (bracket)
      temp += x.value;
    }
  });
  console.log(temp);
  return temp;
}
