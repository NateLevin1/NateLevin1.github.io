/*fetch('./out/out.wasm').then(response =>
  response.arrayBuffer()
).then(bytes => WebAssembly.instantiate(bytes)).then(results => {
  instance = results.instance;
  console.log(instance.exports.main(6));
}).catch(console.error); // run code */

/* eslint-disable no-debugger, no-console, no-undef */

var log = document.querySelector('#output');
var outputLog = document.querySelector('#run-output');

['log', 'warn', 'error'].forEach(function (verb) {
    console[verb] = (function (method, verb, log) {
        return function (text) {
            method(text);
            // handle distinguishing between methods any way you'd like
            let msg = document.createElement('code');
            let lb = document.createElement('br'); // line break
            msg.classList.add(verb);
            msg.textContent = "\n"+text;
            log.insertBefore(lb, log.firstChild);
            log.insertBefore(lb, log.firstChild);
            log.insertBefore(msg, log.firstChild);
            /*log.appendChild(msg);
            log.appendChild(lb);*/
        };
    })(console[verb].bind(console), verb, log);
});

var runner = {
    log: function (text) {
        let msg = document.createElement('code');
        let lb = document.createElement('br'); // line break
        msg.classList.add('log');
        msg.textContent = "\n"+text;
        outputLog.insertBefore(lb, outputLog.firstChild);
        outputLog.insertBefore(lb, outputLog.firstChild);
        outputLog.insertBefore(msg, outputLog.firstChild);
    },
    error: function (text) {
        let msg = document.createElement('code');
        let lb = document.createElement('br'); // line break
        msg.classList.add('error');
        msg.textContent = "\n"+text;
        outputLog.insertBefore(lb, outputLog.firstChild);
        outputLog.insertBefore(lb, outputLog.firstChild);
        outputLog.insertBefore(msg, outputLog.firstChild);
    }
};

// ES6:
const getDifference = (diffMe, diffBy) => diffMe.split(diffBy).join('')

//compile(); // compiles default text

