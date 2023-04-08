/****
 * File containing helper functions
 *
 */

function newElementNS(tag, attr){
 elem = document.createElementNS('http://www.w3.org/2000/svg', tag);
 attr.forEach(function(item){
   elem.setAttribute(item[0], item[1]);
 });
 return elem;
}

function newElement(tag, attr){
 elem = document.createElement(tag);
 attr.forEach(function(item){
   elem.setAttribute(item[0], item[1]);
 });
 return elem;
}

function clearElem(elem){
  while(elem.firstChild){
    elem.removeChild(elem.lastChild);
  }
}

// Global variables width, height and radius need to be set before invoking this function
function displayCanvas(canvas, canvas2, dtm, inputIndex, stateIndex){
  fillColor = "#ffe4c4";
  color = "black";
  stroke_width = "3px";


  str = dtm["input"][inputIndex]["states"][stateIndex][0];
  start_x = 10;
  start_y = 10;
  cell_width = 60;
  cell_height = 60;
  
  for(cell_itr=0;cell_itr<str.length;++cell_itr){
    if(cell_itr == dtm["input"][inputIndex]["states"][stateIndex][1]){
      fillColor = "#adff2f";
    }else{
      fillColor = "#ffe4c4";
    }
    cell = newElementNS('rect', [
      ["id", "state_rect"],
      ["x", start_x+(cell_itr*cell_width)],
      ["y", start_y],
      ["width", cell_width],
      ["height", cell_height],
      ["rx", "10"],
      ["stroke", color],
      ["fill", fillColor],
      ["stroke-width", stroke_width]
    ]);
    canvas1.appendChild(cell);

    cellText = newElementNS('text', [
      ["id", "cell_text_"+cell_itr],
      ['x', start_x+(cell_itr*cell_width)+cell_width/2],
      ['y', start_y+cell_height/2],
      ['fill', '#000']
    ]);
    cellText.textContent = dtm["input"][inputIndex]["states"][stateIndex][0][cell_itr];
    canvas1.appendChild(cellText);
  }
  
  state = newElementNS('rect', [
      ["id", "state_rect"],
      ["x", "10"],
      ["y", "10"],
      ["width", cell_width],
      ["height", cell_height],
      ["rx", "10"],
      ["stroke", color],
      ["fill", "#ffe4c4"],
      ["stroke-width", stroke_width]
  ]);
  textElem = newElementNS('text', [
      ["id", "state_text"],
      ['x', cell_width/2],
      ['y', start_y+cell_height/2],
      ['fill', '#000']
  ]);
  textElem.textContent = dtm["input"][inputIndex]["states"][stateIndex][2];
  canvas2.appendChild(state);
  canvas2.appendChild(textElem);
}
