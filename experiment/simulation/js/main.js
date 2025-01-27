/*****
 * File containing main logic to display NDTM
 *
 */

width = 500;
height = 200;
radius = 25;

ndtm = [ndtm1, ndtm2];
ndtmIndex = 0;

stateIndex = 0;
inputIndex = 0;
inputPointer = -1;

path_state = "acc";

function refreshCanvas() {
  clearElem(canvas);
  clearElem(canvas2);

  let curr = "";
  if (inputPointer !== -1) {
    curr = ndtm[ndtmIndex]["input"][inputIndex]["states"][inputPointer];
  }

  const NDTMDescriptionContainer = document.getElementById(
    "NDTM_description_container"
  );
  clearElem(NDTMDescriptionContainer);

  const span = newElement("span", [
    ["id", "NDTM_description"],
    ["style", "color: brown; font-size: 2 rem;"],
  ]);
  const text = document.createTextNode(ndtm[ndtmIndex]["description"]);
  span.appendChild(text);
  NDTMDescriptionContainer.appendChild(span);

  displayCanvas(
    canvas,
    canvas2,
    ndtm[ndtmIndex],
    inputIndex,
    stateIndex,
    path_state
  );
}

function resetInput() {
  inputIndex = 0;
  stateIndex = 0;
  inputPointer = -1;

  refreshInput();
}

function refreshInput() {
  const inputContainer = document.getElementById("input_container");
  clearElem(inputContainer);

  const inputString = ndtm[ndtmIndex]["input"][inputIndex]["string"];

  for (let i = 0; i < inputString.length; i++) {
    const textColor = inputPointer === i ? "red" : "black";

    const span = newElement("span", [
      ["id", "text_" + i],
      ["style", `color: ${textColor}; font-size: 2.5 rem;`], // Restored input font size
    ]);

    const text = document.createTextNode(inputString[i]);
    span.appendChild(text);

    inputContainer.appendChild(span);
  }
}

function resetStack() {
  const stack = document.getElementById("stack_list");
  clearElem(stack);
}

function addToStack(str) {
  const stack = document.getElementById("stack_list");
  const listElem = newElement("li", []);
  const textNode = document.createTextNode(str);
  listElem.appendChild(textNode);
  stack.appendChild(listElem);
}

function removeFromStack() {
  const stack = document.getElementById("stack_list");
  if (stack.firstChild) {
    stack.removeChild(stack.lastChild);
  }
}

function updateTransitions() {
  const transitionTable = document.getElementById("transition_table_container");
  clearElem(transitionTable);

  const table = newElement("table", [["id", "transition_table"]]);

  const tr0 = newElement("tr", [["id", "tr0"]]);

  const tr0th0 = newElement("th", [["id", "tr0_th0"]]);
  tr0th0.appendChild(document.createTextNode("State"));
  tr0.appendChild(tr0th0);
  table.appendChild(tr0);

  Object.keys(ndtm[ndtmIndex]["transition"]["q0"]).forEach(function (
    keyName,
    keyIndex
  ) {
    const th = newElement("th", [["id", "tr0_th" + (keyIndex + 1)]]);
    th.appendChild(document.createTextNode(keyName));
    tr0.appendChild(th);
  });

  Object.keys(ndtm[ndtmIndex]["transition"]).forEach(function (
    stateName,
    stateIndex
  ) {
    const tr = newElement("tr", [["id", "tr" + (stateIndex + 1)]]);

    const trtd0 = newElement("td", [["id", "tr" + (stateIndex + 1) + "_td0"]]);
    trtd0.appendChild(document.createTextNode(stateName));
    tr.appendChild(trtd0);

    Object.keys(ndtm[ndtmIndex]["transition"][stateName]).forEach(function (
      keyName,
      keyIndex
    ) {
      const trtd = newElement("td", [
        ["id", "tr" + (stateIndex + 1) + "_td" + (keyIndex + 1)],
      ]);
      trtd.appendChild(
        document.createTextNode(ndtm[ndtmIndex]["transition"][stateName][keyName])
      );
      tr.appendChild(trtd);
    });
    table.appendChild(tr);
  });

  transitionTable.appendChild(table);
}

window.addEventListener("load", function () {
  canvas = document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2");

  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();

  // Change NDTM
  const changeNDTM = document.getElementById("change_ndtm");
  changeNDTM.addEventListener("click", function () {
    clearElem(canvas);
    ndtmIndex = (ndtmIndex + 1) % ndtm.length;
    resetInput();
    refreshCanvas();
    resetStack();
    updateTransitions();
  });

  // Change Input
  const changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function () {
    inputIndex = (inputIndex + 1) % ndtm[ndtmIndex]["input"].length;
    stateIndex = 0;
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
    resetStack();
  });

  // Next Step
  const next = document.getElementById("next");
  next.addEventListener("click", function () {
    const currPath = path_state === "rej" ? "reject_path" : "states";
    if (
      stateIndex <
      ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1
    ) {
      stateIndex++;
      inputPointer = stateIndex; // Update pointer
      refreshInput();
      refreshCanvas();

      const prevState =
        ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex - 1];
      const currState =
        ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex];

      let str = `read: ${prevState[0][prevState[1]]}, write: ${currState[0][prevState[1]]}`;
      str += prevState[1] > currState[1] ? ", move left" : ", move right";
      str += `, new state: ${currState[2]}`;
      addToStack(str);

      const currCell =
        currState[ndtm[ndtmIndex]["input"][inputIndex][currPath][stateIndex][1]];
      if (
        stateIndex ===
        ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1
      ) {
        swal(currCell === "S" ? "Input string was accepted" : "Input string was rejected");
      }
    }
  });

  // Previous Step
  const prev = document.getElementById("prev");
  prev.addEventListener("click", function () {
    if (stateIndex > 0) {
      stateIndex--;
      inputPointer = stateIndex; // Update pointer
      refreshInput();
      refreshCanvas();
      removeFromStack();
    }
  });

  // Switch Path
  const pathSwitch = document.getElementById("path_switch");
  pathSwitch.addEventListener("change", function () {
    path_state = path_state === "acc" ? "rej" : "acc";
    stateIndex = 0;
    inputPointer = -1;
    refreshInput();
    refreshCanvas();
    resetStack();
  });
});
