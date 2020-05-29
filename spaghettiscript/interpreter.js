window.onerror = function (message, url, lineNo) {
 alert('Javascript Error: ' + message+". Please submit a bug report on GitHub if this is not expected behavior.");
 return true;   
}
var editor = document.getElementById("editor");
var interpretButton = document.getElementById("interpret-button");
interpretButton.onclick = ()=>{interpret();}
//interpret(); // DEBUG

var cells = [0];
var memory = 0;
var currentCellNum = 0;
var functions = []; // The list of functions along with what they contain


function interpret() {
    var it = editor.value; // interpretedText
    functions = []; // The list of functions along with what they contain
    /**
    * Get All Functions
    */
    cells = [0];
    currentCellNum = 0;
    memory = 0;
    var getFunctionDefinitions = /\[\d+/g;
    var getFunctions = /\[\d+[^\]]*\]/g;
    var getFunctionCalls = /(?:{})?(?:---|~~~)≡\d+/g; //   old: (?:[^\d+}])(?:{})?---≡\d+
    let funcs = it.match(getFunctionDefinitions); // The function definitions; used to 
    for(func in funcs) {
        let newFuncNum = funcs[func].split("");
        newFuncNum.shift();
        newFuncNum = newFuncNum.join("");
        functions.push(parseInt(newFuncNum));
        //functions.push(parseInt(funcs[func].charAt(1)));
        functions.push(it.match(getFunctions)[func])
    }
    //console.log(functions);
    var outside = editor.value;
    outside = outside.split("");
    var inFunc = false;
    for(var letter = 0; letter <= outside.length; letter++) {
        let le = outside[letter];
        if(inFunc == true && le!="]") {
            outside[letter] = "n"; // works because is considered comment
        }
        if(le=="[") {
            inFunc = true;
        }
        if(le=="]") {
            inFunc = false;
        }
    }
    outside=outside.join("");
    
    let funcCalls = outside.match(getFunctionCalls);
    if(funcCalls) {
        //funcCalls=funcCalls.map(e=>{return e.substring(1);}); // old
        runCalls();
        async function runCalls() {
            for(call in funcCalls) { // for loop that does the running
                console.log(await interpretFunction(funcCalls[call]));
            }
        }
    } else {
        alert("There must be a function call.");
    }
    
   
}

