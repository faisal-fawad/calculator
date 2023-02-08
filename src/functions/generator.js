import Parser from "./parser";
var error;

export default function Generator(string) {
  // Variables / Constants
  const exp = '\\(([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*)\\)';
  var re = new RegExp('\\\\(sum)_' + exp + '\\^' + exp, "g");

  // Handles errors involving the script
  error = null;
  window.onerror = function (msg) {
    msg = msg.split(":", 2);
    error = msg[msg.length - 1].trim();
    return true;
  }

  // Running parser and defining sorrounding variables
  var res = Parser(string);
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
  var main = ""; var header = "var answers = [];\nvar operations = [];\n"; 
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
      let name = outer[i]['string'].match(re);
      name = name[0].replaceAll('(', '{').replaceAll(')', '}');
      header = header.concat(`operations[${i}] = {name: "\\${name}", results: []};\nanswers[${i}] = 0;\n`)
    }
    stringScript = `${header}${main} \nvar res = ${string}`;
  }
  else {
    stringScript = `var res = ${string};`;
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
    return "error occured";
  }

  // Prevents upper limit from being extremly large or infinite
  if (outerObjects[i]["upper"].includes(varName) || outerObjects[i]["upper"] - varInitial > 10000) {
    return "error occured";
  }
  let upper = outerObjects[i]["upper"].split("=")

  // Creation of for loop as well as basis and recursive step
  if (recurse.length) {
    res = `${innerHeader}
    for (let ${varName} = ${varInitial}; ${varName} <= ${upper[upper.length - 1]}; ${varName}++)
    {
      ${converter(Objects, recurse, 0)}
    }`
  }
  else {
    res = `${innerHeader}
    for (let ${varName} = ${varInitial}; ${varName} <= ${upper[upper.length - 1]}; ${varName}++)
    {
      operations[${i}]["results"].push(${outerObjects[i]["exp"]});
      answers[${i}] += ${outerObjects[i]["exp"]};
    }`
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