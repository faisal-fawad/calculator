import Parser from "./parser";

// Recursive function for converting a n-layered latex string to n number of for loops
function converter(Objects, outerObjects, i, j) {
  var varName; var varInitial; var innerHeader = ""; 
  var recurse;
  var res;

  // Checks for a nested summation
  if (outerObjects[i]["hasNested"]) {
    recurse = Objects.filter(element => element["string"] === outerObjects[i]["exp"]);
  }
  else {
    recurse = [];
  }

  // Converts lower limit to code
  if (outerObjects[i]["lower"].includes("=")) {
    varName = outerObjects[i]["lower"].split("=")[0];
    varInitial = outerObjects[i]["lower"].split("=")[1];
  }
  else {
    varName = `iterator${j}`;
    varInitial = outerObjects[i]["lower"];
  }

  // Converts upper limit to static constant (prevents infinite loop)
  innerHeader = innerHeader.concat(`var ${varName} = ${varInitial}; var iterator${j}upper = ${outerObjects[i]["upper"]};`)

  // Creation of for loop as well as basis and recursive step
  if (recurse.length) {
    res = `${innerHeader} \nfor (${varName} = ${varInitial}; ${varName} <= iterator${j}upper; ${varName}++) { ${converter(Objects, recurse, 0, j + 1)} }`
  }
  else {
    res = `${innerHeader} \nfor (${varName} = ${varInitial}; ${varName} <= iterator${j}upper; ${varName}++) { ans${i} += ${outerObjects[i]["exp"]} }`
  }
  return res;
}

// Function for reloading script
function reload(provided) {
  // Delete old script
  document.getElementById('calculator').remove();

  // Set up new script
  var head = document.getElementsByTagName('head')[0];
  var script = document.createElement('script');
  script.id = 'calculator';
  head.appendChild(script);
  script.innerHTML = provided;
}

var error;

export default function Generator(string) {
  // Handles errors involving the script
  error = null;
  window.onerror = function (msg) {
    msg = msg.split(":", 2);
    error = msg[msg.length - 1].trim();
    return true;
  }

  // Running parser
  var res = Parser(string);
  var header = ""; var main = "";
  var display; var Objects; var stringScript;

  if (typeof(res) === "string") {
    display = res;
    console.log(display);
    return display;
  }
  else {
    string = res[0];
    Objects = res[1];
  }

  // Checks if the following calculation contains summations
  if (Objects.length) {
    var j = 0;
    var outer = Objects.filter(element => element["isOuter"] === true);

    for (var i = 0; i < outer.length; i++) {
      header = header.concat(`var ans${i} = 0;\n`)
      main = main.concat(converter(Objects, outer, i, j));
    }
    stringScript = `${header}${main}\nvar res = ${string};`;
  }
  else {
    stringScript = `var res = ${string};`;
  }

  console.log(stringScript);
  reload(stringScript);

  // Checks and formatting of errors
  if (typeof(error) === "string") {
    if (error.includes("is not defined")) {
      error = "The variable " + error;
    }
    else if (error.includes("unexpected token")) {
      error = "Multiplication must be defined explicitly (eg. 5*x, (5)(x))"
    }
    display = error
  }
  else {
    display = window.res;
  }
  header = ""; main = "";

  // Check for whether the result of display is valid
  if (typeof(display) !== "string" && typeof(display) !== "number") {
    display = "Error parsing expression";
  }

  return display
}