// eslint-disable-next-line no-unused-vars
function compile() { // Compiles to .wat file 

// Reset all values
var editor = document.getElementById("editor");
var contents = editor.innerText;
var lines = contents.split("\n");
var command = ""; // command to execute
var commandOffset = 0; // allows commands to be executed anywhere in the spacing
var currentVariable = ""; // allows equalities to know what variable to operate on
mathType = "None"; // because it is a global var needed in a function
    
var scope = ""; // number or decimal
var controlScope = []; // if statements etc
//var functionScope = ""; // function incomplete

variables = []; // list of variables for highlighting and checking if something is a variable for errors
var options = []; // user-specified options- compiler use only
var outputType = "i32";
var headerOutput = ['(func (export "main") '];
var localHeaderOutput = [];
var stackOutput = ""; // main output everything writes to
var delayedStackOutput = [];
var whileDelayedStackOutput = [];
var exportOutput = "";
if(cln) {
  cln = 0;
}
if(cwn) {
  cwn = 0;
}


for(var cln = 0; cln <= lines.length-1; cln++) { // checks and compiles each line
  // cln = currentLineNumber
  let currentLineText = lines[cln];
  let words = currentLineText.split(" ");
  for(var cwn = 0; cwn <= words.length-1; cwn++) { // checks and compiles each word
    let currentWord = words[cwn];
    // CONTROL FLOW
    /**
     * if (condition) { }
     * Runs what is inside of the curly brackets if the condition is true. Condition can be expressed with >, >= etc or a boolean variable.
     */
    if(currentWord == "if" && command !="comment") {
      /*if(controlScope == "if") {
        console.error("Unrecoverable Compiler Error: If statements cannot be declared inside of if statements. Line "+cln+" word "+cwn+".");
      }*/
      command = "if";
      scope = "";
      //controlScope.push("if");
      commandOffset = cwn;
    }
    /**
     * else { }
     * Runs what is inside of the curly brackets if the condition in an above if is false. Must have an if condition above
     */
    else if(currentWord == "else" && command !="comment") {
      if(command != "possible-else") {
        console.error("Else statement must have if. Line "+cln+" word "+cwn+".");
      } else {
        command = "else-start";
        scope = "";
        //controlScope.push("else");
        commandOffset = cwn;
      }
    }
    else if(currentWord == "(" && command !="comment") {
      if(command == "if") {
        stackOutput += "(if\n";
        command = "if-condition";
        var ifConditionType = "none";
        var numOfIfConditionStackEnds = 0;
      } else if (command == "while") {
        stackOutput += "(block\n(loop\n"; // note that it opens two parentheses unlike if which only opens one
        command = "while-condition";
        var whileConditionType = "none";
        var numOfWhileConditionStackEnds = 0;
      } else if (command == "for") {
        stackOutput += ""; // nothing because it has to be added after initialization phase.
        command = "for-condition";
      }
      commandOffset = cwn;
    }
    else if(currentWord == "{" && command !="comment") {
      if(command.includes("start")) {
        if(command == "if-start") {
          stackOutput += " (then\n";
          command = "";
          controlScope.push("if");
        }
        if(command == "else-start") {
          stackOutput += " (else\n";
          command = "";
          controlScope.push("else");
        }
        if(command == "while-start") {
          command = ""; // rest is handled at end of )
        }
      } else {
        if(controlScope[controlScope.length-1] != "for-start") { // fixes issues with how for statements are handled. This looks like it should be just "for" but this is all that works
          console.error("No check done for statement on line "+cln+" word "+cwn+".")
        }
      }
      commandOffset = cwn;
    }
    else if(currentWord == "}" && command !="comment") {
      if(controlScope) {
          if(words[cwn+1] != "else") { 
            for(let x = controlScope.length-1; x>=0; x--) { // for everything in controlscope
                if(controlScope[x] == "if") {
                  stackOutput += " )\n)\n"; // ends the then and the if.
                  controlScope.pop();
                } else if (controlScope[x] == "else") {
                  stackOutput += " )\n)\n"; // ends the then and the if.
                  controlScope.pop();
                } else if (controlScope[x] == "while"||controlScope[x] == "for-start") { // same for for and while | NOTE: -start is included because that is when the actual code is written
                  if(controlScope[x] == "for-start") {
                    /*var forDiff = getDifference(stackOutput, forOldStackOutput);
                    stackOutput = forOldStackOutput;*/
                    stackOutput += forDiff;
                  }
                  stackOutput += "(br 0)\n)\n)\n"; // ends the block, loop and adds a branch at the end. 
                  controlScope.pop();
                } else {
                  stackOutput += "(; ERROR: Unknown controlScope value of "+controlScope[x]+" ;) )\n";
                  console.error("Unknown controlScope value of "+controlScope[x]+".");
                }
            }
            //stackOutput += " )\n)\n"; // ends the then and the if.
          } else {
            stackOutput += " )\n"; // ends the then and the if.
            controlScope.pop();
            command = "possible-else";
          }
      } else {
        console.error("Control end given with no start provided. Line "+cln+" word "+cwn+".")
      }
      commandOffset = cwn;
    }
    /**
     * LOOPS
     */
    /**
     * while ( condition ) { }
     * Runs the code inside of the curly brackets while the condition is true.
     */
    else if(currentWord == "while" && command !="comment") {
      command = "while";
      scope = "";
      controlScope.push("while");
      commandOffset = cwn;
    }
    /**
     * for ( initialization ; condition ; do last ; ) { }
     * Runs the code inside of the curly brackets while the condition is true.
     * Example:
     * for ( number b = 0 ; b to 10 ; b = add b 1 ; ) { }
     */
    else if(currentWord == "for" && command !="comment") {
      command = "for";
      scope = "";
      controlScope.push("for");
      var semiForNum = 0;
      commandOffset = cwn;
    }
    // VARIABLES
    /**
     * number x = num1
     * Creates a number variable.
     */
    else if(currentWord == "number" && command !="comment") {
      command = "i32";
      scope = "variable";
      commandOffset = cwn;
    }
    /**
     * decimal x = num1
     * Creates a decimal variable.
     * NOT IMPLEMENTED YET
     * come back to
     */
    else if(currentWord == "decimal" && command !="comment") {
      command = "f64";
      scope = "variable";
      commandOffset = cwn;
    }
    // MATH
    /**
     * add n1 n2
     * Adds two numbers. Can be constants or variables.
     */
    else if(currentWord == "add" && command !="comment") {
      command = "add";
      commandOffset = cwn;
    }
    /**
     * sub n1 n2
     * Subtracts the first number from the second. Can be constants or variables.
     */
    else if (currentWord == "sub" && command !="comment") {
      command = "sub";
      commandOffset = cwn;
    } 
    /**
     * mul n1 n2
     * Multiplies the two numbers. Can be constants or variables.
     */
    else if (currentWord == "mul" && command !="comment") {
      command = "mul";
      commandOffset = cwn;
    }
    /**
     * div n1 n2
     * divide the first number from the second. Can be constants or variables.
     */
    else if (currentWord == "div" && command !="comment") {
      command = "div_s";
      commandOffset = cwn;
    }
    /**
     * rem n1 n2
     * Finds the remainder between the first number from the second. Can be constants or variables.
     */
    else if (currentWord == "rem" && command !="comment") {
      command = "rem_s";
      commandOffset = cwn;
    }
    // OTHER
    /**
     * ouput num1
     * outputs the variable specified. Constants cam be used, though there is no point. Note: Due to how WebAssembly (the compiled language) works, only one export can be specified per function.
     */
    else if (currentWord == "output"  && command !="comment") {
      if(!controlScope.includes("if")&&!controlScope.includes("while")) {
        command = "output";
        scope = "output";
        commandOffset = cwn;
      } else {
        if(!options.includes("output-warning")) { // respect compiler options
          console.warn("An output specified in a conditional statement will not run inside of the conditional statement. Line "+cln+" word "+cwn+".");
        }
      }
      
    }
    /**
     * number x = input
     * Allows a variable to be input through javascript. If no input or too many inputs are specified during runtime, the code will fail, so use input only when you are certain
     * that an input will be used (you could check if it exists using an if statement if you are not sure if it will be used to get around this).
     * Note: inputs are managed in javascript in order, so suggested syntax is putting a comment which says what number input it is. Example:
     * number x = input // 0 /; ;
     */
    else if (currentWord == "input"  && command !="comment") {
      if(scope == "variable") {
        if(command == "variable-set") { // not a decimal
          command = "input";
          localHeaderOutput.splice(localHeaderOutput.indexOf("(local $"+currentVariable+" "+variables[variables.indexOf(currentVariable)+1]+") "), 1);
          headerOutput.push("(param $"+currentVariable+" "+variables[variables.indexOf(currentVariable)+1]+") ");
          commandOffset = cwn;
        }
        
      } else {
        console.error("Fatal Error: Input command used outside of variable");
      }
    }
    /**
     * toNumber var
     * Converts a decimal type variable to a number type. It is rounded before it is converted. Note: Math commands cannot be used inside of a toNumber statement.
     */
    else if (currentWord == "toNumber" && command !="comment") {
      command = "toNumber";
      commandOffset = cwn;
    }
    /**
     * toDecimal var
     * Converts a number type variable to a decimal type. Note: Math commands cannot be used inside of a toDecimal statement.
     */
    else if (currentWord == "toDecimal" && command !="comment") {
      command = "toDecimal";
      commandOffset = cwn;
    }
    /**
     * round n
     * Rounds a decimal variable or constant
     */
    else if (currentWord == "round" && command !="comment") {
      command = "round";
      commandOffset = cwn;
    }
    /**
     * options_opt1_opt2_opt3
     * Sets compiler options
     */
    else if (currentWord.includes("options")) {
      if(currentWord.includes("output-warning")) {
        options.push("output-warning");
      }
      if(currentWord.includes("lone-math-output")) {
        options.push("lone-math-output");
      }
      commandOffset = cwn;
    }
    /**
     * // && /; e.g. // comment /;
     * Allows for commenting. // is start, /; is end. All comments are "multiline" in a sense.
     */
    else if (currentWord == "//") {
      command = "comment";
      commandOffset = cwn;
    }
    else if (currentWord == "/;") {
      if(command == "comment") {
        command = "";
      } else {
        console.warn("Comment end provided but no comment was started. Line " + cln + ", word "+ cwn + ".")
      }
    }
    /**
     * ;
     * Ends a command. Use after all commands except commands where there are other ways to stop them (e.g. comment).
     */
    else if (currentWord == ";" && command !="comment") {// makes sure comments are not unintentionally ended
        command = "";
        commandOffset = 0;
        scope = "";
        currentVariable = "";
        
        if(controlScope[controlScope.length-1] == "for") {
          semiForNum += 1;
          if(semiForNum > 3) {
            console.error("Too many arguments for 'for' conditional. Line "+cln+" word "+cwn+".");
          }
        }
    }
    else if(currentWord == " " || currentWord == "\n" || currentWord == "") {
      // this is a thing that most browser do to the end of editable pre elements. This is the best way around it.
    }
    /**
     * Runs if the current word is not a starting word. Could be a constant or variable name
     */
    else { // not a starting word
      if(command == "") {
        if(variables.includes(currentWord)) {
          scope="variable";
          currentVariable = currentWord;
          command = "variable-equal";
        } else {
          /**
           * The if statement solves various issues with how for loops are handled.
           */
          if(controlScope[controlScope.length-1] != "for" && currentWord != ")") {
            console.error("The command "+currentWord+" at line " + cln + ", word "+ cwn + " is not a valid command.");
          }
        }
        
      }
        /*
        * Rounding
        */
        else if (command == "round") {
            if(!isNaN(parseInt(currentWord.substring(0,1)))) { // is constant 
                if(currentWord.includes(".")) { // continue because it is a float
                    let out = currentWord;
                    if(currentWord.endsWith(".")) { // fake decimal, decimal that could be a number
                        out = out.substring(0,out.length-1);
                    }
                    if(variables[variables.indexOf(currentVariable)+1] != "f64") { 
                        console.error("Only decimal variables can be rounded. Line "+cln+" word "+cwn+".");
                    } else { // variable is valid for rounding
                        stackOutput += "(";
                        if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                            stackOutput+="set_local";
                        } else { // NO COMPATIBILITY
                            stackOutput+="local.set";
                        }
                        stackOutput += " $"+currentVariable+" (f64.nearest (f64.const "+out+")))\n";
                    }
                } else {
                    console.error("Only decimal constants/variables can be rounded. Line "+cln+" word "+cwn+".");
                }
            } else { // is text
                if (scope == "variable") { // should equal a variable, include set_local etc.
                        if(variables[variables.indexOf(currentVariable)+1] != "f64") { 
                            console.error("Only decimal variables can be rounded. Line "+cln+" word "+cwn+".");
                        } else { // variable is valid for rounding
                            stackOutput += "(";
                            if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                                stackOutput+="set_local";
                            } else { // NO COMPATIBILITY
                                stackOutput+="local.set";
                            }
                            stackOutput += " $"+currentVariable+" (f64.nearest (";//f64.const "+currentWord+")))\n";
                            if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                                stackOutput+="get_local";
                            } else { // NO COMPATIBILITY
                                stackOutput+="local.get";
                            }
                            stackOutput+= " $"+currentWord+" )))\n";
                        }
                    } else { // probably an output
                        if(options.includes("lone-math-output")) {
                            exportOutput = "(f64.nearest (";// f64.const "+currentWord+"))\n";
                            if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                                exportOutput+="get_local";
                            } else { // NO COMPATIBILITY
                                exportOutput+="local.get";
                            }
                            exportOutput+= " $"+currentWord+" ))\n";
                            console.warn("The round command at line "+cln+" word "+cwn+"  may cause runtime errors if there is no output specified.");
                        } else {
                            if(scope == "output") {
                                exportOutput = "(f64.nearest (";// f64.const "+currentWord+"))\n";
                                if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                                    exportOutput+="get_local";
                                } else { // NO COMPATIBILITY
                                    exportOutput+="local.get";
                                }
                                exportOutput+= " $"+currentWord+" ))\n";
                                outputType = "f64";
                            } else { // not an output, functionality removed in prerelease 0.2
                                console.error("A lone round statement will not be outputed as of pre-release 0.2. Bypassing this may cause errors, but can be done by passing the option lone-math-output. Line "+cln+" word "+cwn+".");
                                console.log(scope);
                            }
                        
                        }
                    }
            }
        }
        /*
        * TYPE CONVERSIONS
        */
        else if (command == "toNumber") {
            if(isNaN(parseInt(currentWord.substring(0,1)))) { // is text
                if(variables.includes(currentWord)) {
                    if(variables[variables.indexOf(currentWord)+1] != "f64") {
                        console.error("Only decimal variables can be converted to number variables. Line "+cln+" word "+cwn+".");
                    } else {
                        stackOutput += "(";
                        if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                            stackOutput+="set_local";
                        } else { // NO COMPATIBILITY
                            stackOutput+="local.set";
                        }
                        stackOutput += " $"+currentVariable+" ";
                        stackOutput += "(i32.trunc_s/f64 (f64.nearest ("/*+currentWord+"))\n";*/
                        if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                            stackOutput+="get_local";
                        } else { // NO COMPATIBILITY
                            stackOutput+="local.get";
                        }
                        stackOutput += " $"+currentWord+") )))\n"
                    }
                    
                } else {
                    console.error("Only declared variables can be used for type conversion. Line "+cln+" word "+cwn+".");
                }
            } else { // is a constant
                console.error("Only variables [not constants] can be used for type conversion. Line "+cln+" word "+cwn+".");
            }
        }
        else if (command == "toDecimal") {
            if(isNaN(parseInt(currentWord.substring(0,1)))) { // is text
                if(variables.includes(currentWord)) {
                    if(variables[variables.indexOf(currentWord)+1] != "i32") {
                        console.error("Only number variables can be converted to decimal variables. Line "+cln+" word "+cwn+".");
                    } else {
                        stackOutput += "(";
                        if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                            stackOutput+="set_local";
                        } else { // NO COMPATIBILITY
                            stackOutput+="local.set";
                        }
                        stackOutput += " $"+currentVariable+" ";
                        stackOutput += "(f64.convert_s/i32 (";/*+currentWord+"))\n";*/
                        if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                            stackOutput+="get_local";
                        } else { // NO COMPATIBILITY
                            stackOutput+="local.get";
                        }
                        stackOutput += " $"+currentWord+") ))\n"
                    }
                    
                } else {
                    console.error("Only declared variables can be used for type conversion. Line "+cln+" word "+cwn+".");
                }
            } else { // is a constant
                console.error("Only variables [not constants] can be used for type conversion. Line "+cln+" word "+cwn+".");
            }
        }
      
      /**
       * MATH:
       * 1. Checks if two arguments
       * 2. Checks if it is a variable or a constant
       *  -if constant, does math.
       *  -if variable,
       * 3. checks if variable exists
       * 4. does math to variable
       */
      else if((command == "add"||command == "sub"||command == "mul"||command == "div_s"||command == "rem_s") && scope != "output") {
          stackOutput += doMath("math", command, currentWord, currentVariable, scope, controlScope, options, cln, cwn, commandOffset);
      } else if(command == "output" || scope == "output") {
        /**
         * OUTPUT
         * 1. Checks if an output is already specified, if yes throws error (WHEN ADD MULTIPLE MODULES/FUNCTIONS IT SHOULD NOT ALWAYS THROW ERROR) come back to
         * 
         */
        if(exportOutput && !(command == "add"||command == "sub"||command == "mul"||command == "div_s"||command == "rem_s")) {
          if(!options.includes("output-warning")) { // if output warning is turned on (default)
            console.warn("Warning: More than one output in a module can not be specified. Will use most recent call. Line "+cln+" word "+cwn+".");
          }
        }
        // Continues because it is a warning
        if(command == "add"||command == "sub"||command == "mul"||command == "div_s"||command == "rem_s") { // do math if there should be math
           exportOutput += doMath("output", command, currentWord, currentVariable, scope, controlScope, options, cln, cwn, commandOffset);
            if(exportOutput.includes("f64")) { // This will cause an error at some point.
                outputType = "f64";
            } else if(exportOutput.includes("i32")) {
                outputType = "i32";
            }
        } else {
        if(isNaN(parseInt(currentWord))) { // is string
          if(variables.includes(currentWord)) { // is a declared variable
            outputType = variables[variables.indexOf(currentWord)+1];
            if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
              exportOutput = "get_local $"+currentWord+"\n";
            } else { // NO COMPATIBILITY
              exportOutput = "local.get $"+currentWord+"\n";
            }
          } else {
            console.error(currentWord + " is not a variable. Declare it before using it."); // assumes not a typo
          }
        } else { // is constant
          if(!options.includes("output-warning")) { // if output warning is turned on (default)
            console.warn("An output specified as a constant has no purpose. Compiling anyway...");
          }
          if(currentWord.includes(".")) { // currentWord is a float/decimal, includes decimal point
              let out = currentWord;
              if(currentWord.endsWith(".")) { // fake decimal, decimal that could be a number
                out = out.substring(0,out.length-1);
              }
            exportOutput = "f64.const "+out+"\n";
            outputType = "f64";
          } else { // integer/number
            exportOutput = "i32.const "+currentWord+"\n";
            outputType = "i32";
          }
          
        }
      }
      } else if (command == "if-condition") {
        if(currentWord == ")") {
          command = "if-start";
          delayedStackOutput.push(" "+")".repeat(numOfIfConditionStackEnds)+"\n"); // ends the check statement
          delayedStackOutput = delayedStackOutput.join('');
          stackOutput += delayedStackOutput;
          delayedStackOutput = [];
        } else {
          if(currentWord == ">"||currentWord == "<"||currentWord == ">="||currentWord == "<="||currentWord == "=="||currentWord == "!="||currentWord == "%%") {
            /**
             * 1. Determine what WebAssembly command to use
             * 2. Splice the command at the front
             * When compiler sees ) it adds a ) to the end of the if statement so no issues
             */
            let toUnshift = " (";
            numOfIfConditionStackEnds += 1;
            toUnshift += ifConditionType+".";
              if(currentWord == "%%") {
                toUnshift += "eqz\n  (";
                  if(ifConditionType == "f64") {
                      console.error("Decimal variables/constants cannot use remainder due to WASM restrictions. Line "+cln+" word "+cwn+".");
                  } else {
                      toUnshift += ifConditionType+".rem_s";
                      numOfIfConditionStackEnds++; // there is one more now
                  }
              } else {
                toUnshift += getComparisonOperator(currentWord);
              }
            
            toUnshift += "\n"; // adds newline for readability
            delayedStackOutput.splice(delayedStackOutput.length-1, 0, toUnshift);
          } else if(currentWord == "&&"){ // both
            delayedStackOutput.unshift("("+ifConditionType+".and\n");
            delayedStackOutput.push(")\n");
            //numOfIfConditionStackEnds doesnt change because we also add a ) to stop the old command
          } else if(currentWord == "||"){ // this or that and both
            delayedStackOutput.unshift("("+ifConditionType+".or\n");
            delayedStackOutput.push(")\n");
            //numOfIfConditionStackEnds doesnt change because we also add a ) to stop the old command
          } else if(currentWord == "!|"){ // this or that but not both
            delayedStackOutput.unshift("("+ifConditionType+".xor\n");
            delayedStackOutput.push(")\n");
            //numOfIfConditionStackEnds doesnt change because we also add a ) to stop the old command
          } else if(currentWord == "!"){ // only run if whatever is not true. MUST BE PUT AT END
            delayedStackOutput.unshift("("+ifConditionType+".eqz\n");
            numOfIfConditionStackEnds += 1;
          } else if (!isNaN(parseInt(currentWord.substring(0,1)))) { // is number
            if(currentWord.includes(".")) { // currentWord is a float/decimal, includes decimal point
              if(ifConditionType != "f64" && ifConditionType != "none") {
                console.error("Type mismatch in if statementent. Attempted to compare number with decimal. Line "+cln+" word "+cwn+".")
              }
                let out = currentWord;
            if(currentWord.endsWith(".")) { // fake decimal, decimal that could be a number
                out = out.substring(0,out.length-1);
            }
              delayedStackOutput.push("   (f64.const "+out+")\n");
              ifConditionType = "f64";
            } else { // integer/number
              delayedStackOutput.push("   (i32.const "+currentWord+")\n");
              if(ifConditionType != "i32" && ifConditionType != "none") {
                console.error("Type mismatch in if statementent. Attempted to compare number with decimal. Line "+cln+" word "+cwn+".")
              }
              ifConditionType = "i32";
            }
          } else if (isNaN(parseInt(currentWord.substring(0,1)))) { // might be a variable
            if(variables.includes(currentWord)) { // is a variable
              ifConditionType = variables[variables.indexOf(currentWord)+1]; // allows for checking of type
              if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                delayedStackOutput.push("   (get_local $"+currentWord+")\n");
              } else { // NO COMPATIBILITY
                delayedStackOutput.push("   (local.get $"+currentWord+")\n");
              }
            } else {
              console.error(currentWord + " is not a variable. Declare it before using it."); // assumes not a typo
            }
          }
          //delayedStackOutput.push(currentWord);
        }

        
      } else if (command == "while-condition") { // TO DO: USE WHILEDELAYSTACKOUTPUT
        if(currentWord == ")") {
          command = "while-start";
          whileDelayedStackOutput.unshift("(br_if 1 (i32.eqz "); // i32 because all operations return i32
          whileDelayedStackOutput.push(")"+")".repeat(numOfWhileConditionStackEnds)+")\n"); // ends the eqz and other things
         
          whileDelayedStackOutput = whileDelayedStackOutput.join('');
          stackOutput += whileDelayedStackOutput;
          whileDelayedStackOutput = [];
        } else {
          if(currentWord == ">"||currentWord == "<"||currentWord == ">="||currentWord == "<="||currentWord == "=="||currentWord == "!=") {
            /**
             * 1. Determine what WebAssembly command to use
             * 2. Splice the command at the front
             * When compiler sees ) it adds a ) to the end of the if statement so no issues
             */
            //let toUnshift = "(br_if 1 (";
            let toUnshift = "(";
            toUnshift += whileConditionType+".";
            numOfWhileConditionStackEnds += 1;
            toUnshift += getComparisonOperator(currentWord);
            toUnshift += " " // adds space for readability
            whileDelayedStackOutput.splice(whileDelayedStackOutput.length-1, 0, toUnshift);
          } else if(currentWord == "&&"){ // both
            whileDelayedStackOutput.unshift("("+whileConditionType+".and ");
            whileDelayedStackOutput.push(") ");
            //numOfWhileConditionStackEnds doesnt change because we also add a ) to stop the old command
          } else if(currentWord == "||"){ // this or that and both
            whileDelayedStackOutput.unshift("("+whileConditionType+".or ");
            whileDelayedStackOutput.push(") ");
            //numOfWhileConditionStackEnds doesnt change because we also add a ) to stop the old command
          } else if(currentWord == "!|"){ // this or that but not both
            whileDelayedStackOutput.unshift("("+whileConditionType+".xor ");
            whileDelayedStackOutput.push(") ");
            //numOfWhileConditionStackEnds doesnt change because we also add a ) to stop the old command
          } else if(currentWord == "!"){ // only run if whatever is not true. MUST BE PUT AT END
            whileDelayedStackOutput.unshift("("+whileConditionType+".eqz ");
            numOfWhileConditionStackEnds += 1;
          } else if (!isNaN(parseInt(currentWord.substring(0,1)))) { // is number
            if(currentWord.includes(".")) { // currentWord is a float/decimal, includes decimal point
              if(whileConditionType != "f64" && whileConditionType != "none") {
                console.error("Type mismatch in while statementent. Attempted to compare number with decimal. Line "+cln+" word "+cwn+".")
              }
              let out = currentWord;
              if(currentWord.endsWith(".")) { // fake decimal, decimal that could be a number
                out = out.substring(0,out.length-1);
              }
              whileDelayedStackOutput.push("(f64.const "+out+")");
              whileConditionType = "f64";
            } else { // integer/number
              whileDelayedStackOutput.push("(i32.const "+currentWord+")");
              if(whileConditionType != "i32" && whileConditionType != "none") {
                console.error("Type mismatch in while statementent. Attempted to compare number with decimal. Line "+cln+" word "+cwn+".")
              }
              whileConditionType = "i32";
            }
          } else if (isNaN(parseInt(currentWord.substring(0,1)))) { // might be a variable
            if(variables.includes(currentWord)) { // is a variable
              whileConditionType = variables[variables.indexOf(currentWord)+1]; // allows for checking of type
              if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                whileDelayedStackOutput.push("(get_local $"+currentWord+")");
              } else { // NO COMPATIBILITY
                whileDelayedStackOutput.push("(local.get $"+currentWord+")");
              }
            } else {
              console.error(currentWord + " is not a variable. Declare it before using it."); // assumes not a typo
            }
          }
        }
        
      }

      if(scope == "variable") {
        /**
         * Checks to see if part of an equality, otherwise creates variable
         */
        if(currentWord == "=") {
          if(command.includes("equal")) { // proper equality use
            if(command == "variable-equal") { // allows for constants etc. to be recognized as equals.
              command = "variable-set";
            }
          } else {
            console.error("The equal sign at line "+cln+" word "+cwn+" is not used in the right place.");
          }
        }
        /**
         * Checks to see if it should be equaling a number constant or variable and then sets
         * 
         */
        if(command=="variable-set" && currentWord != "=") {
          if(variables.includes(currentVariable)) { // makes sure variable exists
          if(!isNaN(parseInt(currentWord.substring(0,1)))) { // is a constant
              let out = currentWord;
              if(currentWord.includes(".")) { // decimal/float variable
                if(currentWord.endsWith(".")) { // fake decimal, decimal that could be a number
                    out = out.substring(0,out.length-1);
                }
                if(variables[variables.indexOf(currentVariable)+1] == "i32") {
                    console.error("Decimal constant put where number constant should be. Line "+cln+" word "+cwn+".");
                }
              }
            if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
              stackOutput += "(set_local $"+currentVariable+" ("+variables[variables.indexOf(currentVariable)+1]+".const "+out+"))\n";
            } else { // NO COMPATIBILITY
              stackOutput += "(local.set $"+currentVariable+" ("+variables[variables.indexOf(currentVariable)+1]+".const "+out+"))\n";
            }
          } else { // is a variable
            if(variables[variables.indexOf(currentWord)+1] != "i32") { // if a different type
              console.error("Error: Type mismatch. Variable "+currentWord+" is a decimal, not a number. Line "+cln+" word "+cwn+".")
            }
            if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
              stackOutput += "(set_local $"+currentVariable+" (get_local $"+currentWord+"))\n";
            } else { // NO COMPATIBILITY
              stackOutput += "(local.set $"+currentVariable+" (local.get $"+currentWord+"))\n";
            }
          }
            
          } else {
            console.error(currentWord + " is not a variable. Declare it before using it. Line "+cln+" word "+cwn+".");
          }
          
        }
        if(command == "i32"||command == "f64") {
          /**
           * Create a new number (int) variable. Checks if variable already exists. If variable already exists, throws warning but still runs equation
           */
          if (!variables.includes(currentWord)) { // New variable
          // check if allowed ie starts with a number
            if(isNaN(parseInt(currentWord.substring(0,1)))) { // does not start with a number
              currentVariable = currentWord;
              localHeaderOutput.push("(local $"+currentWord+" "+command+") ");
              variables.push(currentWord);
              variables.push(command);
              command = "variable-equal";
            } else { // starts with number
              console.error("Error: variables cannot start with a number. Line "+cln+" word "+cwn+".");
            }
          } else { // existing variable, throws warning as described above
            console.warn("There is already a variable named "+ currentWord +". Line "+cln+" word "+cwn+". Running anyway...");
            command = "variable-equal";
            currentVariable = currentWord;
          }
          
        }
      }
      
    }

    if (controlScope[controlScope.length-1] == "for") { //currently in a for loop
          if(currentWord == ";") {
            if(semiForNum == 1) {
              stackOutput += "(block\n(loop\n";
            } else if(semiForNum == 2) {
              stackOutput += "(br_if 1 ("+forData[1]+".eq (";
              if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                stackOutput+= "get_local $";
              } else {
                stackOutput+= "local.get $";
              }
              stackOutput+=forData[0]+" ) (";

              if(!isNaN(parseInt(forData[2].substring(0,1)))) { // is a constant
                stackOutput += forData[1]+".const "+forData[2];
              } else { // is variable
                if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                  stackOutput+= "get_local $";
                } else {
                  stackOutput+= "local.get $";
                }
                stackOutput += forData[2];
                stackOutput += " ";
              }
              stackOutput += ")))\n";

              var forOldStackOutput = stackOutput;
              
            }
          } else if(currentWord == ")") {
            controlScope[controlScope.length-1] = "for-start";
            var forDiff = getDifference(stackOutput, forOldStackOutput);
            stackOutput = forOldStackOutput;
            if(semiForNum < 3) {
              console.error("Not enough arguments provided for for conditional. Line "+cln+" word "+cwn+".");
            }
            
          } else {
            if(words[cwn+1] == "to") { // next word is to
              var forData = ["","",""];
              if(!isNaN(parseInt(currentWord.substring(0,1)))) { // is a constant
                console.error("Left side of for conditional must be a variable. Line "+cln+" word "+cwn+".");
              } else {
                if(variables.includes(currentWord)) {
                  forData[0] = currentWord;
                  forData[1] = variables[variables.indexOf(currentWord)+1];
                } else {
                  console.error(currentWord + " is not a variable. Declare it before using it. Line "+cln+" word "+cwn+".");
                }
              }
            } else if (words[cwn-1] == "to") {
              if(!isNaN(parseInt(currentWord.substring(0,1)))) { // is a constant
                forData[2] = currentWord;
                if(currentWord.includes(".")) {
                  if(forData[1] != "f64") {
                    console.error("Type mismatch. Expected number but got decimal. Line "+cln+" word "+cwn+".");
                  }
                } else {
                  if(forData[1] != "i32") {
                    console.error("Type mismatch. Expected decimal but got number. Line "+cln+" word "+cwn+".");
                  }
                }
              } else { // is text
                    if(variables.includes(currentWord)) {
                        forData[2] = currentWord;
                        if(variables[variables.indexOf(currentWord)+1] != forData[1]) {
                           console.error("Type mismatch. Expected decimal but got number. Line "+cln+" word "+cwn+".");
                        }
                    } else {
                        console.error(currentWord + " is not a variable. Declare it before using it. Line "+cln+" word "+cwn+".");
                    }
              }
            }
            
          }
        }
    

  }
}

