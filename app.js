const STORAGE_KEY="btis_surveys_v07";
const DRAFT_KEY="btis_draft_v07";
let currentScreen=0;
let adminMode=false;
let photoData="";
let recognition=null;

const screens=[
{title:"Welcome",purpose:"Welcome to Botswana. This survey helps improve tourism services through honest traveller feedback.",fields:[
  {type:"html",html:"<div class='section-note'><strong>Dumelang! Welcome to Botswana.</strong><br>This survey can be completed gradually during quiet moments of the journey. You may answer only the parts that apply to you.</div>"},
  {type:"text",name:"travellerName",label:"Name / Nickname",placeholder:"Use either your name or a nickname"},
  {type:"select",name:"nationality",label:"Nationality",options:["","Botswana","Japan","South Africa","Zimbabwe","Zambia","United Kingdom","United States","Germany","France","Other"]}
]},
{title:"Traveller Profile",purpose:"Create a simple traveller profile for this tour.",fields:[
  {type:"select",name:"ageGroup",label:"Age Group",options:["","Under 20","20–29","30–39","40–49","50–59","60–69","70 or above"]},
  {type:"select",name:"gender",label:"Gender (Optional)",options:["","Female","Male","Other","Prefer not to say"]},
  {type:"text",name:"contact",label:"Email / WhatsApp (Optional)",placeholder:"Optional follow-up contact"},
  {type:"checkbox",name:"mayContact",label:"BTIS may contact me about my feedback."}
]},
{title:"Traveller Account",purpose:"A temporary Traveller ID will connect your answers during this trip.",fields:[
  {type:"html",html:"<div class='section-note'>Your Traveller ID is created automatically. It does not need to be shown publicly.</div>"},
  {type:"text",name:"travellerId",label:"Traveller ID",readonly:true}
]},
{title:"New Tour",purpose:"Create a record for this journey.",fields:[
  {type:"text",name:"tourName",label:"Tour Name",placeholder:"Example: Northern Botswana Cultural Tour"},
  {type:"date",name:"tourStart",label:"Start Date"},
  {type:"date",name:"tourEnd",label:"End Date"}
]},
{title:"Travel Type",purpose:"Tell us how you are travelling.",fields:[
  {type:"radio",name:"travelType",label:"Travel Type",options:["Solo","Couple","Family","Friends","Group","Business partners","Other"]},
  {type:"radio",name:"visitNumber",label:"Is this your first visit to Botswana?",options:["Yes","No"]}
]},
{title:"Guide Information",purpose:"Select the guide responsible for this part of the journey.",fields:[
  {type:"text",name:"guideName",label:"Guide",placeholder:"Select or enter guide name"},
  {type:"text",name:"guideSection",label:"Guide's responsible section",placeholder:"Example: 2 days / Gaborone to Maun"}
]},
{title:"Accommodation Details",purpose:"Create one review for one accommodation stay.",fields:[
  {type:"qr",name:"qrText",label:"QR / Lodge Code",placeholder:"Example: RASESA, BTIS-RASESA, or lodge JSON"},
  {type:"text",name:"accommodation",label:"Accommodation",placeholder:"Example: Rasesa Lodge"},
  {type:"text",name:"location",label:"Location",placeholder:"Town, village or area"},
  {type:"date",name:"checkIn",label:"Check-in Date"},
  {type:"date",name:"checkOut",label:"Check-out Date"}
]},
{title:"Reservation and Arrival",purpose:"Evaluate the reservation and arrival experience.",ratings:["Reservation accuracy","Pre-arrival communication","Ease of finding the property","Welcome on arrival"],na:true},
{title:"Check-in",purpose:"Evaluate the check-in process.",ratings:["Speed of check-in","Clarity of information","Staff helpfulness","Accuracy of room allocation"],na:true},
{title:"Room and Comfort",purpose:"Evaluate the room and basic comfort.",ratings:["Room cleanliness","Bed comfort","Room condition","Noise level","Temperature / air conditioning"],na:true},
{title:"Bathroom and Toilet",purpose:"Evaluate bathroom and toilet facilities.",ratings:["Bathroom cleanliness","Toilet condition","Hot water","Shower quality","Privacy"],na:true},
{title:"Electricity and Charging",purpose:"Evaluate electricity and charging facilities.",ratings:["Electricity reliability","Charging points","Lighting","Backup power"],na:true},
{title:"Security",purpose:"Evaluate security measures and your feeling of safety.",ratings:["Property security","Room security","Lighting around property","Staff response to concerns"],na:true},
{title:"Accessibility",purpose:"Evaluate access for travellers with mobility or other support needs.",ratings:["Step-free access","Pathways","Bathroom accessibility","Staff assistance"],na:true},
{title:"Staff Service",purpose:"Evaluate staff conduct and service quality.",ratings:["Friendliness","Professionalism","Responsiveness","Communication"],na:true},
{title:"Breakfast and Food",purpose:"Evaluate breakfast and food service.",ratings:["Food quality","Variety","Cleanliness","Service","Local Botswana food options"],na:true,
 extra:[{type:"radio",name:"triedTraditionalFood",label:"Did you try traditional Botswana food here?",options:["Yes","No","Not sure","Not applicable"]},
 {type:"textarea",name:"favoriteDish",label:"Which dish did you enjoy most?"}]},
{title:"Local Culture Experience",purpose:"Evaluate opportunities to experience local culture.",ratings:["Authenticity","Respect for local culture","Opportunities to learn","Community involvement"],na:true},
{title:"Value for Money",purpose:"Evaluate whether the experience matched the price paid.",ratings:["Room value","Food value","Service value","Overall value"],na:true},
{title:"Check-out",purpose:"Evaluate the departure process.",ratings:["Speed of check-out","Bill accuracy","Staff helpfulness","Farewell"],na:true},
{title:"Accommodation Overall Review",purpose:"Give an overall assessment of this accommodation.",ratings:["Overall satisfaction","Would stay again","Would recommend"],na:false,
 extra:[{type:"textarea",name:"accommodationBest",label:"What should this accommodation continue doing well?"},
 {type:"textarea",name:"accommodationImprove",label:"What should be improved?"},
 {type:"voice",name:"voiceNote",label:"Voice Note (Optional)"},
 {type:"photo",name:"photo",label:"Photo Attachment (Optional)"},
 {type:"textarea",name:"photoNote",label:"Photo note"},
 {type:"textarea",name:"guideNote",label:"Guide's Private Note"},
 {type:"textarea",name:"accommodationResponse",label:"Accommodation Response"}]},
{title:"Overall Trip Review",purpose:"Please review your overall experience in Botswana.",ratings:["Overall satisfaction","Value for money","Would visit Botswana again","Would recommend Botswana"],na:false,
 extra:[{type:"textarea",name:"tripMemorable",label:"What was the most memorable part of your trip?"},
 {type:"textarea",name:"tripImprove",label:"What is the one thing that should be improved most?"}]},
{title:"Guide Evaluation",purpose:"Please evaluate the guide who accompanied you during this part of your journey.",privacy:true,
 ratings:["Friendliness","Communication skills","Knowledge of destinations","Clarity of explanations","Time management (Arrive at least 10 minutes early. Late arrival is unacceptable.)","Safety awareness","Problem-solving ability","Flexibility","Understanding of local culture","Professionalism","Overall satisfaction"],na:false,
 extra:[{type:"textarea",name:"guideBest",label:"What did your guide do particularly well?"},
 {type:"textarea",name:"guideImprove",label:"What could be improved?"},
 {type:"radio",name:"guideAgain",label:"Would you request this guide again?",options:["Definitely Yes","Probably Yes","Not Sure","Probably No","Definitely No"]}]},
{title:"Best of Your Botswana Journey",purpose:"Tell us what impressed you most.",fields:[
  {type:"text",name:"bestAccommodation",label:"Best accommodation"},
  {type:"text",name:"bestFood",label:"Best restaurant or food experience"},
  {type:"text",name:"bestAttraction",label:"Most memorable attraction or destination"},
  {type:"text",name:"bestExperience",label:"Best activity or experience"},
  {type:"textarea",name:"bestReason",label:"Why did you choose these?"}
]},
{title:"What Needs the Most Improvement?",purpose:"Constructive feedback helps Botswana improve its tourism industry.",fields:[
  {type:"textarea",name:"needsImprovement",label:"Which accommodation, restaurant, attraction, guide or service needs the most improvement?"},
  {type:"textarea",name:"improvementSuggestion",label:"Please explain your suggestion."}
]},
{title:"Challenges During Your Trip",purpose:"Tell us about any difficulties you experienced.",fields:[
  {type:"checkboxGroup",name:"tripChallenges",label:"Did you experience problems with:",options:["Transportation","Mobile phone or Internet","Payment or cash","Language or communication","Safety or security","Toilets or public facilities","Other","None"]},
  {type:"textarea",name:"challengeDetails",label:"Please describe any problems and how they could be improved."}
]},
{title:"What Would You Have Liked to Experience?",purpose:"Your ideas can help create better tourism products.",fields:[
  {type:"textarea",name:"nextPlace",label:"What place would you like to visit next time?"},
  {type:"textarea",name:"wantedFood",label:"What local food did you hope to try?"},
  {type:"textarea",name:"wantedCulture",label:"What cultural experience did you hope to have?"},
  {type:"textarea",name:"wantedActivity",label:"What activity or tour would you like to see offered?"},
  {type:"textarea",name:"wantedProduct",label:"Was there anything you wanted to buy but could not find?"}
]},
{title:"About Your Visit",purpose:"This information is used only for statistical analysis.",fields:[
  {type:"number",name:"groupSize",label:"Number of travellers in your group",min:1},
  {type:"number",name:"stayLength",label:"Length of stay in Botswana (days)",min:1},
  {type:"text",name:"mainPurpose",label:"Main purpose of your visit"},
  {type:"text",name:"howFoundBTIS",label:"How did you learn about BTIS?"}
]},
{title:"Tourism Market Research — Before Travel",purpose:"Discussion Draft. This optional section may change significantly before official release.",draft:true,optional:true,fields:[
  {type:"radio",name:"tripPlanning",label:"How did you plan this trip?",options:["I planned everything myself","I used a travel agency","I booked through an online travel platform","A guide arranged most of the trip","A friend or family member planned it","Other"]},
  {type:"textarea",name:"beforeImage",label:"Before coming to Botswana, what image or expectations did you have?"},
  {type:"textarea",name:"imageDifference",label:"How was the reality different from what you expected?"}
]},
{title:"Tourism Market Research — Missing Opportunities",purpose:"Discussion Draft. This optional section is intended to identify unmet traveller demand.",draft:true,optional:true,fields:[
  {type:"textarea",name:"missedPlace",label:"Which place did you not visit but would like to visit next time?"},
  {type:"textarea",name:"missedFood",label:"What food did you want to try but could not?"},
  {type:"textarea",name:"missedExperience",label:"What experience did you expect but were unable to have?"},
  {type:"textarea",name:"missedProduct",label:"What local product or souvenir did you want but could not find?"}
]},
{title:"Thank You / Submit",purpose:"Discussion Draft. The final relationship between BTIS Evaluation and optional Tourism Market Research is still under review.",draft:true,fields:[
  {type:"html",html:"<div class='section-note'><strong>Thank you for helping improve tourism in Botswana.</strong><br>Your responses will be stored as BTIS improvement data. Personal contact details are optional.</div>"},
  {type:"checkbox",name:"confirmSubmit",label:"I am ready to submit this survey."}
]}
];

