/* visualizer.js
   Lightweight, self-contained tutorial visualization.
   Creates a modal on demand and animates a simple FSM + tape edits.
*/
(function(){
  const SAMPLE = {
    tape: ['a','b','a','b',''],
    head: 0,
    states: [
      {id:'q0', label:'q0'},
      {id:'q1', label:'q1'},
      {id:'q2', label:'q2'},
      {id:'qh', label:'Halt'}
    ],
    transitions: [
      {from:'q0',to:'q1',read:'a',write:'x',move:'R'},
      {from:'q1',to:'q1',read:'b',write:'b',move:'R'},
      {from:'q1',to:'q1',read:'a',write:'a',move:'R'},
      // when q1 sees blank, go to q2 and stay
      {from:'q1',to:'q2',read:'',write:'',move:'S'},
      {from:'q2',to:'qh',read:'',write:'',move:'S'}
    ],
    // Steps include explicit 'from' and 'to' so we can highlight transitions correctly
    steps:[
      {from:'q0',to:'q1',read:'a',write:'x',move:'R'},
      {from:'q1',to:'q1',read:'b',write:'b',move:'R'},
      {from:'q1',to:'q1',read:'a',write:'a',move:'R'},
      {from:'q1',to:'q1',read:'b',write:'b',move:'R'},
      {from:'q1',to:'q2',read:'',write:'',move:'S'},
      {from:'q2',to:'qh',read:'',write:'',move:'S'}
    ]
  };

  const BLANK_SYMBOL = '□';

  let modalEl = null;
  let animInterval = null;
  let currentStep = 0;
  let isPlaying = false;
  let loopMode = false;
  let playBtnEl = null;
  let stepBtnEl = null;
  let stopBtnEl = null;
  let resetBtnEl = null;
  let loopCheckboxEl = null;
  const INITIAL = JSON.parse(JSON.stringify(SAMPLE));

  function createModal(){
    if(modalEl) return modalEl;
    const overlay = document.createElement('div');
    overlay.className = 'viz-overlay';
    overlay.id = 'visualizer_modal';

    const modal = document.createElement('div');
    modal.className = 'viz-modal';

    const top = document.createElement('div');
    top.className = 'viz-top';

    const header = document.createElement('div');
    header.className = 'viz-header';
    const title = document.createElement('div');
    title.className = 'viz-title';
    title.textContent = 'Visual Tutorial';
    const desc = document.createElement('div');
    desc.className = 'viz-description';
    desc.textContent = 'Animated demo: state changes and tape edits';
    header.appendChild(title);
    header.appendChild(desc);
    modal.appendChild(header);

    // descriptive text area (static intro + dynamic status)
    const descArea = document.createElement('div');
    descArea.id = 'viz_description_area';
    descArea.style.padding = '8px 6px';
    descArea.style.background = 'linear-gradient(90deg, rgba(243,244,246,0.6), rgba(255,255,255,0.6))';
    descArea.style.borderRadius = '8px';
    descArea.style.border = '1px solid rgba(0,0,0,0.04)';
    descArea.style.fontSize = '0.92rem';
    descArea.style.color = '#374151';
    descArea.innerHTML = `
      <div style="font-weight:600;color:#111827;margin-bottom:6px">What this tutorial shows</div>
      <div id="viz_intro">This tutorial demonstrates one complete derivation of a simple Turing-machine-like process: it marks the first 'a' as 'x', scans right across symbols, then performs finishing moves and halts. Use <strong>Play</strong> to run, <strong>Step</strong> to advance one move, and <strong>Reset</strong> to restart.</div>
      <div id="viz_status" style="margin-top:8px;color:#111827;font-weight:500"></div>
    `;
    modal.appendChild(descArea);

    const fsmWrap = document.createElement('div');
    fsmWrap.className = 'viz-fsm';
    const fsmLabel = document.createElement('div');
    fsmLabel.className = 'viz-label';
    fsmLabel.textContent = 'State Machine';
    const SVG_H = 320;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width','100%');
    svg.setAttribute('height', String(SVG_H));
    svg.setAttribute('viewBox', `0 0 900 ${SVG_H}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.id = 'visual_fsm';
    fsmWrap.appendChild(fsmLabel);
    fsmWrap.appendChild(svg);

    const tapeWrap = document.createElement('div');
    tapeWrap.className = 'viz-tape';
    const tapeLabel = document.createElement('div');
    tapeLabel.className = 'viz-label';
    tapeLabel.textContent = 'Tape';
    tapeWrap.appendChild(tapeLabel);
    tapeWrap.innerHTML += '<div class="tape-row" id="visual_tape"></div>';

    top.appendChild(fsmWrap);
    top.appendChild(tapeWrap);

    const controls = document.createElement('div');
    controls.className = 'viz-controls';
    playBtnEl = document.createElement('button'); playBtnEl.textContent='Play'; playBtnEl.className='button blue'; playBtnEl.setAttribute('aria-label','Play tutorial');
    stepBtnEl = document.createElement('button'); stepBtnEl.textContent='Step'; stepBtnEl.className='button green'; stepBtnEl.setAttribute('aria-label','Step one move');
    stopBtnEl = document.createElement('button'); stopBtnEl.textContent='Stop'; stopBtnEl.className='button purple'; stopBtnEl.setAttribute('aria-label','Stop tutorial');
    resetBtnEl = document.createElement('button'); resetBtnEl.textContent='Reset'; resetBtnEl.className='button'; resetBtnEl.setAttribute('aria-label','Reset tutorial');
    const loopLabel = document.createElement('label'); loopLabel.style.display='inline-flex'; loopLabel.style.alignItems='center'; loopLabel.style.gap='6px';
    loopCheckboxEl = document.createElement('input'); loopCheckboxEl.type='checkbox'; loopCheckboxEl.id='viz_loop_toggle';
    const loopText = document.createElement('span'); loopText.textContent='Loop'; loopText.style.fontSize='0.9rem'; loopText.style.color='#374151';
    loopLabel.appendChild(loopCheckboxEl); loopLabel.appendChild(loopText);
    const closeBtn = document.createElement('button'); closeBtn.innerHTML='✕'; closeBtn.className='viz-close'; closeBtn.setAttribute('aria-label','Close tutorial');

    controls.appendChild(playBtnEl);
    controls.appendChild(stepBtnEl);
    controls.appendChild(stopBtnEl);
    controls.appendChild(resetBtnEl);
    controls.appendChild(loopLabel);
    controls.appendChild(closeBtn);

    modal.appendChild(top);
    modal.appendChild(controls);
    overlay.appendChild(modal);

    // handlers
    playBtnEl.addEventListener('click', ()=>{
      if(isPlaying) return;
      isPlaying = true; updateButtons();
      stopAnimation();
      animInterval = setInterval(()=>{ stepAnimation(); }, 700);
    });
    stepBtnEl.addEventListener('click', ()=>{ if(!isPlaying) stepAnimation(); });
    stopBtnEl.addEventListener('click', ()=>{ stopAnimation(); isPlaying=false; updateButtons(); });
    resetBtnEl.addEventListener('click', ()=>{ resetVisualization(); });
    loopCheckboxEl.addEventListener('change', (e)=>{ loopMode = !!e.target.checked; });
    closeBtn.addEventListener('click', ()=>{ closeModal(); });

    // click outside to close
    overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });

    document.body.appendChild(overlay);
    modalEl = overlay;

    // initial render
    renderFSM(SAMPLE.states, SAMPLE.transitions, svg);
    renderTape(SAMPLE.tape, SAMPLE.head);
    // set initial status text if present
    const sElInit = document.getElementById('viz_status');
    if(sElInit) sElInit.textContent = 'Ready. The machine is in initial state. Press Play to begin.';

    return modalEl;
  }

  function openModal(){
    createModal();
    modalEl.style.display='flex';
    currentStep = 0;
    stopAnimation();
    renderTape(SAMPLE.tape, SAMPLE.head);
    highlightState(null);
  }

  function closeModal(){
    if(!modalEl) return;
    stopAnimation();
    modalEl.parentNode.removeChild(modalEl);
    modalEl = null;
  }

  function stopAnimation(){ if(animInterval){ clearInterval(animInterval); animInterval=null; } }

  function stepAnimation(){
    const step = SAMPLE.steps[currentStep];
    if(!step) return;
    const writeIndex = SAMPLE.head + (step.move==='L' ? 0 : (step.move==='R' ? 1 : 0));
    // check that the tape symbol matches the expected read (for correctness)
    const curSym = SAMPLE.tape[SAMPLE.head] === '' ? '' : SAMPLE.tape[SAMPLE.head];
    if(step.read !== curSym){
      const statusWarn = document.getElementById('viz_status');
      if(statusWarn) statusWarn.textContent = `Warning: expected '${step.read === '' ? BLANK_SYMBOL : step.read}' but tape has '${curSym === '' ? BLANK_SYMBOL : curSym}'. Proceeding.`;
    }
    // apply write (if any)
    if(step.write !== undefined && step.write !== null){
      SAMPLE.tape[SAMPLE.head] = step.write === '' ? '' : step.write;
    }
    // update head
    if(step.move === 'R') SAMPLE.head = Math.min(SAMPLE.tape.length-1, SAMPLE.head+1);
    else if(step.move === 'L') SAMPLE.head = Math.max(0, SAMPLE.head-1);

    // before updating head/tape, highlight the transition and both states
    highlightTransition(step.from, step.to);
    highlightStates(step.from, step.to);
    // update textual description for this step
    const status = document.getElementById('viz_status');
    if(status){
      const readSym = step.read === '' ? BLANK_SYMBOL : step.read;
      const writeSym = (step.write === '' || step.write === undefined) ? BLANK_SYMBOL : step.write;
      const moveText = step.move === 'L' ? 'left' : (step.move === 'R' ? 'right' : 'stay');
      status.textContent = `Step ${currentStep+1}: ${step.from} → ${step.to}: read '${readSym}', write '${writeSym}', move ${moveText}.`;
    }
    // apply visuals for tape and head after textual update
    renderTape(SAMPLE.tape, SAMPLE.head);
    currentStep++;
    if(currentStep>=SAMPLE.steps.length){
      // reached end
      stopAnimation();
      isPlaying = false;
      updateButtons();
      if(loopMode){
        setTimeout(()=>{ resetVisualization(); playBtnEl.click(); }, 600);
      } else {
        const statusEnd = document.getElementById('viz_status');
        if(statusEnd) statusEnd.textContent = 'Derivation complete — machine entered the Halt state.';
      }
    }
  }

  function resetVisualization(){
    const fresh = JSON.parse(JSON.stringify(INITIAL));
    SAMPLE.tape = fresh.tape;
    SAMPLE.head = fresh.head;
    SAMPLE.states = fresh.states;
    SAMPLE.transitions = fresh.transitions;
    SAMPLE.steps = fresh.steps;
    currentStep = 0;
    stopAnimation();
    isPlaying = false;
    renderTape(SAMPLE.tape, SAMPLE.head);
    highlightState(null);
    updateButtons();
    const status = document.getElementById('viz_status');
    if(status) status.textContent = 'Reset. Ready to run the demonstration again.';
  }

  function updateButtons(){
    if(!playBtnEl || !stepBtnEl || !stopBtnEl) return;
    playBtnEl.disabled = isPlaying;
    stepBtnEl.disabled = isPlaying;
    stopBtnEl.disabled = !isPlaying;
  }

  function renderTape(tape, head){
    const container = document.getElementById('visual_tape');
    if(!container) return;
    container.innerHTML = '';
    tape.forEach((sym,i)=>{
      const cell = document.createElement('div');
      cell.className = 'tape-cell' + (i===head? ' head' : '');
      const display = (sym === '' || sym === null || typeof sym === 'undefined') ? BLANK_SYMBOL : sym;
      cell.textContent = display;
      container.appendChild(cell);
    });
  }

  function renderFSM(states, transitions, svgEl){
    while(svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
    const ns = 'http://www.w3.org/2000/svg';
    // width is taken from viewBox 900, height from viewBox
    const w = 900;
    const h = parseInt(svgEl.getAttribute('viewBox').split(' ')[3],10) || 320;
    const cx = w/2, cy = h/2;
    const NODE_R = 26; // node circle radius
    // compute a layout radius that fits inside the viewBox accounting for node radius and padding
    const maxRadiusX = (w/2) - NODE_R - 40;
    const maxRadiusY = (h/2) - NODE_R - 40;
    const layoutR = Math.max(60, Math.min(maxRadiusX, maxRadiusY, 220));
    const n = states.length;
    states.forEach((s,i)=>{
      const theta = (2*Math.PI*i)/n;
      const x = cx + layoutR*Math.cos(theta);
      const y = cy + layoutR*Math.sin(theta);
      s._pos = {x,y};
    });

    // add defs for arrow marker
    const defs = document.createElementNS(ns,'defs');
    const marker = document.createElementNS(ns,'marker');
    marker.setAttribute('id','arrowhead');
    marker.setAttribute('markerWidth','10'); marker.setAttribute('markerHeight','7');
    marker.setAttribute('refX','10'); marker.setAttribute('refY','3.5');
    marker.setAttribute('orient','auto'); marker.setAttribute('markerUnits','strokeWidth');
    const pathm = document.createElementNS(ns,'path');
    pathm.setAttribute('d','M0,0 L10,3.5 L0,7 z'); pathm.setAttribute('fill','#333');
    marker.appendChild(pathm); defs.appendChild(marker); svgEl.appendChild(defs);

    // draw curved transition paths with labels/background
    transitions.forEach((t, idx)=>{
      const fromNode = states.find(s=>s.id===t.from);
      const toNode = states.find(s=>s.id===t.to);
      if(!fromNode || !toNode) return;
      const from = fromNode._pos;
      const to = toNode._pos;

      // handle self-loop specially (draw a visible loop near the node)
      if(t.from === t.to){
        const sx = from.x; const sy = from.y;
        const loopOffset = 48; // larger offset for clearer loop
        const nodeR = 26;
        // start a bit to the right of the node
        const startX = sx + nodeR; const startY = sy - (nodeR/2);
        // control points to form a circular loop to the right of node
        const c1x = sx + loopOffset; const c1y = sy - loopOffset;
        const c2x = sx + loopOffset; const c2y = sy + loopOffset;
        const endX = sx + nodeR; const endY = sy + (nodeR/2);
        const d = `M ${startX} ${startY} C ${c1x} ${c1y} ${c2x} ${c2y} ${endX} ${endY}`;
        const path = document.createElementNS(ns,'path');
        path.setAttribute('d', d);
        path.setAttribute('fill','none'); path.setAttribute('stroke','#333'); path.setAttribute('stroke-width','1.4');
        path.setAttribute('marker-end','url(#arrowhead)');
        path.setAttribute('data-from', t.from);
        path.setAttribute('data-to', t.to);
        path.setAttribute('id', `viz_edge_${t.from}_${t.to}_${idx}`);
        svgEl.appendChild(path);

        // label above the loop (grouped for readability)
        const lblX = sx + loopOffset + 6; const lblY = sy - loopOffset - 12;
        const labelGroup = document.createElementNS(ns,'g');
        labelGroup.setAttribute('transform', `translate(${lblX}, ${lblY})`);
        const lbl = document.createElementNS(ns,'text');
        lbl.setAttribute('x', '0'); lbl.setAttribute('y', '0');
        lbl.setAttribute('font-size','13'); lbl.setAttribute('text-anchor','middle'); lbl.setAttribute('fill','#0f172a');
        const displayRead = (t.read === '' ? BLANK_SYMBOL : t.read);
        const displayWrite = (t.write === '' ? BLANK_SYMBOL : t.write);
        lbl.textContent = `${displayRead}→${displayWrite},${t.move}`;
        // append text first so getBBox works reliably
        labelGroup.appendChild(lbl);
        svgEl.appendChild(labelGroup);
        const bbox = lbl.getBBox(); const pad = 6;
        const rect = document.createElementNS(ns,'rect');
        rect.setAttribute('x', bbox.x - pad); rect.setAttribute('y', bbox.y - pad);
        rect.setAttribute('width', bbox.width + pad*2); rect.setAttribute('height', bbox.height + pad*2);
        rect.setAttribute('fill','#ffffff'); rect.setAttribute('stroke','none'); rect.setAttribute('rx','6');
        // insert rect behind text and keep them grouped
        labelGroup.insertBefore(rect, lbl);
        // set a class-like attribute for later toggling/highlighting
        labelGroup.setAttribute('data-for', `viz_edge_${t.from}_${t.to}_${idx}`);
        // store reference on path so we can highlight the label along with the edge
        path.dataset.labelId = `label_${t.from}_${t.to}_${idx}`;
        labelGroup.setAttribute('id', `label_${t.from}_${t.to}_${idx}`);
        return;
      }

      // compute midpoint and perpendicular offset for curvature (non-loop)
      const mx = (from.x + to.x)/2;
      const my = (from.y + to.y)/2;
      const dx = to.x - from.x; const dy = to.y - from.y;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const ux = dx/len; const uy = dy/len;
      // perpendicular
      const px = -uy; const py = ux;
      const curve = 20; // curvature amount
      const cxp = mx + px*curve; const cyp = my + py*curve;
      const d = `M ${from.x} ${from.y} Q ${cxp} ${cyp} ${to.x} ${to.y}`;
      const path = document.createElementNS(ns,'path');
      path.setAttribute('d', d);
      path.setAttribute('fill','none'); path.setAttribute('stroke','#333'); path.setAttribute('stroke-width','1.2');
      path.setAttribute('marker-end','url(#arrowhead)');
      // mark data for highlighting
      path.setAttribute('data-from', t.from);
      path.setAttribute('data-to', t.to);
      path.setAttribute('id', `viz_edge_${t.from}_${t.to}_${idx}`);
      svgEl.appendChild(path);

      // label at the curve midpoint
      const tposX = (from.x + to.x)/2 + px* (curve/1.6);
      const tposY = (from.y + to.y)/2 + py* (curve/1.6) - 6;
      const lbl = document.createElementNS(ns,'text');
      lbl.setAttribute('x', tposX); lbl.setAttribute('y', tposY);
      lbl.setAttribute('font-size','13'); lbl.setAttribute('text-anchor','middle'); lbl.setAttribute('fill','#0f172a');
      const displayRead = (t.read === '' ? BLANK_SYMBOL : t.read);
      const displayWrite = (t.write === '' ? BLANK_SYMBOL : t.write);
      lbl.textContent = `${displayRead}→${displayWrite},${t.move}`;
      svgEl.appendChild(lbl);
      // background rect behind label for readability
      const bbox = lbl.getBBox();
      const pad = 4;
      const rect = document.createElementNS(ns,'rect');
      rect.setAttribute('x', bbox.x - pad); rect.setAttribute('y', bbox.y - pad);
      rect.setAttribute('width', bbox.width + pad*2); rect.setAttribute('height', bbox.height + pad*2);
      rect.setAttribute('fill','#ffffff'); rect.setAttribute('stroke','none'); rect.setAttribute('rx','4');
      svgEl.insertBefore(rect, lbl);
    });

    // utility: clear any edge highlights
    function clearEdgeHighlights(){
      const edges = svgEl.querySelectorAll('path[id^="viz_edge_"]');
      edges.forEach(e=>{ e.setAttribute('stroke','#333'); e.setAttribute('stroke-width','1.2'); });
    }

    // draw nodes
    states.forEach(s=>{
      const g = document.createElementNS(ns,'g');
      g.setAttribute('transform',`translate(${s._pos.x},${s._pos.y})`);
      const circle = document.createElementNS(ns,'circle');
      circle.setAttribute('r', String(NODE_R)); circle.setAttribute('fill','#fff'); circle.setAttribute('stroke','#333');
      circle.setAttribute('data-id',s.id);
      const text = document.createElementNS(ns,'text');
      text.setAttribute('x','0'); text.setAttribute('y', String(Math.round(NODE_R/3))); text.setAttribute('text-anchor','middle'); text.textContent = s.label;
      text.setAttribute('font-size','13');
      g.appendChild(circle); g.appendChild(text);
      svgEl.appendChild(g);
    });
  }

  function highlightState(id){
    const svg = document.getElementById('visual_fsm');
    if(!svg) return;
    const circles = svg.querySelectorAll('circle');
    circles.forEach(c=>{
      if(id && c.getAttribute('data-id')===id){
        c.setAttribute('fill','#ffd54f'); c.setAttribute('r','26');
      } else { c.setAttribute('fill','#fff'); c.setAttribute('r','20'); }
    });
  }

  function highlightTransition(from, to){
    const svg = document.getElementById('visual_fsm');
    if(!svg) return;
    // clear previous
    const edges = svg.querySelectorAll('path[id^="viz_edge_"]');
    edges.forEach(e=>{ e.setAttribute('stroke','#333'); e.setAttribute('stroke-width','1.2'); });
    // find matching edge(s)
    const match = Array.from(edges).filter(e => e.getAttribute('data-from')===from && e.getAttribute('data-to')===to);
    match.forEach(e=>{ e.setAttribute('stroke','#2563EB'); e.setAttribute('stroke-width','2.6'); });
    // reset label backgrounds first
    const allLabels = svg.querySelectorAll('g[id^="label_"]');
    allLabels.forEach(g=>{ const r = g.querySelector('rect'); if(r) r.setAttribute('fill','#ffffff'); });
    // highlight label too if available
    match.forEach(e=>{
      const labelId = e.getAttribute('id').replace('viz_edge_','label_');
      const lab = svg.querySelector(`#${labelId}`);
      if(lab){ const rect = lab.querySelector('rect'); if(rect) rect.setAttribute('fill','#e6f0ff'); }
    });
  }

  function highlightStates(from, to){
    const svg = document.getElementById('visual_fsm');
    if(!svg) return;
    const circles = svg.querySelectorAll('circle');
    circles.forEach(c=>{ c.setAttribute('fill','#fff'); c.setAttribute('r','20'); });
    const src = svg.querySelector(`circle[data-id="${from}"]`);
    const tgt = svg.querySelector(`circle[data-id="${to}"]`);
    if(src){ src.setAttribute('fill','#bfdbfe'); src.setAttribute('r','24'); }
    if(tgt){ tgt.setAttribute('fill','#ffd54f'); tgt.setAttribute('r','26'); }
  }

  // attach button
  document.addEventListener('DOMContentLoaded', ()=>{
    const btn = document.getElementById('open_visual_tutorial');
    if(!btn) return;
    btn.addEventListener('click', (e)=>{ openModal(); });
  });

})();