/**
 * Exporting/Compiling
 */
var finalOutput = "";
headerOutput.push('(result '+outputType+') '); // makes sure params work right
finalOutput += "(module \n" + headerOutput.join('') + localHeaderOutput.join('') + "\n"+stackOutput+exportOutput+"))";
//console.log(finalOutput);
document.getElementById("compiled").innerText = finalOutput;

if(exportOutput == "") {
    console.warn("Programs without output commands may throw errors at runtime.")
}

/**
* Checks if there is an unending comment. Warning because unending commebts are technically legal though advised against heavily.
*/
if(command == "comment") {
  console.warn("Unending comment found at line " + cln + ", word "+ cwn + ".");
} 
/**
* Checks if there is an unending command. Errors because it can cause many issues.
*/
else if(command != "") {
  console.error("The command "+command+" is not ended.")
}

    
    
    /* FORMAT TO WASM */
    
    /*
NOTICE: Brackets formats anything typed in to ascii, so it will thro an error. Use sublime for changing binaries!
*/
    var features = {};
    
    WabtModule().then(function(wabt) {

var FEATURES = [
  'exceptions',
  'mutable_globals',
  'sat_float_to_int',
  'sign_extension',
  'simd',
  'threads',
  'multi_value',
  'tail_call',
  'bulk_memory',
  'reference_types',
];

//var kCompileMinMS = 100;

var outputEl = document.getElementById('wasmcompiled');
//var jsLogEl = document.getElementById('js_log');
//var selectEl = document.getElementById('select');
//var downloadEl = document.getElementById('download');
//var downloadLink = document.getElementById('downloadLink');
var binaryBuffer = null;
var binaryBlobUrl = null;

for (var feature of FEATURES) {
  var featureEl = document.getElementById(feature);
  features[feature] = featureEl.checked;
  featureEl.addEventListener('change', event => {
    var feature = event.target.id;
    features[feature] = event.target.checked;
    onWatChange();
  });
}
var watEditor = finalOutput;/*document.getElementById("compiled").innerText; /*CodeMirror((elt) => {
  document.getElementById('top-left').appendChild(elt);
}, {
  mode: 'wast',
  lineNumbers: true,
});*/
/*
var jsEditor = CodeMirror((elt) => {
  document.getElementById('bottom-left').appendChild(elt);
}, {
  mode: 'javascript',
  lineNumbers: true,
});*/
/*
function debounce(f, wait) {
  var lastTime = 0;
  var timeoutId = -1;
  var wrapped = function() {
    var time = +new Date();
    if (time - lastTime < wait) {
      if (timeoutId == -1)
        timeoutId = setTimeout(wrapped, (lastTime + wait) - time);
      return;
    }
    if (timeoutId != -1)
      clearTimeout(timeoutId);
    timeoutId = -1;
    lastTime = time;
    f.apply(null, arguments);
  };
  return wrapped;
}*/
compileWASM();
function compileWASM() {
  outputEl.innerHTML = '';
  var binaryOutput;
  try {
    var module = wabt.parseWat('main.wast', watEditor, features);
    module.resolveNames();
    module.validate(features);
    var binaryOutput = module.toBinary({log: true, write_debug_names:true});
    outputEl.innerHTML = binaryOutput.log;
    binaryBuffer = binaryOutput.buffer;
    var blob = new Blob([binaryOutput.buffer]);
    if (binaryBlobUrl) {
      URL.revokeObjectURL(binaryBlobUrl);
    }
    binaryBlobUrl = URL.createObjectURL(blob); // RUN CODE
      fetch(binaryBlobUrl).then(response =>
  response.arrayBuffer()
).then(bytes => WebAssembly.instantiate(bytes)).then(results => {
  instance = results.instance;
          let params = [];
          for(var b = 1; b <=(document.getElementById("param-container").childElementCount-2)/3;b++) {
              let val = document.getElementById("param-"+b).value;
              if(!val.includes("to")) {
                  params.push(val);
              }
          }
          for(var time = 1;time<=document.getElementById("loops").value; time++) {
              runner.log(instance.exports.main(...params));
              params = params.map(val => parseInt(val)+1); // increase all by one;
          }
  
}).catch(console.error); // run code 
      
    //downloadLink.setAttribute('href', binaryBlobUrl);
    //downloadEl.classList.remove('disabled');
  } catch (e) {
    outputEl.innerHTML += e.toString();
      runner.error("Runtime "+e.toString());
    //downloadEl.classList.add('disabled');
  } finally {
    if (module) module.destroy();
  }
}
/*
function run() {
  //jsLogEl.innerHTML = '';
  if (binaryBuffer === null) return;
  try {
    let wasm = new WebAssembly.Module(binaryBuffer);
    let js = jsEditor.getValue();
    let fn = new Function('wasmModule', 'console', js + '//# sourceURL=demo.js');
    fn(wasm, wrappedConsole);
  } catch (e) {
    //jsLogEl.innerHTML += String(e);
  }
}*/

/*var onWatChange = debounce(compile, kCompileMinMS);
var onJsChange = debounce(run, kCompileMinMS);*/
/*
function setExample(index) {
  var example = examples[index];
  watEditor.setValue(example.contents);
  onWatChange();
  jsEditor.setValue(example.js);
  onJsChange();
}

function onSelectChanged(e) {
  setExample(this.selectedIndex);
}*/

        // DOWNLOAD 
/*function onDownloadClicked(e) {
  // See https://developer.mozilla.com/en-US/docs/Web/API/MouseEvent
  var event = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  //downloadLink.dispatchEvent(event);
}
*/
/*
watEditor.on('change', onWatChange);
jsEditor.on('change', onJsChange);*/
//selectEl.addEventListener('change', onSelectChanged);
//downloadEl.addEventListener('click', onDownloadClicked);
/*
for (var i = 0; i < examples.length; ++i) {
  var example = examples[i];
  var option = document.createElement('option');
  option.textContent = example.name;
  //selectEl.appendChild(option);
}*/
//selectEl.selectedIndex = 1;
//setExample(selectEl.selectedIndex);

});
    
    
    
    
    
    
    

}



