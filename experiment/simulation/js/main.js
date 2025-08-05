/*****
 * File containing main logic to display NDTM simulation
 *
 */

// Global variables for canvas dimensions
width = 500;
height = 200;
radius = 25;

// Initialize NDTM state
ndtm = [ndtm1, ndtm2];
ndtmIndex = 0;

// Parallel path states
leftStateIndex = 0;
rightStateIndex = 0;
leftInputPointer = -1;
rightInputPointer = -1;
inputIndex = 0;

currentTurn = "left"; // Which path the user is currently controlling

/**
 * Refreshes both canvas visualizations
 */
function refreshCanvas() {
  // Left canvas (accepting path)
  const canvas1Left = document.getElementById("canvas1_left");
  const canvas2Left = document.getElementById("canvas2_left");
  clearElem(canvas1Left);
  clearElem(canvas2Left);

  // Right canvas (rejecting path)
  const canvas1Right = document.getElementById("canvas1_right");
  const canvas2Right = document.getElementById("canvas2_right");
  clearElem(canvas1Right);
  clearElem(canvas2Right);

  // Display left path (accepting)
  let leftCurr = "";
  if (leftInputPointer !== -1) {
    leftCurr = ndtm[ndtmIndex]["input"][inputIndex]["states"][leftInputPointer];
  }

  // Display right path (rejecting)
  let rightCurr = "";
  if (rightInputPointer !== -1) {
    rightCurr = ndtm[ndtmIndex]["input"][inputIndex]["reject_path"][rightInputPointer];
  }

  // Update NDTM description
  const NDTMDescriptionContainer = document.getElementById("NDTM_description_container");
  clearElem(NDTMDescriptionContainer);

  const span = newElement("span", [
    ["id", "NDTM_description"],
    ["class", "description-text"],
  ]);
  const text = document.createTextNode(ndtm[ndtmIndex]["description"]);
  span.appendChild(text);
  NDTMDescriptionContainer.appendChild(span);

  // Display left canvas
  displayCanvas(
    canvas1Left,
    canvas2Left,
    ndtm[ndtmIndex],
    inputIndex,
    leftStateIndex,
    "acc"
  );

  // Display right canvas
  displayCanvas(
    canvas1Right,
    canvas2Right,
    ndtm[ndtmIndex],
    inputIndex,
    rightStateIndex,
    "rej"
  );

  // Update current turn indicator
  updateTurnIndicator();
}

/**
 * Resets the input to the beginning
 */
function resetInput() {
  inputIndex = 0;
  stateIndex = 0;
  inputPointer = -1;

  refreshInput();
}

/**
 * Refreshes both input displays
 */
function refreshInput() {
  // Shared input display
  const inputContainerShared = document.getElementById("input_container_shared");
  if (inputContainerShared) {
    clearElem(inputContainerShared);
    
    const inputDiv = newElement("div", [["class", "input-string"]]);
    // Fix: use "string" property instead of "input"
    const inputText = document.createTextNode(ndtm[ndtmIndex]["input"][inputIndex]["string"]);
    inputDiv.appendChild(inputText);
    inputContainerShared.appendChild(inputDiv);
  }

  // Left input display (accepting path)
  const inputContainerLeft = document.getElementById("input_container_left");
  if (inputContainerLeft) {
    clearElem(inputContainerLeft);
    
    if (leftInputPointer !== -1 && typeof displayInput === 'function') {
      displayInput(inputContainerLeft, ndtm[ndtmIndex], inputIndex, leftStateIndex, "acc");
    } else {
      const inputString = ndtm[ndtmIndex]["input"][inputIndex]["string"];
      for (let i = 0; i < inputString.length; i++) {
        const span = newElement("span", [
          ["id", "text_left_" + i],
          ["class", "input-char"],
        ]);
        const text = document.createTextNode(inputString[i]);
        span.appendChild(text);
        inputContainerLeft.appendChild(span);
      }
    }
  }

  // Right input display (rejecting path)
  const inputContainerRight = document.getElementById("input_container_right");
  if (inputContainerRight) {
    clearElem(inputContainerRight);
    
    if (rightInputPointer !== -1 && typeof displayInput === 'function') {
      displayInput(inputContainerRight, ndtm[ndtmIndex], inputIndex, rightStateIndex, "rej");
    } else {
      const inputString = ndtm[ndtmIndex]["input"][inputIndex]["string"];
      for (let i = 0; i < inputString.length; i++) {
        const span = newElement("span", [
          ["id", "text_right_" + i],
          ["class", "input-char"],
        ]);
        const text = document.createTextNode(inputString[i]);
        span.appendChild(text);
        inputContainerRight.appendChild(span);
      }
    }
  }
}

