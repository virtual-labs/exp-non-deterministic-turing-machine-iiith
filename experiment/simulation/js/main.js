/*****
 * File containing main logic to display DFA
 *
 */

width = 500;
height = 200;
radius = 25;

ndtm = [ndtm1, ndtm2];
ndtmIndex = 0

stateIndex = 0;
inputIndex = 0;
inputPointer = -1;

path_state = "acc";

// nodes = []
// edges = []

function refreshCanvas(){
  clearElem(canvas);
  clearElem(canvas2);

  curr = "";
  if(inputPointer != -1){
    console.log("before", inputPointer, curr);
    // console.log(dfa[dfaIndex]["input"]);
    curr = ndtm[ndtmIndex]["input"][inputIndex]["states"][inputPointer];
    console.log("after", inputPointer, curr);
  }

  NDTMDescriptionContainer = document.getElementById("NDTM_description_container");
  clearElem(NDTMDescriptionContainer);
  textColor = "black";
  span = newElement("font", [["id", "DTM_description"], ["color", textColor]]);
  text = document.createTextNode(ndtm[ndtmIndex]["description"]);
  span.appendChild(text);
  NDTMDescriptionContainer.appendChild(text);

  res = displayCanvas(canvas, canvas2, ndtm[ndtmIndex], inputIndex, stateIndex, path_state);
}

function resetInput(){
  inputIndex = 0;
  stateIndex = 0;

  refreshInput();
}

function refreshInput(){
  inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);
  for(let i=0;i<ndtm[ndtmIndex]["input"][inputIndex]["string"].length;++i){
    textColor = "black";
    span = newElement("font", [["id", "text_"+i], ["color", textColor]]);
    text = document.createTextNode(ndtm[ndtmIndex]["input"][inputIndex]["string"][i]);
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

  Object.keys(ndtm[ndtmIndex]["transition"]["q0"]).forEach(function(keyName, keyIndex){
  	th = newElement("th", [["id", "tr0_th"+(keyIndex+1)]]);
  	th.appendChild(document.createTextNode(keyName));
  	tr0.appendChild(th);
  });

  Object.keys(ndtm[ndtmIndex]["transition"]).forEach(function(stateName, stateIndex){
  	tr = newElement("tr", [["id", "tr"+(stateIndex+1)]]);

  	trtd0 = newElement("td", [["id", "tr"+(stateIndex+1)+"_td0"]]);
  	trtd0.appendChild(document.createTextNode(stateName));
  	tr.appendChild(trtd0);

  	Object.keys(ndtm[ndtmIndex]["transition"][stateName]).forEach(function(keyName, keyIndex){
  	  trtd = newElement("td", [["id", "tr"+(stateIndex+1)+"_td"+(keyIndex+1)]]);
  	  trtd.appendChild(document.createTextNode(ndtm[ndtmIndex]["transition"][stateName][keyName]));
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
  changeNDTM = document.getElementById("change_ndtm");
  changeNDTM.addEventListener("click", function(e){
    clearElem(canvas);
    ndtmIndex = ndtmIndex + 1;
    if(ndtmIndex >= ndtm.length){
      ndtmIndex = 0;
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
    if(inputIndex >= ndtm[ndtmIndex]["input"].length){
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
    curr_path = "states";
    if(path_state == "rej"){
      curr_path = "reject_path";
    }
    if(stateIndex != ndtm[ndtmIndex]["input"][inputIndex][curr_path].length-1){
      stateIndex += 1;
      refreshInput();
      refreshCanvas();
    
      prevState = ndtm[ndtmIndex]["input"][inputIndex][curr_path][stateIndex-1];
      currState = ndtm[ndtmIndex]["input"][inputIndex][curr_path][stateIndex];
      str = "read: "+prevState[0][prevState[1]];
      str += ", write: "+currState[0][prevState[1]];
      if(prevState[1] > currState[1]){
        str += ", move left";
      }else{
        str += ", move right";
      }
      str += ", new state: "+currState[2];
      addToStack(str);


      currState = ndtm[ndtmIndex]["input"][inputIndex][curr_path][stateIndex][0];
      currCell = currState[ndtm[ndtmIndex]["input"][inputIndex][curr_path][stateIndex][1]];
      if(stateIndex == ndtm[ndtmIndex]["input"][inputIndex][curr_path].length-1){
        if(currCell == "S"){
          swal("Input string was accepted");
        }else{
          swal("Input string was rejected");
        }
      }
    }
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

  // Event linstener for switch
  path_switch = document.getElementById("path_switch");
  path_switch.addEventListener("change", function(e){
    if(path_state == "acc"){
      path_state = "rej";
    }else{
      path_state = "acc";
    }
    stateIndex = 0;
    refreshInput();
    refreshCanvas();
    resetStack();
  });

});