function getComparisonOperator(curword) {
  if(curword == "==") { // EQUAL
    return "eq";
  } else if(curword == "!=") { // NOT EQUAL
    return "ne";
  } else if(curword == ">") { // GREATER THAN
    return "gt_s";
  } else if(curword == "<") { // LESS THAN
    return "lt_s";
  } else if(curword == ">=") { // GREATER THAN OR EQUAL TO
    return "ge_s";
  } else if(curword == "<=") { // LESS THAN OR EQUAL TO
    return "le_s";
  } else {
    console.error(curword+" is not an operator. Line "+cln+" word "+cwn+".");
  }
}

var mathType = "None";
function doMath(from, command, currentWord, currentVariable, scope, controlScope, options, cln, cwn, commandOffset) {
    let toReturn = "";
    if(cwn-commandOffset > 2) { // Too many arguments
          console.error("Error: Two arguments expected for "+command+" command, but got more. Line "+cln+" word "+cwn+".");
        } else {
          if(isNaN(parseInt(currentWord))) { // is string
            if(variables.includes(currentWord)) { // is variable
              if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY CHANGE TO FUNCTION
                toReturn += (`get_local $`+currentWord+"\n");
              } else { // No compatibility
                toReturn += (`local.get $`+currentWord+"\n");
              }
                if(mathType != variables[variables.indexOf(currentWord)+1] && mathType != "None") {
                    console.error("Type mismatch. Line "+cln+" word "+cwn+".");
                }
                mathType = variables[variables.indexOf(currentWord)+1];
                
            } else {
              console.error(currentWord + " is not a variable. Declare it before using it. Line "+cln+" word "+cwn+"."); // assumes not a typo
            }
          } else { // is constant
              
              if(currentWord.includes(".")) { // number vs decimal
                    if(mathType != "f64" && mathType != "None") {
                        console.error("Type mismatch. Expected number but got decimal. Line "+cln+" word "+cwn+".");
                    }
                    mathType = "f64";
                    let out = currentWord;
                    if(currentWord.endsWith(".")) { // fake decimal, decimal that could be a number
                        out = out.substring(0,out.length-1);
                    }
                    toReturn += (`f64.const `+out+"\n");
                    
              } else { // number
                    if(mathType != "i32" && mathType != "None") {
                        console.error("Type mismatch. Expected decimal but got number. Line "+cln+" word "+cwn+".");
                    }
                    mathType = "i32";
                    toReturn += (`i32.const `+currentWord+"\n");
              }
            
          }
          if(cwn-commandOffset == 2) {
              if(mathType == "f64" && command == "div_s") { // floats don't have signs in wasm
                command = "div";
              } else if(mathType == "f64" && command == "rem_s") { // floats don't have signs in wasm
                console.error("Decimal variables/constants cannot use remainder due to WASM restrictions. Line "+cln+" word "+cwn+".");
              }
              /**
               * Checks if it should be a variable equality by checking if currentVariable is set.
               */
              if(!currentVariable) { // not in a variable, print last thing
                // This is equivalent to just outputting so it throws a warning
                if(scope != "output") {
                    if(!options.includes("lone-math-output")) { // issues are caused without this
                        console.warn("The math statement at line "+cln+" word "+cwn+" is not valid. Consider using the output keyword.");
                    }
                }
                if(controlScope.includes("if")||controlScope.includes("while")||controlScope.includes("for")) { // if statement output works weird
                  if(!options.includes("output-warning")) { // respect compiler options
                    console.error("A lone math command specified in an if statement will not run inside of the if statement. Consider using the output keyword. Line "+cln+" word "+cwn+".");
                  }
                } else {
                    if(from != "output") {
                        if(!options.includes("lone-math-output")) {
                            console.error("A lone math statement will not be outputed as of pre-release 0.2. Bypassing this may cause errors, but can be done by passing the option lone-math-output. Line "+cln+" word "+cwn+".");
                        } else {
                            toReturn += (`i32.`+command+"\n");
                            console.warn("The math command at line "+cln+" word "+cwn+"  may cause runtime errors if the variable(s) or constant(s) are not of number type.");
                        }
                    } else {
                        toReturn += mathType+`.`+command+"\n";
                        outputType = mathType;
                    }
                }
                
              } else { // in a variable. set variable to addition problem
                  if(mathType != variables[variables.indexOf(currentVariable)+1] && mathType != "None") {
                    console.error("Type mismatch. Line "+cln+" word "+cwn+".");
                  }
                if(document.getElementById("compatibility").checked == true) { // COMPATIBILITY
                  toReturn += (`(set_local $` + currentVariable + " ("+variables[variables.indexOf(currentVariable)+1]+"."+command+"))\n");
                } else { // NOT COMPATIBILITY
                  toReturn += (`(local.set $` + currentVariable + " ("+variables[variables.indexOf(currentVariable)+1]+"."+command+"))\n");
                }
              }
            }
        }
    return toReturn;
}

