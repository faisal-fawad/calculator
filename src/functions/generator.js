import Parser from "./parser";
var error;

export default function Generator(string) {
  // Handles errors involving the script
  error = null;
  window.onerror = function (msg) {
    msg = msg.split(":", 2);
    error = msg[msg.length - 1].trim();
    return true;
  }

  // Running parser and defining sorrounding variables
  var res = Parser(string);
  if (res === -1) {
    return -1;
  }
  
  var Objects; var stringScript;
  var displays = [{name: "Result"}];

  // Checks if the parser was successful
  if (typeof(res) === "string") {
    displays[0]["data"] = res;
    return displays;
  }
  else {
    string = res[0];
    Objects = res[1];
  }

  // Checks if the following calculation contains summations
  var main = ""; var header = "var answers = [], operations = [];\n"; 
  var converterOutput;
  if (Objects.length) {
    var outer = Objects.filter(element => element["isOuter"] === true);

    for (var i = 0; i < outer.length; i++) {
      converterOutput = converter(Objects, outer, i);
      if (converterOutput.includes("error occured")) {
        displays[0]["data"] = "Summations formatted incorrectly";
        return displays;
      }
      main = main.concat(converterOutput);
      header = header.concat(`operations[${i}] = [], answers[${i}] = 0;\n`)
    }
    stringScript = `${header}${main} \n` +
    `var res = ${string}; \n` +
    `res = Math.round(res*100)/100;`;
  }
  else {
    stringScript = `var res = ${string}; \n` +
    `res = Math.round(res*100)/100;`;
  }

  reload(stringScript);
  // A check for whether the code errored or not
  if (typeof(error) === "string") {
    if (error.includes("is not defined")) {
      displays[0]["data"] = "The variable " + error;
    }
    else {
      displays[0]["data"] = "Error parsing expression";
    }

    return displays;
  }
  main = "";
  displays[0]["data"] = window.res;

  displays.push(
    {name: "", data: ""},
    {name: "Script", data: stringScript}
  )

  return displays
}

// Recursive function for converting a n-layered latex string to n number of for loops
function converter(Objects, outerObjects, i) {
  var varName; var varInitial;
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
    return "error occured";
  }

  // Prevents upper limit from being extremly large or infinite
  if (outerObjects[i]["upper"].includes(varName) || outerObjects[i]["upper"] - varInitial > 10000) {
    return "error occured";
  }
  let upper = outerObjects[i]["upper"].split("=")

  // Creation of for loop as well as basis and recursive step
  if (recurse.length) {
    res = `for (let ${varName} = ${varInitial}; ${varName} <= ${upper[upper.length - 1]}; ${varName}++) { \n` +
      `${converter(Objects, recurse, 0)}` +
    `} \n`
  }
  else {
    res = `for (let ${varName} = ${varInitial}; ${varName} <= ${upper[upper.length - 1]}; ${varName}++) { \n` +
      `operations[${i}].push(${outerObjects[i]["exp"]}); \n` +
      `answers[${i}] += ${outerObjects[i]["exp"]}; \n` +
    `} \n`
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