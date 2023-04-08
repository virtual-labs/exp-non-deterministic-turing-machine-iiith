/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

dtm = [dtm1, dtm2];
dtmIndex = 0

stateIndex = 0;
inputIndex = 0;
inputPointer = -1;

// nodes = []
// edges = []

function refreshCanvas(){
  clearElem(canvas);
  clearElem(canvas2);

  curr = "";
  if(inputPointer != -1){
    console.log("before", inputPointer, curr);
    // console.log(dfa[dfaIndex]["input"]);
    curr = dtm[dtmIndex]["input"][inputIndex]["states"][inputPointer];
    console.log("after", inputPointer, curr);
  }

  DTMDescriptionContainer = document.getElementById("DTM_description_container");
  clearElem(DTMDescriptionContainer);
  textColor = "black";
  span = newElement("font", [["id", "DTM_description"], ["color", textColor]]);
  text = document.createTextNode(dtm[dtmIndex]["description"]);
  span.appendChild(text);
  DTMDescriptionContainer.appendChild(text);

  res = displayCanvas(canvas, canvas2, dtm[dtmIndex], inputIndex, stateIndex);

  // nodes = res[0]
  // edges = res[1]
}

function resetInput(){
  inputIndex = 0;
  stateIndex = 0;

  refreshInput();
}

function refreshInput(){
  inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);
  for(let i=0;i<dtm[dtmIndex]["input"][inputIndex]["string"].length;++i){
    textColor = "black";
    span = newElement("font", [["id", "text_"+i], ["color", textColor]]);
    text = document.createTextNode(dtm[dtmIndex]["input"][inputIndex]["string"][i]);
    span.appendChild(text);
    inputContainer.appendChild(span);
  }
}

function resetStack(){
  stack = document.getElementById("stack_list");
  clearElem(stack);
}

function addToStack(str){
  stack = document.getElementById("stack_list");
  listElem = newElement("li", []);
  textNode = document.createTextNode(str);
  listElem.appendChild(textNode)
  stack.appendChild(listElem);

}

function removeFromStack(){
  stack = document.getElementById("stack_list");
  if(stack.firstChild){
    stack.removeChild(stack.lastChild);
  }
}

function updateTransitions(){
  transitionTable = document.getElementById("transition_table_container");
  clearElem(transitionTable);

  table = newElement("table", [["id", "transition_table"]]);

  tr0 = newElement("tr", [["id", "tr0"]]);

  tr0th0 = newElement("th", [["id", "tr0_th0"]]);
  tr0th0.appendChild(document.createTextNode("state"));
  tr0.appendChild(tr0th0);
  table.appendChild(tr0);

  Object.keys(dtm[dtmIndex]["transition"]["q0"]).forEach(function(keyName, keyIndex){
  	th = newElement("th", [["id", "tr0_th"+(keyIndex+1)]]);
  	th.appendChild(document.createTextNode(keyName));
  	tr0.appendChild(th);
  });

  Object.keys(dtm[dtmIndex]["transition"]).forEach(function(stateName, stateIndex){
  	tr = newElement("tr", [["id", "tr"+(stateIndex+1)]]);

  	trtd0 = newElement("td", [["id", "tr"+(stateIndex+1)+"_td0"]]);
  	trtd0.appendChild(document.createTextNode(stateName));
  	tr.appendChild(trtd0);

  	Object.keys(dtm[dtmIndex]["transition"][stateName]).forEach(function(keyName, keyIndex){
  	  trtd = newElement("td", [["id", "tr"+(stateIndex+1)+"_td"+(keyIndex+1)]]);
  	  trtd.appendChild(document.createTextNode(dtm[dtmIndex]["transition"][stateName][keyName]));
  	  tr.appendChild(trtd);
  	});
  	table.appendChild(tr);
  });

  transitionTable.appendChild(table);
}

window.addEventListener('load', function(e){
  canvas = document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2");

  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();

  // Event listener for changing DFA
  changeDTM = document.getElementById("change_dtm");
  changeDTM.addEventListener("click", function(e){
    clearElem(canvas);
    dtmIndex = dtmIndex + 1;
    if(dtmIndex >= dtm.length){
      dtmIndex = 0;
    }
    resetInput();
    refreshCanvas();
    resetStack();
    updateTransitions();
  });

  // Event listener for changing input
  changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function(e){
    inputIndex = inputIndex + 1;
    if(inputIndex >= dtm[dtmIndex]["input"].length){
      inputIndex = 0;
    }
    stateIndex = 0;
    refreshInput();
    refreshCanvas();
    resetStack();
  });

  // // Event listener for next
  next = document.getElementById("next");
  next.addEventListener("click", function(e){
    console.log("herer");
    if(stateIndex != dtm[dtmIndex]["input"][inputIndex]["states"].length-1){
      stateIndex += 1;
      refreshInput();
      refreshCanvas();
    
      prevState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex-1];
      currState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex];
      str = "read: "+prevState[0][prevState[1]];
      str += ", write: "+currState[0][prevState[1]];
      if(prevState[1] > currState[1]){
        str += ", move left";
      }else{
        str += ", move right";
      }
      str += ", new state: "+currState[2];
      addToStack(str);


      currState = dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][0];
      currCell = currState[dtm[dtmIndex]["input"][inputIndex]["states"][stateIndex][1]];
      if(stateIndex == dtm[dtmIndex]["input"][inputIndex]["states"].length-1){
        if(currCell == "S"){
          swal("Input string was accepted");
        }else{
          swal("Input string was rejected");
        }
      }
    }
    // if(inputPointer != pdfa[pdfaIndex]["input"][inputIndex]["string"].length){
    //   inputPointer = inputPointer + 1;
    //   refreshInput();
    //   refreshCanvas();
    //   str = "";
    //   if(inputPointer!=0){
    //     str += "read character "+pdfa[pdfaIndex]["input"][inputIndex]["string"][inputPointer-1]+",";
    //     pushDownStackLength = pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer].length;
    //     prevPushDownStackLength = pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer-1].length;
    //     if(pushDownStackLength > prevPushDownStackLength){
    //       str += " pushed "+pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer][pushDownStackLength-1]+" into stack";
    //     }else if(pushDownStackLength < prevPushDownStackLength){
    //       str += " popped "+pdfa[pdfaIndex]["input"][inputIndex]["stack"][inputPointer-1][prevPushDownStackLength-1]+" from stack";
    //     }
    //     str += " and moved from state "+pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer-1];
    //     str += " to state "+pdfa[pdfaIndex]["input"][inputIndex]["states"][inputPointer];
    //   }
    //   if(inputPointer==0){
    //     str += "moved to start state";
    //   }
    //   addToStack(str);

    // //   // Display popup at end
    //   if(==pdfa[pdfaIndex]["input"][inputIndex]["string"].length){

    //     computationStatus = "Rejected";

    //     for(itr=0;itr<pdfa[pdfaIndex]["vertices"].length;++itr){
    //       if(pdfa[pdfaIndex]["vertices"][itr]["text"] == curr){
    //         if(pdfa[pdfaIndex]["vertices"][itr]["type"] == "accept"){
    //           computationStatus = "Accepted";
    //         }
    //         break;
    //       }
    //     }
    //     swal("Input string was "+computationStatus);
    //   }
    // }
  });

  // // Event listener for prev
  prev = document.getElementById("prev");
  prev.addEventListener("click", function(e){
    if(stateIndex != 0){
      stateIndex = stateIndex - 1;
      refreshInput();
      refreshCanvas();
      removeFromStack();
    }
  });

});