async function interpretFunction(cl, allFuncs=functions) {
        cl = cl.split("≡");
        if(cl[0].includes("-")) {
            currentCellNum = 0; // resets
        }
        let currentFunctionContents = allFuncs[allFuncs.indexOf(parseInt(cl[1]))+1];
        if(allFuncs.indexOf(parseInt(cl[1]))+1 == 0) {
            console.error("The function "+cl[1]+" was not found.");
            alert("Error: The function "+cl[1]+" was not found.");
        }
        /*currentFunctionContents = currentFunctionContents.split(cl[1]);
    if(currentFunctionContents.length > 2) {
        currentFunctionContents[1]=currentFunctionContents.slice(1, currentFunctionContents.length).join("");
        while(currentFunctionContents.length>2) {
            currentFunctionContents.pop();
        }
    }*/
    currentFunctionContents = [...currentFunctionContents];
    for(var i=0;i<=cl[1].length;i++) {
        currentFunctionContents.shift();
    }
        //currentFunctionContents = [...currentFunctionContents[1]];
        currentFunctionContents.pop();
        
        /* RUN THE CODE */
        for(let i=0;i<=currentFunctionContents.length-1; i++) {
            let curChar = currentFunctionContents[i];
            if(curChar == "~") {
                // add one to current cell or run function 
                if(currentFunctionContents[i+1] == "≡"||(currentFunctionContents[i+2] == "≡"&&currentFunctionContents[i+1] == "~")||(currentFunctionContents[i+3] == "≡"&&currentFunctionContents[i+1] == "~"&&currentFunctionContents[i+2] == "~")) {
                    // DO NOT ADD: function call is in the threquals. This is spaghetti code but that is the language after all :) 
                } else {
                    cells[currentCellNum] += 1;
                }
            } else if(curChar == "-") {
                // subtract one from current cell or is a function call
                if(currentFunctionContents[i-1] == "="||currentFunctionContents[i+1] == "≡"||(currentFunctionContents[i+2] == "≡"&&currentFunctionContents[i+1] == "-")||(currentFunctionContents[i+3] == "≡"&&currentFunctionContents[i+1] == "-"&&currentFunctionContents[i+2] == "-")) {
                    // DO NOT SUBTRACT: function call is in the threquals. This is spaghetti code but that is the language after all :) 
                } else {
                    // subtraction
                    cells[currentCellNum] -= 1;
                }
                
            } else if(curChar == "≡") {
                if(currentFunctionContents[i+1] !== "O") {
                    if(currentFunctionContents[i-4] == "}") {
                        let numBackToEq = 0;
                        while(true) { // run back until equal sign is found
                            if(currentFunctionContents[i-numBackToEq] == "=") {
                               break;
                            }
                            if(numBackToEq > 100) {
                                alert("Error: Missing equal sign somewhere.");
                                break;
                            }
                            numBackToEq += 1;
                        }
                        // now we have numBackToEq so we can calculate equalNum
                        var equalNum = [];
                        var n = numBackToEq-1;
                        if(currentFunctionContents[i-n] == "-") {
                            equalNum.push("-");
                            n-=1;
                        }
                        while(!Number.isNaN(parseInt(currentFunctionContents[i-n]))) {
                            equalNum.push(parseInt(currentFunctionContents[i-n]));
                            n--;
                        }
                        equalNum=parseInt(equalNum.join(""));
                        if(cells[currentCellNum] == equalNum) {
                            var funcNum = [];
                            var n = 1;
                            while(!Number.isNaN(parseInt(currentFunctionContents[i+n]))) {
                                funcNum.push(parseInt(currentFunctionContents[i+n]));
                                n++;
                            }
                            funcNum=parseInt(funcNum.join(""));
                            if(currentFunctionContents[i-1] == "-") {
                                await interpretFunction("---≡"+funcNum);
                            } else if(currentFunctionContents[i-1] == "~") {
                                await interpretFunction("~~~≡"+funcNum);
                            }
                            return new Promise(resolve => {resolve(currentFunctionContents);});
                        } // dont run
                    } else {
                        var funcNum = [];
                        var n = 1;
                        while(!Number.isNaN(parseInt(currentFunctionContents[i+n]))) {
                            funcNum.push(parseInt(currentFunctionContents[i+n]));
                            n++;
                        }
                        funcNum=parseInt(funcNum.join(""));
                        if(currentFunctionContents[i-1] == "-") {
                            console.log(cells[currentCellNum]);
                            await interpretFunction("---≡"+funcNum);
                        } else if(currentFunctionContents[i-1] == "~") {
                            // later
                            await interpretFunction("~~~≡"+funcNum);
                        }
                        return new Promise(resolve => {resolve(currentFunctionContents);});
                    }
                }
                
            } else if(curChar == "⇢"||curChar == "→") {
                // Move right one cell
                currentCellNum += 1;
                if(typeof (cells[currentCellNum]) == "undefined") {
                    cells[currentCellNum] = 0;
                }
            } else if(curChar == "⇠"||curChar == "←") {
                // Move left one cell
                currentCellNum -= 1;
                if(typeof (cells[currentCellNum]) == "undefined") {
                    cells[currentCellNum] = 0;
                }
            } else if(curChar == "o") {
                if(currentFunctionContents[i-1] == ":") {
                    // set current cell to input
                    cells[currentCellNum] = parseInt(prompt("Enter input as an integer.")); // make better later
                }
            } else if(curChar == "O") {
                if(currentFunctionContents[i-1] == ":") {
                    if(currentFunctionContents[i+1] == "A") { // as ascii
                        // output current cell's value as ascii
                        document.getElementById("output").innerHTML += String.fromCharCode(cells[currentCellNum]);
                    } else {
                        // output current cell's value
                        document.getElementById("output").innerHTML += cells[currentCellNum]+" ";
                    }
                } else if(currentFunctionContents[i-1] == "≡") {
                    // set cell's value to memory
                    cells[currentCellNum] = memory;
                } else {
                    // Hold cell's value in memory
                    memory = cells[currentCellNum];
                    
                }
            } 
        }
        
        
        return new Promise(resolve => {resolve(currentFunctionContents);});
        //resolve("Ran Function.");
  
}