function $(id){return document.getElementById(id)}
function load(){return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}
function save(data){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function escapeHtml(v=""){return String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function makeTravellerId(){return "BTIS-"+Date.now().toString(36).toUpperCase().slice(-6)}
function fieldHtml(f){
  const val=f.readonly?` value="${escapeHtml(makeTravellerId())}"`:"";
  if(f.type==="html")return f.html;
  if(f.type==="qr")return `<div class="field"><label>${f.label}</label><div class="inline-control"><input id="qrText" type="text" name="${f.name}" placeholder="${f.placeholder||""}"><button type="button" id="applyQr" class="secondary">Apply Code</button></div><p class="small">Test codes: RASESA or BTIS-RASESA</p></div>`;
  if(f.type==="voice")return `<div class="field"><label>${f.label}</label><textarea id="voiceNote" name="${f.name}" placeholder="Voice transcription appears here"></textarea><div class="inline-control"><button type="button" id="startVoice" class="secondary">Start Voice Input</button><button type="button" id="stopVoice" class="secondary" disabled>Stop</button><span id="voiceStatus" class="small"></span></div></div>`;
  if(f.type==="photo")return `<div class="field"><label>${f.label}</label><input id="photoInput" type="file" accept="image/*"><img id="photoPreview" class="photo-preview hidden" alt="Photo preview"></div>`;
  if(f.type==="textarea")return `<div class="field"><label>${f.label}</label><textarea name="${f.name}" placeholder="${f.placeholder||""}"></textarea></div>`;
  if(f.type==="select")return `<div class="field"><label>${f.label}</label><select name="${f.name}">${f.options.map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o||"Please select")}</option>`).join("")}</select></div>`;
  if(f.type==="radio")return `<div class="field"><span class="group-title">${f.label}</span><div class="options">${f.options.map(o=>`<label class="option"><input type="radio" name="${f.name}" value="${escapeHtml(o)}"> ${escapeHtml(o)}</label>`).join("")}</div></div>`;
  if(f.type==="checkboxGroup")return `<div class="field"><span class="group-title">${f.label}</span><div class="options">${f.options.map(o=>`<label class="option"><input type="checkbox" name="${f.name}" value="${escapeHtml(o)}"> ${escapeHtml(o)}</label>`).join("")}</div></div>`;
  if(f.type==="checkbox")return `<div class="field"><label class="option"><input type="checkbox" name="${f.name}"> ${f.label}</label></div>`;
  return `<div class="field"><label>${f.label}</label><input type="${f.type||"text"}" name="${f.name}" placeholder="${f.placeholder||""}" ${f.readonly?"readonly":""} ${f.min?`min="${f.min}"`:""}${val}></div>`;
}
function ratingHtml(items,na,screenIndex){
  return `<div class="rating-grid">${items.map((item,i)=>`<div class="rating-row"><div class="rating-title">${escapeHtml(item)}</div><div class="rating-options">${[1,2,3,4,5].map(n=>`<label><input type="radio" name="s${screenIndex}_r${i}" value="${n}">${n}</label>`).join("")}${na?`<label><input type="radio" name="s${screenIndex}_r${i}" value="NA">N/A</label>`:""}</div><div class="conditional"><textarea name="s${screenIndex}_c${i}" placeholder="Reason or comment (especially for ratings of 1 or 2)"></textarea></div></div>`).join("")}</div>`;
}
function renderScreen(){
  const s=screens[currentScreen];
  $("screenLabel").textContent=`Screen ${currentScreen+1} of ${screens.length}`;
  const pct=Math.round(((currentScreen+1)/screens.length)*100);
  $("progressText").textContent=pct+"%";
  $("progressBar").style.width=pct+"%";
  let html=`<div class="screen-card"><h2>${escapeHtml(s.title)}</h2>`;
  if(s.privacy)html+=`<div class="privacy-banner"><strong>Privacy Mode</strong><p>Please complete this section yourself. Your guide cannot see or change your answers.</p></div>`;
  if(s.draft)html+=`<div class="draft-banner"><strong>Discussion Draft</strong><p>This screen may change significantly before the first official release.</p></div>`;
  html+=`<div class="purpose">${escapeHtml(s.purpose)}</div>`;
  if(s.optional)html+=`<p class="inline-note">This section is optional. You may continue without answering.</p>`;
  if(s.ratings)html+=ratingHtml(s.ratings,s.na,currentScreen);
  (s.fields||[]).forEach(f=>html+=fieldHtml(f));
  (s.extra||[]).forEach(f=>html+=fieldHtml(f));
  html+="</div>";
  $("screenContainer").innerHTML=html;
  restoreCurrentScreen();
  bindDynamicControls();
  $("prevBtn").disabled=currentScreen===0;
  $("nextBtn").classList.toggle("hidden",currentScreen===screens.length-1);
  $("submitBtn").classList.toggle("hidden",currentScreen!==screens.length-1);
}

function bindDynamicControls(){
  const qr=$("applyQr"); if(qr) qr.onclick=applyQr;
  const pi=$("photoInput"); if(pi) pi.onchange=readPhoto;
  const sv=$("startVoice"); if(sv) sv.onclick=startVoice;
  const st=$("stopVoice"); if(st) st.onclick=stopVoice;
  if(photoData && $("photoPreview")){$("photoPreview").src=photoData;$("photoPreview").classList.remove("hidden")}
}
function applyQr(){
  const el=$("qrText"); if(!el)return;
  const v=el.value.trim(); if(!v)return;
  try{
    const o=JSON.parse(v);
    ["accommodation","location","guideName"].forEach(k=>{
      const target=document.querySelector(`[name="${k}"]`);
      const source=k==="guideName"?o.guide:o[k];
      if(target && source)target.value=source;
    });
    return;
  }catch(e){}
  if(v.toUpperCase().includes("RASESA")){
    const a=document.querySelector('[name="accommodation"]');
    const l=document.querySelector('[name="location"]');
    if(a)a.value="Rasesa Lodge";
    if(l)l.value="Rasesa";
  }
}
function readPhoto(e){
  const file=e.target.files?.[0]; if(!file)return;
  if(file.size>2_000_000){alert("Please use a photo smaller than 2 MB.");e.target.value="";return}
  const reader=new FileReader();
  reader.onload=()=>{photoData=reader.result;const p=$("photoPreview");if(p){p.src=photoData;p.classList.remove("hidden")}};
  reader.readAsDataURL(file);
}
function startVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){if($("voiceStatus"))$("voiceStatus").textContent="Voice input is not supported by this browser.";return}
  recognition=new SR();recognition.lang="en-US";recognition.continuous=true;
  recognition.onresult=e=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript+" ";if($("voiceNote"))$("voiceNote").value+=t};
  recognition.onerror=()=>{if($("voiceStatus"))$("voiceStatus").textContent="Voice input stopped because of an error."};
  recognition.onend=()=>{if($("startVoice"))$("startVoice").disabled=false;if($("stopVoice"))$("stopVoice").disabled=true};
  recognition.start();$("startVoice").disabled=true;$("stopVoice").disabled=false;$("voiceStatus").textContent="Listening...";
}
function stopVoice(){if(recognition)recognition.stop();if($("startVoice"))$("startVoice").disabled=false;if($("stopVoice"))$("stopVoice").disabled=true;if($("voiceStatus"))$("voiceStatus").textContent="Stopped."}

function collectForm(){
  const fd=new FormData($("surveyForm"));
  const data={};
  for(const [k,v] of fd.entries()){
    if(data[k]!==undefined){data[k]=Array.isArray(data[k])?[...data[k],v]:[data[k],v]}
    else data[k]=v;
  }
  document.querySelectorAll('input[type="checkbox"]').forEach(cb=>{
    if(!fd.has(cb.name)&&!data[cb.name]) data[cb.name]=false;
  });
  data.photo=photoData||data.photo||"";
  return data;
}
function saveDraft(){
  const existing=JSON.parse(localStorage.getItem(DRAFT_KEY)||"{}");
  const now=collectForm();
  localStorage.setItem(DRAFT_KEY,JSON.stringify({...existing,...now,currentScreen}));
  alert("Draft saved in this browser.");
}
function restoreCurrentScreen(){
  const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"{}");
  Object.entries(d).forEach(([k,v])=>{
    if(k==="currentScreen")return;
    const els=[...document.querySelectorAll(`[name="${CSS.escape(k)}"]`)];
    els.forEach(el=>{
      if(el.type==="radio")el.checked=Array.isArray(v)?v.includes(el.value):el.value===v;
      else if(el.type==="checkbox")el.checked=Array.isArray(v)?v.includes(el.value):v===true||v==="on";
      else if(!el.value)el.value=v;
    });
  });
}
function next(){saveDraftSilent(); if(currentScreen<screens.length-1){currentScreen++;renderScreen();window.scrollTo(0,0)}}
function prev(){saveDraftSilent(); if(currentScreen>0){currentScreen--;renderScreen();window.scrollTo(0,0)}}
function saveDraftSilent(){
  const existing=JSON.parse(localStorage.getItem(DRAFT_KEY)||"{}");
  localStorage.setItem(DRAFT_KEY,JSON.stringify({...existing,...collectForm(),currentScreen}));
}
function overallScore(d){
  const nums=Object.entries(d).filter(([k,v])=>/^s\d+_r\d+$/.test(k)&&v!=="NA").map(([k,v])=>Number(v)).filter(n=>n>0);
  return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0;
}
function submitSurvey(e){
  e.preventDefault(); saveDraftSilent();
  const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"{}");
  d.id=crypto.randomUUID?crypto.randomUUID():String(Date.now());
  d.createdAt=new Date().toISOString();
  d.overallAverage=overallScore(d);
  const all=load();all.push(d);save(all);
  localStorage.removeItem(DRAFT_KEY);
  photoData="";
  alert("Survey submitted.");
  currentScreen=0;
  $("surveyForm").reset();
  renderScreen();
  showDashboard();
}
function filtered(){
  const g=$("filterGuide").value.toLowerCase(),a=$("filterAccommodation").value.toLowerCase(),n=$("filterNationality").value.toLowerCase();
  const f=$("filterFrom").value,t=$("filterTo").value,m=Number($("filterMaxAvg").value||0);
  return load().filter(x=>{
    const date=(x.createdAt||"").slice(0,10);
    return (!g||(x.guideName||"").toLowerCase().includes(g))
      &&(!a||(x.accommodation||"").toLowerCase().includes(a))
      &&(!n||(x.nationality||"").toLowerCase().includes(n))
      &&(!f||date>=f)&&(!t||date<=t)&&(!m||Number(x.overallAverage||0)<=m);
  }).sort((x,y)=>(y.createdAt||"").localeCompare(x.createdAt||""));
}
function avgValues(values){const nums=values.map(Number).filter(n=>n>0);return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:0}
function ratingLabel(key){
  const m=key.match(/^s(\d+)_r(\d+)$/);if(!m)return key;
  const s=screens[Number(m[1])];return s?.ratings?.[Number(m[2])]||key;
}
function renderDashboard(){
  const data=filtered();
  $("statCount").textContent=data.length;
  $("statAverage").textContent=data.length?(data.reduce((a,b)=>a+Number(b.overallAverage||0),0)/data.length).toFixed(1):"-";
  $("statLatest").textContent=data[0]?.createdAt?.slice(0,10)||"-";
  const ratingKeys=[...new Set(data.flatMap(x=>Object.keys(x).filter(k=>/^s\\d+_r\\d+$/.test(k))))].sort();
  const itemAvgs=ratingKeys.map(k=>({key:k,score:avgValues(data.map(x=>x[k]))}));
  const low=itemAvgs.filter(x=>x.score>0&&x.score<3.5).sort((a,b)=>a.score-b.score);
  $("statLowItems").textContent=low.length;
  $("itemAverages").innerHTML=itemAvgs.length?itemAvgs.map(x=>`<div class="bar-row"><span>${ratingLabel(x.key)}</span><div class="bar-track"><div class="bar-fill" style="width:${(x.score/5)*100}%"></div></div><strong>${x.score.toFixed(1)}</strong></div>`).join(""):"<p class='small'>No rating data.</p>";
  $("priorityItems").innerHTML=low.length?low.map(x=>`<div class="priority"><strong>${ratingLabel(x.key)}</strong> — average ${x.score.toFixed(1)}</div>`).join(""):"<p class='small'>No priority item detected.</p>";
  $("surveyTable").innerHTML=data.map(x=>`<tr><td>${escapeHtml((x.createdAt||"").slice(0,10))}</td><td>${escapeHtml(x.travellerName||"-")}</td><td>${escapeHtml(x.nationality||"-")}</td><td>${escapeHtml(x.guideName||"-")}</td><td>${escapeHtml(x.accommodation||"-")}</td><td>${Number(x.overallAverage||0).toFixed(1)}</td><td class="admin-only ${adminMode?"":"hidden"}"><button class="danger" onclick="deleteOne('${x.id}')">Delete</button></td></tr>`).join("")||`<tr><td colspan="7">No survey data.</td></tr>`;
  document.querySelectorAll(".admin-only").forEach(el=>el.classList.toggle("hidden",!adminMode));
}
function showSurvey(){$("surveyView").classList.remove("hidden");$("dashboardView").classList.add("hidden")}
function showDashboard(){$("surveyView").classList.add("hidden");$("dashboardView").classList.remove("hidden");renderDashboard()}
function clearFilters(){["filterGuide","filterAccommodation","filterNationality","filterFrom","filterTo","filterMaxAvg"].forEach(id=>$(id).value="");renderDashboard()}
function download(name,content,type){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
function exportJson(){download("btis_v0_7_1_export.json",JSON.stringify(filtered(),null,2),"application/json")}
function csvEscape(v){return '"'+String(v??"").replaceAll('"','""')+'"'}
function exportCsv(){const rows=filtered();const keys=["createdAt","travellerName","nationality","ageGroup","travelType","guideName","accommodation","location","overallAverage","accommodationBest","accommodationImprove","guideNote","accommodationResponse"];const body=rows.map(r=>keys.map(k=>csvEscape(r[k])).join(","));download("btis_v0_7_1_export.csv",[keys.join(","),...body].join("\n"),"text/csv")}
function loadSample(){
  const now=new Date().toISOString();
  const sample=[
    {id:"sample1",createdAt:now,travellerName:"Hiro Dias",nationality:"Japan",ageGroup:"60–69",travelType:"Group",guideName:"George",accommodation:"Rasesa Lodge",location:"Rasesa",overallAverage:3.4,s7_r0:"4",s9_r0:"4",s10_r0:"2",s11_r0:"3",s12_r0:"3",s13_r0:"2",accommodationImprove:"Bathroom and accessibility need improvement.",guideNote:"Priority: toilet and step-free access."},
    {id:"sample2",createdAt:now,travellerName:"Sample Traveller",nationality:"South Africa",ageGroup:"40–49",travelType:"Family",guideName:"George",accommodation:"Rasesa Lodge",location:"Rasesa",overallAverage:4.2,s7_r0:"5",s9_r0:"4",s10_r0:"4",s11_r0:"4",s12_r0:"4",s13_r0:"3",accommodationImprove:"Breakfast could include more local food.",guideNote:"Food experience can connect with local products."}
  ];
  save([...load(),...sample]);renderDashboard();
}
function deleteOne(id){if(!confirm("Delete this survey?"))return;save(load().filter(x=>x.id!==id));renderDashboard()}
function deleteAll(){if(!confirm("Delete all survey data in this browser?"))return;save([]);renderDashboard()}
window.deleteOne=deleteOne;

$("nextBtn").onclick=next;
$("prevBtn").onclick=prev;
$("saveDraftBtn").onclick=saveDraft;
$("surveyForm").onsubmit=submitSurvey;
$("newSurveyBtn").onclick=()=>{showSurvey();currentScreen=0;renderScreen()};
$("dashboardBtn").onclick=showDashboard;
$("clearFilters").onclick=clearFilters;
$("exportCsv").onclick=exportCsv;
$("exportJson").onclick=exportJson;
$("loadSample").onclick=loadSample;
$("adminToggle").onclick=()=>{adminMode=!adminMode;$("adminToggle").textContent=adminMode?"Admin Mode ON":"Admin Mode";renderDashboard()};
$("deleteAll").onclick=deleteAll;
["filterGuide","filterAccommodation","filterNationality","filterFrom","filterTo","filterMaxAvg"].forEach(id=>$(id).oninput=renderDashboard);

const draft=JSON.parse(localStorage.getItem(DRAFT_KEY)||"{}");
currentScreen=Number(draft.currentScreen||0);
renderScreen();