/**
 * Updates the turn indicator
 */
function updateTurnIndicator() {
  const leftSimType = document.getElementById("simulation_type_left");
  const rightSimType = document.getElementById("simulation_type_right");
  const leftColumn = leftSimType?.closest('.simulation-column');
  const rightColumn = rightSimType?.closest('.simulation-column');
  
  if (leftSimType && rightSimType && leftColumn && rightColumn) {
    // Remove active class from both simulation types and columns
    leftSimType.classList.remove("active-simulation");
    rightSimType.classList.remove("active-simulation");
    leftColumn.classList.remove("active-path");
    rightColumn.classList.remove("active-path");
    
    if (currentTurn === "left") {
      leftSimType.classList.add("active-simulation");
      leftColumn.classList.add("active-path");
    } else {
      rightSimType.classList.add("active-simulation");
      rightColumn.classList.add("active-path");
    }
  }
  
  // Update manual controls for the current path
  updateManualControls();
  
  // Update easy mode transitions if applicable
  if (typeof updateTransitionTableForEasyMode === 'function') {
    updateTransitionTableForEasyMode();
  }
}

/**
 * Resets the steps list
 */
function resetStack() {
  const leftStack = document.getElementById("stack_list_left");
  const rightStack = document.getElementById("stack_list_right");
  if (leftStack) clearElem(leftStack);
  if (rightStack) clearElem(rightStack);
}

/**
 * Adds a step description to the appropriate steps list
 */
function addToStack(str, side = null) {
  const targetSide = side || currentTurn;
  const stackId = targetSide === "left" ? "stack_list_left" : "stack_list_right";
  const stack = document.getElementById(stackId);
  
  if (stack) {
    const listElem = newElement("li", []);
    const textNode = document.createTextNode(str);
    listElem.appendChild(textNode);
    stack.prepend(listElem); // Add to top instead of bottom
    
    // Auto-scroll to top of the steps list
    stack.scrollTop = 0;
  }
}

/**
 * Removes the last step from the appropriate steps list
 */
function removeFromStack(side = null) {
  const targetSide = side || currentTurn;
  const stackId = targetSide === "left" ? "stack_list_left" : "stack_list_right";
  const stack = document.getElementById(stackId);
  
  if (stack && stack.firstChild) {
    stack.removeChild(stack.lastChild);
  }
}

/**
 * Updates the transition table display
 */
