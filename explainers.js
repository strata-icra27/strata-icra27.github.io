/* Named method steps and direct plot inspection; no timeline or policy simulation. */
(function(){
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const insight=document.querySelector('#insight-visual');
 document.querySelector('#insight-space').innerHTML=window.StrataInsight.space;
 document.querySelector('#insight-motions').innerHTML=window.StrataInsight.motions;
 const modeNames=['Two-arm lift','One-arm lift','Top contact and lift'];
 const motions=document.querySelector('#insight-motions');
 let pinnedMode=null;
 function showMode(index){
  const illustrated=index!==null&&index<modeNames.length;
  insight.querySelectorAll('[data-mode-visual]').forEach(group=>{
   const mode=Number(group.dataset.modeVisual);
   const context=motions.contains(group)?!illustrated:illustrated&&mode>=modeNames.length;
   group.style.opacity=index===null||mode===index||context?'1':'.12';
  });
  document.querySelector('#motion-caption').textContent=illustrated?modeNames[index]:'Different complete motions can achieve the same goal.';
  insight.querySelectorAll('[data-mode-link]').forEach(link=>{
   const mode=Number(link.dataset.modeLink),selected=mode===index;
   const active=index===null||selected||illustrated&&mode>=modeNames.length;
   link.style.opacity=active?'1':'.15';
   link.setAttribute('stroke-width',selected?'8':'4.7');
  });
  insight.querySelectorAll('[data-mode]').forEach(hit=>hit.setAttribute('aria-pressed',String(Number(hit.dataset.mode)===pinnedMode)));
 }
 insight.querySelectorAll('[data-mode]').forEach(hit=>{
  const mode=Number(hit.dataset.mode);
  hit.addEventListener('pointerenter',()=>showMode(mode));
  hit.addEventListener('pointerleave',()=>showMode(pinnedMode));
  hit.addEventListener('focus',()=>showMode(mode));
  const select=()=>{pinnedMode=pinnedMode===mode?null:mode;showMode(pinnedMode);};
  hit.addEventListener('click',select);
  hit.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}if(e.key==='Escape'){pinnedMode=null;showMode(null);}});
 });
 insight.addEventListener('pointerleave',()=>showMode(pinnedMode));
 insight.addEventListener('focusout',e=>{if(!insight.contains(e.relatedTarget))showMode(pinnedMode);});
 showMode(null);
 const method=[
  ['Encode the complete demonstrated action trajectory','The strategy encoder represents the motion across the entire demonstration. Its representation is learned jointly with the execution policy.'],
  ['Represent demonstrated modes with discrete codes','Residual VQ maps the trajectory representation to a strategy code using learned codebooks. This gives the robot a finite strategy space.'],
  ['One strategy across a demonstration','The current observation and strategy code condition the flow-matching policy’s next action chunk. Actions across the demonstration share a code, while the policy learns to separate actions at similar observations using different codes.'],
  ['Learn which strategy to select from history','Freeze the codebooks and execution components. Reinforcement learning trains selection from previous attempts’ observations and actions, within the finite demonstrated strategy space.'],
  ['Hold the code fixed throughout an attempt','The execution policy responds to current observations and produces action chunks. The strategy code stays fixed while those observations and actions change.'],
  ['An attempt becomes evidence for the next choice','Append the recorded observations and actions to history. The selection policy can use that response when choosing again. Selection is trained with a sparse reward for success within three attempts.']
 ];
 const art=document.querySelector('#method-art');
 art.innerHTML=window.StrataArt.method;
 const master=art.querySelector('svg');
 const layers=[...master.querySelectorAll('[data-layer]')];
 const find=id=>master.querySelector(`[data-art-id="${id}"]`);
 let lastMethod=-1;
 function panTo(host,originalX,originalWidth){
  const svg=host.querySelector('svg');
  if(!svg||!host.scrollTo)return;
  const scale=svg.getBoundingClientRect().width/originalWidth;
  host.scrollTo({left:Math.max(0,originalX*scale-host.clientWidth/2),behavior:reduced?'instant':'smooth'});
 }
 function methodVisual(index,p=1){
  if(index!==lastMethod){panTo(art,[260,940,1535,935,1535,800][index],1840);lastMethod=index;}
  const levels={trajectory:0,encoder:0,quantize:1,space:1,execute:2,observation:2,selection:3,attempt:4,'append-to-history':5};
  layers.forEach(g=>{const name=g.dataset.layer;if(name!=='append-record')g.style.opacity=index>=levels[name]?'1':'.08';});
  const progress=index===4?p*5:index===5?5:0;
  for(let i=0;i<5;i++){
   find('attempt-observation-'+i)?.setAttribute('fill',progress>i?'#3e809f':'white');
   find('attempt-action-'+i)?.setAttribute('fill',progress>i+.45?'#c07943':'white');
  }
  const n=Math.min(4,Math.floor(progress));
  find('observation-cursor')?.setAttribute('transform',`translate(${(n-3)*27} 0)`);
  find('action-cursor')?.setAttribute('transform',`translate(${(n-3)*27} 0)`);
  const record=find('append-record'),q=index===5?p:0;
  if(record){record.setAttribute('opacity',index===5&&q<1?'1':'0');record.setAttribute('transform',`translate(${1325-725*q} ${882-35*q})`);}
  const label=find('history-last-label');if(label)label.textContent=index===5&&q>=1?'Attempt k':'Attempt k − 1';
 }
 function showMethod(index){
  document.querySelector('#method-title').textContent=method[index][0];
  document.querySelector('#method-copy').textContent=method[index][1];
  document.querySelectorAll('[data-method-step]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.methodStep)===index)));
  methodVisual(index);
 }
 document.querySelectorAll('[data-method-step]').forEach(button=>button.addEventListener('click',()=>showMethod(Number(button.dataset.methodStep))));
 showMethod(0);
 // Means rounded to one decimal, as in the approved results. No interpolation
 // between attempt budgets: only the three measured cumulative values.
 // Figure 4: intermediate budgets checked against the vector bar boundaries;
 // final labels use the paper's reported one-decimal values.
 const datasets=[{id:'simulation',ours:[38.5,82.7,92.7],baseline:[35,50.8,57.6],extra:[
   {key:'random-first',name:'STRATA (RF)',values:[12.5,58.6,83.8],color:'#b17b2b',dash:'7 4'},
   {key:'dsrl-ps',name:'DSRL-PS',values:[32,46.9,55.2],color:'#485e79',dash:'3 4'},
   {key:'rma',name:'RMA-like',values:[10.2,18,23.6],color:'#78639a'},
   {key:'random',name:'Rand-PA',values:[12.8,24.5,34.4],color:'#4d8255'}]},
  {id:'real',ours:[20,52.5,70],baseline:[22.5,40,55]}];
 const series=d=>[{key:'ours',name:'STRATA',values:d.ours,color:'#d65d3b'},
  {key:'baseline',name:'DSRL-PA',values:d.baseline,color:'#28649a'},...(d.extra||[])];
 const X=[78,250,422],y=v=>310-v*2.45,percent=v=>`${v}%`;
 const path=values=>values.map((v,i)=>`${i?'L':'M'}${X[i]} ${y(v)}`).join(' ');
 function chart(d){
  const all=series(d);
  let s=`<svg viewBox="0 0 560 385" font-family="Arial,Helvetica,sans-serif" role="group" aria-labelledby="${d.id}-chart-title ${d.id}-chart-desc"><title id="${d.id}-chart-title">${d.id==='real'?'Real robot':'Simulation'}: cumulative success by attempt</title><desc id="${d.id}-chart-desc">${all.map(row=>row.name+' '+row.values.join(', ')+' percent').join('. ')} within one, two and three attempts respectively.</desc><text x="30" y="26" fill="#68717c" font-size="20">Cumulative success (%)</text><path class="inspect-guide" stroke="#a9b0b7" stroke-dasharray="4 6" stroke-width="1.5" fill="none"/>`;
  [0,25,50,75,100].forEach(v=>s+=`<path d="M68 ${y(v)}H440" stroke="#e5e8ec"/><text x="50" y="${y(v)+7}" text-anchor="end" font-size="21" fill="#68717c">${v}</text>`);
  [...all].reverse().forEach(row=>{
   const {key:name,color,values}=row,primary=name==='ours'||name==='baseline';
   s+=`<path class="live-${name}" d="${path(values)}" fill="none" stroke="${color}" stroke-width="${name==='ours'?4.5:primary?3.4:2.6}" ${row.dash?'stroke-dasharray="'+row.dash+'"':''} stroke-linecap="round" stroke-linejoin="round"/>`;
   values.forEach((v,i)=>s+=`<circle cx="${X[i]}" cy="${y(v)}" r="${primary?5:4}" fill="white" stroke="${color}" stroke-width="${primary?3:2}"/>`);
   if(primary)s+=`<text class="final-${name}" x="437" y="${y(values[2])+(name==='ours'?-13:28)}" font-size="25" font-weight="600" fill="${color}">${percent(values[2])}</text><circle class="cursor-${name}" r="7" fill="${color}" stroke="white" stroke-width="2"/><text class="value-${name}" font-size="24" font-weight="600" fill="${color}" paint-order="stroke" stroke="white" stroke-width="5" stroke-linejoin="round"></text>`;
  });
  X.forEach((x,i)=>s+=`<text x="${x}" y="355" text-anchor="middle" font-size="22" fill="#68717c">${i+1}</text>`);
  s+='<text x="250" y="383" text-anchor="middle" font-size="20" fill="#68717c">Attempt</text>';
  const regions=[[60,105],[165,170],[335,110]];
  regions.forEach(([x,width],i)=>s+=`<rect class="inspect-column" data-attempt="${i+1}" x="${x}" y="55" width="${width}" height="305" rx="7" fill="transparent" tabindex="0" role="button" aria-pressed="false" aria-label="Attempt ${i+1}: ${all.map(row=>row.name+' '+percent(row.values[i])).join(', ')}"/>`);
  s+='</svg>';
  document.querySelector('#'+d.id+'-chart').innerHTML=s;
  document.querySelector('#'+d.id+'-values').innerHTML=all.map(row=>`<div class="series-reading"><span><svg viewBox="0 0 32 10" aria-hidden="true"><path d="M1 5H31" stroke="${row.color}" stroke-width="${row.key==='ours'?4:3}" ${row.dash?'stroke-dasharray="'+row.dash+'"':''}/></svg>${row.name}</span><strong data-series-value="${d.id}-${row.key}">${percent(row.values[2])}</strong></div>`).join('');
 }
 datasets.forEach(chart);
 let pinned=0;
 function update(attempt){
  datasets.forEach(d=>{
   const svg=document.querySelector('#'+d.id+'-chart svg'),index=attempt-1;
   svg.querySelector('.inspect-guide').setAttribute('d',attempt<3?`M${X[index]} 58V315`:'');
   ['ours','baseline'].forEach(name=>{
    const values=d[name],value=values[index],dot=svg.querySelector('.cursor-'+name),label=svg.querySelector('.value-'+name);
    dot.setAttribute('cx',X[index]);dot.setAttribute('cy',y(value));
    label.setAttribute('x',X[index]+15);label.setAttribute('y',y(value)+(name==='ours'?-13:28));label.textContent=attempt<3?percent(value):'';
   });
   const gap=Number((d.ours[index]-d.baseline[index]).toFixed(1));
   document.querySelector('#'+d.id+'-gap').textContent=(gap>0?'+':'')+gap+' pp';
   document.querySelector('#'+d.id+'-attempt').textContent=attempt===1?'First attempt':`Within ${attempt} attempts`;
   series(d).forEach(row=>document.querySelector(`[data-series-value="${d.id}-${row.key}"]`).textContent=percent(row.values[index]));
  });
  document.querySelectorAll('[data-attempt]').forEach(point=>point.setAttribute('aria-pressed',String(Number(point.dataset.attempt)===pinned)));
 }
 document.querySelectorAll('[data-attempt]').forEach(point=>{
  const attempt=Number(point.dataset.attempt),select=()=>{pinned=pinned===attempt?0:attempt;update(pinned||3);};
  point.addEventListener('pointerenter',()=>update(attempt));point.addEventListener('focus',()=>update(attempt));
  point.addEventListener('click',select);
  point.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select();}if(e.key==='Escape'){pinned=0;update(3);}});
 });
 datasets.forEach(d=>{const svg=document.querySelector('#'+d.id+'-chart svg');svg.addEventListener('pointerleave',()=>update(pinned||3));svg.addEventListener('focusout',e=>{if(!svg.contains(e.relatedTarget))update(pinned||3);});});
 update(3);
})();
