(function(){
 // Keeps short items on one line: times, dates, money, phone numbers, names like "Exhibit C" or "1010 Joseph Place".
 var RX=/\d{1,2}:\d{2}(\s?[–-]\s?\d{1,2}:\d{2})?(\s?(a\.m\.|p\.m\.|AM|PM))?|\(\d{3}\)\s\d{3}-\d{4}|\b\d{3}\.\d{3}\.\d{4}\b|(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\.?,?\s(Nov|Dec|Oct)\.?\s\d{1,2}|\b(Nov|Dec|Oct)\.?\s\d{1,2}\b|\bDay\s\d\b|\bExhibits?\s[A-H](\s?[–-]\s?[A-H])?\b|\bScenario\s[AB]\b|\bTool\s\d\b|\bLab\s\d\b|\bExercise\s\d\b|1010\sJoseph\sPlace|Alliance\sfor\sHousing\sProgress|\d[\d,.]*\s(sq\.\sft\.|months?|days?|units?|points?)\b|\$[\d,]+(\.\d+)?\s?(\/\s?mo|per\smonth)|[−-]\s\$[\d,]+|Fall\s2026|Peabody\sPlace|P2725|EDA2026/g;
 var SKIP=/^(SCRIPT|STYLE|TEXTAREA|OPTION|INPUT|SELECT|CODE|PRE)$/;
 function fix(t){return t.replace(RX,function(m){return m.replace(/ /g,' ').replace(/(\d)-(\d)/g,'$1‑$2').replace(/\s?([–-])\s?(?=\d|[A-H])/g,function(x,d){return x.replace(/ /g,' ').replace(d,'⁠'+d+'⁠')})})}
 function run(root){
  if(!root)return;
  var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,list=[];
  while(n=w.nextNode()){var p=n.parentElement;if(!p||SKIP.test(p.tagName)||p.isContentEditable)continue;list.push(n)}
  list.forEach(function(n){var t=n.nodeValue,f=fix(t);if(f!==t)n.nodeValue=f});
 }
 var busy=false;
 function go(){if(busy)return;busy=true;try{run(document.body)}finally{busy=false}}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
 var q=null;try{new MutationObserver(function(){if(busy||q)return;q=setTimeout(function(){q=null;go()},30)}).observe(document.documentElement,{childList:true,subtree:true,characterData:true})}catch(e){}
})();