function updateTransitions() {
  const transitionTable = document.getElementById("transition_table_container");
  clearElem(transitionTable);

  const table = newElement("table", [["id", "transition_table"]]);

  const tr0 = newElement("tr", [["id", "tr0"]]);

  const tr0th0 = newElement("th", [["id", "tr0_th0"]]);
  tr0th0.appendChild(document.createTextNode("State"));
  tr0.appendChild(tr0th0);
  table.appendChild(tr0);

  // Add column headers for each input symbol
  Object.keys(ndtm[ndtmIndex]["transition"]["q0"]).forEach(function (
    keyName,
    keyIndex
  ) {
    const th = newElement("th", [["id", "tr0_th" + (keyIndex + 1)]]);
    th.appendChild(document.createTextNode(keyName));
    tr0.appendChild(th);
  });

  // Add rows for each state
  Object.keys(ndtm[ndtmIndex]["transition"]).forEach(function (
    stateName,
    stateIndex
  ) {
    const tr = newElement("tr", [["id", "tr" + (stateIndex + 1)]]);

    const trtd0 = newElement("td", [["id", "tr" + (stateIndex + 1) + "_td0"]]);
    trtd0.appendChild(document.createTextNode(stateName));
    tr.appendChild(trtd0);

    // Add transition cells for each input symbol
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

// Initialize the simulation when the page loads
window.addEventListener("load", function () {
  // Initialize canvases - use fallback if elements don't exist
  canvas = document.getElementById("canvas1_left") || document.getElementById("canvas1");
  canvas2 = document.getElementById("canvas2_left") || document.getElementById("canvas2");

  refreshInput();
  refreshCanvas();
  resetStack();
  updateTransitions();

  // Change NDTM button handler
  const changeNDTM = document.getElementById("change_ndtm");
  changeNDTM.addEventListener("click", function () {
    ndtmIndex = (ndtmIndex + 1) % ndtm.length;
    resetInput();
    refreshCanvas();
    resetStack();
    updateTransitions();
  });

  function resetInput() {
    inputIndex = 0;
    leftStateIndex = 0;
    rightStateIndex = 0;
    leftInputPointer = -1;
    rightInputPointer = -1;
    currentTurn = "left";
    refreshInput();
    updateTurnIndicator();
  }

  // Change Input button handler
  const changeInput = document.getElementById("change_input");
  changeInput.addEventListener("click", function () {
    inputIndex = (inputIndex + 1) % ndtm[ndtmIndex]["input"].length;
    leftStateIndex = 0;
    rightStateIndex = 0;
    leftInputPointer = -1;
    rightInputPointer = -1;
    currentTurn = "left";
    refreshInput();
    refreshCanvas();
    resetStack();
  });

  // Previous Step button handler
  const prev = document.getElementById("prev");
  prev.addEventListener("click", function () {
    if (currentTurn === "left" && leftStateIndex > 0) {
      leftStateIndex--;
      leftInputPointer = leftStateIndex;
      removeFromStack("left");
    } else if (currentTurn === "right" && rightStateIndex > 0) {
      rightStateIndex--;
      rightInputPointer = rightStateIndex;
      removeFromStack("right");
    } else {
      swal({
        title: "Cannot Go Back",
        text: `No previous steps available for the ${currentTurn === "left" ? "accepting" : "rejecting"} path.`,
        icon: "warning",
        button: "OK",
      });
      return;
    }
    
    refreshInput();
    refreshCanvas();
    
    // Switch turn after making a move (going backwards)
    currentTurn = currentTurn === "left" ? "right" : "left";
    updateTurnIndicator();
  });

  // Show Hint button handler
  const showHint = document.getElementById("show_hint");
  if (showHint) {
    showHint.addEventListener("click", function () {
      showHintForCurrentPath();
    });
  }

  // Apply Best Move button handler
  const applyBestMove = document.getElementById("apply_best_move");
  if (applyBestMove) {
    applyBestMove.addEventListener("click", function () {
      applyBestMoveForCurrentPath();
    });
  }

  // Manual move button handler
  const applyManualMoveButton = document.getElementById("apply_manual_move");
  if (applyManualMoveButton) {
    applyManualMoveButton.addEventListener("click", function () {
      applyManualMove();
    });
  }

  // Initialize manual controls
  updateManualControls();
});

/**
 * Applies the best move automatically for the current path
 */
function applyBestMoveForCurrentPath() {
  if (currentTurn === "left") {
    const currPath = "states";
    
    if (leftStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Path Complete",
        text: "The accepting path has reached its final state.",
        icon: "info",
        button: "OK",
      });
      return;
    }
    
    // Initialize input pointer if this is the first move
    if (leftInputPointer === -1) {
      leftInputPointer = 0;
    }
    
    // Apply the next step automatically for left path only
    leftStateIndex++;
    leftInputPointer = leftStateIndex;
    
    // Add step to the trace for left path only
    const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex - 1];
    const currState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex];
    
    let str = `State: ${prevState[2]} → ${currState[2]}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
    
    if (prevState[1] > currState[1]) {
      str += "Move Left";
    } else if (prevState[1] < currState[1]) {
      str += "Move Right";
    } else {
      str += "Stay";
    }
    
    addToStack(str, "left");
    
    // Check if we've reached the end of left path
    if (leftStateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Accepting Path Complete!",
        text: "The accepting path has reached its final state.",
        icon: "success",
        button: "OK",
      });
    }
  } else {
    const currPath = "reject_path";
    
    if (rightStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Path Complete",
        text: "The rejecting path has reached its final state.",
        icon: "info",
        button: "OK",
      });
      return;
    }
    
    // Initialize input pointer if this is the first move
    if (rightInputPointer === -1) {
      rightInputPointer = 0;
    }
    
    // Apply the next step automatically for right path only
    rightStateIndex++;
    rightInputPointer = rightStateIndex;
    
    // Add step to the trace for right path only
    const prevState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex - 1];
    const currState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex];
    
    let str = `State: ${prevState[2]} → ${currState[2]}, `;
    str += `Read: "${prevState[0][prevState[1]]}", Write: "${currState[0][prevState[1]]}", `;
    
    if (prevState[1] > currState[1]) {
      str += "Move Left";
    } else if (prevState[1] < currState[1]) {
      str += "Move Right";
    } else {
      str += "Stay";
    }
    
    addToStack(str, "right");
    
    // Check if we've reached the end of right path
    if (rightStateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Rejecting Path Complete!",
        text: "The rejecting path has reached its final state.",
        icon: "error",
        button: "OK",
      });
    }
  }
  
  // Refresh displays
  refreshInput();
  refreshCanvas();
  
  // Check if both paths are complete
  const leftComplete = leftStateIndex >= ndtm[ndtmIndex]["input"][inputIndex]["states"].length - 1;
  const rightComplete = rightStateIndex >= ndtm[ndtmIndex]["input"][inputIndex]["reject_path"].length - 1;
  
  if (leftComplete && rightComplete) {
    // Both paths are complete - show final message
    swal({
      title: "Simulation Complete!",
      text: "Both accepting and rejecting paths have reached their final states.",
      icon: "success",
      button: "OK",
    });
    return; // Don't switch turns
  }
  
  // Only switch turn if the other path is not complete
  if (currentTurn === "left" && !rightComplete) {
    currentTurn = "right";
  } else if (currentTurn === "right" && !leftComplete) {
    currentTurn = "left";
  }
  // If the other path is complete, stay on current path
  
  updateTurnIndicator();
}

/**
 * Updates the manual control dropdowns based on current state
 */
function updateManualControls() {
  const stateSelect = document.getElementById("state_select");
  const writeSelect = document.getElementById("write_select");
  
  if (!stateSelect || !writeSelect) return;
  
  // Clear existing options
  stateSelect.innerHTML = '<option value="">Select State</option>';
  writeSelect.innerHTML = '<option value="">Select Symbol</option>';
  
  let currentStateId = "";
  let currentSymbol = "";
  
  if (currentTurn === "left") {
    const currPath = "states";
    if (leftStateIndex < ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex];
      currentStateId = currentState[2];
      currentSymbol = currentState[0][currentState[1]];
    }
  } else {
    const currPath = "reject_path";
    if (rightStateIndex < ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex];
      currentStateId = currentState[2];
      currentSymbol = currentState[0][currentState[1]];
    }
  }
  
  // Populate dropdowns based on transition table
  if (currentStateId && currentSymbol) {
    const transitionTable = ndtm[ndtmIndex]["transition"];
    
    if (transitionTable[currentStateId] && transitionTable[currentStateId][currentSymbol]) {
      const transitions = transitionTable[currentStateId][currentSymbol];
      
      // Parse transitions to get all possible states and symbols
      const availableStates = new Set();
      const availableSymbols = new Set();
      
      transitions.forEach(transition => {
        if (transition !== "e" && transition.includes(",")) {
          // Parse transition format: "(state,symbol,direction)"
          const match = transition.match(/\(([^,]+),([^,]+),([^)]+)\)/);
          if (match) {
            availableStates.add(match[1].trim());
            availableSymbols.add(match[2].trim());
          }
        }
      });
      
      // Add all available states from the NDTM (not just from transitions)
      Object.keys(transitionTable).forEach(state => {
        availableStates.add(state);
      });
      
      // Add common symbols
      ['0', '1', 'X', 'Y', 'S'].forEach(symbol => {
        availableSymbols.add(symbol);
      });
      
      // Populate state dropdown
      Array.from(availableStates).sort().forEach(state => {
        const option = newElement("option", [["value", state]]);
        option.textContent = state;
        stateSelect.appendChild(option);
      });
      
      // Populate symbol dropdown
      Array.from(availableSymbols).sort().forEach(symbol => {
        const option = newElement("option", [["value", symbol]]);
        option.textContent = symbol;
        writeSelect.appendChild(option);
      });
    }
  }
}

/**
 * Applies a manual move based on user selection
 */
function applyManualMove() {
  let selectedState, selectedWrite, selectedMove;
  
  // Check if this is called from easy mode with pre-set values
  if (window.selectedState && window.selectedSymbol && window.selectedDirection) {
    selectedState = window.selectedState;
    selectedWrite = window.selectedSymbol;
    selectedMove = window.selectedDirection;
    
    // Clear the temporary values
    window.selectedState = null;
    window.selectedSymbol = null;
    window.selectedDirection = null;
  } else {
    // Get from dropdown selections (hard mode)
    const stateSelect = document.getElementById("state_select");
    const writeSelect = document.getElementById("write_select");
    const moveSelect = document.getElementById("move_select");
    
    selectedState = stateSelect.value;
    selectedWrite = writeSelect.value;
    selectedMove = moveSelect.value;
  }
  
  if (!selectedState || !selectedWrite || !selectedMove) {
    swal({
      title: "Incomplete Selection",
      text: "Please select state, write symbol, and move direction.",
      icon: "warning",
      button: "OK",
    });
    return;
  }
  
  // Apply the move for the current path
  if (currentTurn === "left") {
    const currPath = "states";
    if (leftStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Path Complete",
        text: "The accepting path has already reached its final state.",
        icon: "info",
        button: "OK",
      });
      return;
    }
    
    // Get expected values
    const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex];
    const nextState = ndtm[ndtmIndex]["input"][inputIndex][currPath][leftStateIndex + 1];
    const expectedState = nextState[2];
    const expectedWrite = nextState[0][currentState[1]];
    
    let expectedMove = "S";
    const currentPos = currentState[1];
    const nextPos = nextState[1];
    if (currentPos > nextPos) expectedMove = "L";
    else if (currentPos < nextPos) expectedMove = "R";
    
    // Check if selection is correct
    if (selectedState === expectedState && selectedWrite === expectedWrite && selectedMove === expectedMove) {
      // Initialize input pointer if this is the first move
      if (leftInputPointer === -1) {
        leftInputPointer = 0;
      }
      
      // Only advance if correct
      leftStateIndex++;
      leftInputPointer = leftStateIndex;
      
      const str = `State: ${currentState[2]} → ${selectedState}, Write: "${selectedWrite}", Move: ${selectedMove === "L" ? "Left" : selectedMove === "R" ? "Right" : "Stay"}`;
      addToStack(str, "left");
      
      // Check if complete
      if (leftStateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
        swal({
          title: "Accepting Path Complete!",
          text: "The accepting path has reached its final state.",
          icon: "success",
          button: "OK",
        });
      }
    } else {
      // Don't advance tape for incorrect moves and don't add to stack
      
      // Show hint popup for incorrect move
      swal({
        title: "Incorrect Move!",
        text: `Hint: Check the transition table for the current state and tape symbol. Look for what state, write symbol, and direction should come next.`,
        icon: "warning",
        button: "Try Again",
      });
      
      // Reset selections for retry
      stateSelect.value = "";
      writeSelect.value = "";
      moveSelect.value = "";
      return; // Don't switch turns or update display for incorrect moves
    }
  } else {
    const currPath = "reject_path";
    if (rightStateIndex >= ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
      swal({
        title: "Path Complete",
        text: "The rejecting path has already reached its final state.",
        icon: "info",
        button: "OK",
      });
      return;
    }
    
    // Get expected values
    const currentState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex];
    const nextState = ndtm[ndtmIndex]["input"][inputIndex][currPath][rightStateIndex + 1];
    const expectedState = nextState[2];
    const expectedWrite = nextState[0][currentState[1]];
    
    let expectedMove = "S";
    const currentPos = currentState[1];
    const nextPos = nextState[1];
    if (currentPos > nextPos) expectedMove = "L";
    else if (currentPos < nextPos) expectedMove = "R";
    
    // Check if selection is correct
    if (selectedState === expectedState && selectedWrite === expectedWrite && selectedMove === expectedMove) {
      // Initialize input pointer if this is the first move
      if (rightInputPointer === -1) {
        rightInputPointer = 0;
      }
      
      // Only advance if correct
      rightStateIndex++;
      rightInputPointer = rightStateIndex;
      
      const str = `State: ${currentState[2]} → ${selectedState}, Write: "${selectedWrite}", Move: ${selectedMove === "L" ? "Left" : selectedMove === "R" ? "Right" : "Stay"}`;
      addToStack(str, "right");
      
      // Check if complete
      if (rightStateIndex === ndtm[ndtmIndex]["input"][inputIndex][currPath].length - 1) {
        swal({
          title: "Rejecting Path Complete!",
          text: "The rejecting path has reached its final state.",
          icon: "error",
          button: "OK",
        });
      }
    } else {
      // Don't advance tape for incorrect moves and don't add to stack
      
      // Show hint popup for incorrect move
      swal({
        title: "Incorrect Move!",
        text: `Hint: Check the transition table for the current state and tape symbol. Look for what state, write symbol, and direction should come next.`,
        icon: "warning",
        button: "Try Again",
      });
      
      // Reset selections for retry
      stateSelect.value = "";
      writeSelect.value = "";
      moveSelect.value = "";
      return; // Don't switch turns or update display for incorrect moves
    }
  }
  
  // Only refresh and switch turns if move was correct
  refreshInput();
  refreshCanvas();
  
  // Check if both paths are complete
  const leftComplete = leftStateIndex >= ndtm[ndtmIndex]["input"][inputIndex]["states"].length - 1;
  const rightComplete = rightStateIndex >= ndtm[ndtmIndex]["input"][inputIndex]["reject_path"].length - 1;
  
  if (leftComplete && rightComplete) {
    // Both paths are complete - show final message
    swal({
      title: "Simulation Complete!",
      text: "Both accepting and rejecting paths have reached their final states.",
      icon: "success",
      button: "OK",
    });
  } else {
    // Only switch turn if the other path is not complete
    if (currentTurn === "left" && !rightComplete) {
      currentTurn = "right";
    } else if (currentTurn === "right" && !leftComplete) {
      currentTurn = "left";
    }
    // If the other path is complete, stay on current path
    
    updateTurnIndicator();
  }
  
  // Reset selections
  stateSelect.value = "";
  writeSelect.value = "";
  moveSelect.value = "";
}
