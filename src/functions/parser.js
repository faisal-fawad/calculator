/* Currently converts... fractions, powers, multiples, basic trigonometric functions */
export default function Parser(string) {
  // Variables / Constants
  const exp = '\\(([^)(]*(?:\\([^)(]*(?:\\([^)(]*(?:\\([^)(]*\\)[^)(]*)*\\)[^)(]*)*\\)[^)(]*)*)\\)'
  const symbols = string.match(/\\(sum)/g);
  var re;
  var i; 
  var Objects = []

  if (!string) {
    return -1;
  }

  // Converts latex to code; used for calculations
  const Formatter = {
    "frac": ['\\\\(?:frac)' + exp + exp, '(($1) / ($2))'],
    "cdot": ['\\\\(?:cdot)', '*'],
    "log": ['\\\\(?:log)_' + exp + exp, '(Math.log($2) / Math.log($1))'],
    "ln": ['\\\\(?:ln)' + exp, '(Math.log($1) / Math.log(Math.exp(1)))'],
    "pi": ['\\\\(?:pi)', 'Math.PI']
  }
  const checks = Object.keys(Formatter);
  const alternate = ["sin", "cos", "tan"]

  // Cleaning up latex string before conversion
  string = string.replaceAll("\\left", "").replaceAll("\\right", "").replaceAll("{", "(").replaceAll("}", ")"); // Removing specific bracket format
  string = string.replaceAll(/([_^])([A-Za-z0-9])/g, "$1($2)").replaceAll(/([0-9]+)([_^])/g, "($1)$2").replaceAll(/([A-Za-z0-9]+)([\^])/g, "($1)$2"); // Adding parentheses
  string = string.replaceAll(/([0-9])(?!\\cdot)(\\?[A-Za-z])/g, "$1 \\cdot $2"); // Converting implictly defined multiplication to explicit (eg. 5i -> 5 \cdot i)
  string = string.replaceAll(/\\\s+/g, ""); // Removing backslashes occuring from spaces

  // Adding base to log function (if not provided)
  re = new RegExp('\\\\(?:log)' + exp, "g");
  string = string.replaceAll(re, "\\log_(10)($1)")

  // Converting latex to code (only works for mathematical functions leading with backslash)
  const converter = [...string.matchAll(/\\(?!sum)([A-Za-z]*)/g)]
  for (i = 0; i < converter.length; i++) {
    if (checks.includes(converter[i][1])) {
      // Advanced conversion using formatting options specified in the Formatter object
      re = new RegExp(Formatter[converter[i][1]][0], "g");
      string = string.replaceAll(re, Formatter[converter[i][1]][1]);
    }
    else if (alternate.includes(converter[i][1])) {
      // Simply replacing the latex with the built-in JS Math function
      string = string.replaceAll('\\' + converter[i][1], 'Math.' + converter[i][1]);
    }
  }

  // Other conversions (mathemtical functions with no backslash)
  re = new RegExp( exp + '\\^' + exp + '(?!' + exp + ')', "g");
  string = string.replaceAll(re, 'Math.pow($1, $2)');

  // Getting all the sums and creating objects for them; as well as defining related variables
  re = new RegExp('\\\\(sum)_' + exp + '\\^' + exp + exp, "g");
  var nested;
  var outermost;
  var outerCount = 0;
  var matches = [...string.matchAll(re)];
  var originalMatches = matches.map(element => element[0]);

  for (i = 0; i < matches.length; i++) {
    if (matches[i][4]) {
      // Checks for nested summations
      nested = [...matches[i][4].matchAll(re)]
      if (nested.length) {
        for (var j = 0; j < nested.length; j++) {
          matches.push(nested[j]);
        }
        nested = true
      }
      else {
        nested = false
      }

      // Checks if a summation is the outermost summation in a chain of sums 
      if (originalMatches.includes(matches[i][0])) {
        outermost = true
        string = string.replace(matches[i][0], `answers[${outerCount}]`);
        outerCount++;
      }
      else {
        outermost = false
      }

      Objects.push({"string": matches[i][0], "lower": matches[i][2], "upper": matches[i][3], "exp": matches[i][4], "hasNested": nested, "isOuter": outermost});
    }
  }

  // Checks to make sure all parentheses contain an expression (they're not empty)
  re = new RegExp(exp, "g");
  const checker = [...string.matchAll(re)]
  if (!checker.every(element => element[1] !== "")) {
    return "Error parsing expression";
  }

  // If the number of \sum does not match with the number of objects created, a parsing error must have occured
  if (symbols && Objects.length !== symbols.length) {
    return "Summations formatted incorrectly";
  }

  return [string, Objects];
}