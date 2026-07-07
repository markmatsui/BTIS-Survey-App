const items = [
["Reservation","Was the booking handled clearly?"],
["Check-in","Was arrival smooth?"],
["Check-out","Was departure smooth?"],
["Cleanliness","Was the room and public area clean?"],
["Room Comfort","Was the room comfortable?"],
["Bathroom","Was the bathroom clean and working?"],
["Hot Water","Was hot water available when needed?"],
["Electricity & Power Outlets","Were plugs and power reliable?"],
["Food","Was food acceptable and suitable?"],
["Hospitality","Were staff kind and helpful?"],
["Security","Did the guest feel safe and secure?"],
["Wi-Fi / Communication","Was internet or communication adequate?"],
["Accessibility","Was movement easy for guests with luggage or disability?"],
["Value for Money","Was the stay worth the price?"],
["Overall Experience","Overall impression."]
];
let idx=0, currentId=null, ratings={}, itemComments={};

function all(){return JSON.parse(localStorage.getItem("btis_surveys_v04")||"{}")}
function saveAll(obj){localStorage.setItem("btis_surveys_v04",JSON.stringify(obj))}
function guides(){let g=JSON.parse(localStorage.getItem("btis_guides_v04")||"[]"); if(!g.length){g=[{name:"George", id:"DEMO-GEORGE"}]; localStorage.setItem("btis_guides_v04",JSON.stringify(g));} return g}
function saveGuides(g){localStorage.setItem("btis_guides_v04",JSON.stringify(g))}
function now(){return new Date().toLocaleString()}
function logAction(action){ if(!currentId)return; let db=all(); if(db[currentId]){db[currentId].history=db[currentId].history||[]; db[currentId].history.push({time:now(), action}); saveAll(db);} }
function go(id){document.querySelectorAll("main section").forEach(s=>s.classList.add("hidden"));document.getElementById(id).classList.remove("hidden"); if(id==="account") renderGuideSelect(); if(id==="settings") renderSettings(); if(id==="accounts") renderAccounts(); if(id==="dashboard") updateDashboard(); if(id==="review") renderReview();}
function renderGuideSelect(){let list=guides(); guideSelect.innerHTML=list.map(g=>`<option value="${g.name}">${g.name}</option>`).join("")+`<option value="__new__">+ New Guide</option>`; handleGuideSelect();}
function handleGuideSelect(){newGuideBox.classList.toggle("hidden", guideSelect.value!="__new__"); suggestTravellerId();}
function renderSettings(){guideList.innerHTML=guides().map(g=>`<div class="item"><b>${g.name}</b><br><span class="quiet">ID: ${g.id}</span></div>`).join("")}
function registerGuide(name,id){name=(name||"").trim(); id=(id||"").trim(); if(!name||!id){alert("Guide Name and Passport / National ID are required."); return false;} let g=guides(); if(!g.some(x=>x.name.toLowerCase()==name.toLowerCase())) g.push({name,id}); saveGuides(g); return true;}
function registerGuideFromAccount(){if(registerGuide(newGuideName.value,newGuideId.value)){renderGuideSelect(); guideSelect.value=newGuideName.value; newGuideBox.classList.add("hidden"); suggestTravellerId();}}
function registerGuideFromSettings(){if(registerGuide(settingsGuideName.value,settingsGuideId.value)){settingsGuideName.value="";settingsGuideId.value="";renderSettings();}}
function countryCode(n){return (n||"XX").trim().slice(0,2).toUpperCase().replace(/[^A-Z]/g,"X") || "XX"}
function cleanName(n){return (n||"GUEST").trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6) || "GUEST"}
function suggestTravellerId(){
 let name=travellerName.value.trim(); let nat=nationality.value.trim(); let guide=guideSelect.value=="__new__" ? newGuideName.value : guideSelect.value;
 if(!name||!nat||!guide){travellerId.value=""; return;}
 let db=all(); let existing=Object.values(db).find(s=>(s.travellerName||"").toLowerCase()==name.toLowerCase() && (s.nationality||"").toLowerCase()==nat.toLowerCase());
 if(existing){travellerId.value=existing.id; return;}
 let base=`BTIS-${countryCode(nat)}-${cleanName(name)}`;
 let n=1, id=`${base}-${String(n).padStart(3,"0")}`;
 while(db[id]){n++; id=`${base}-${String(n).padStart(3,"0")}`;}
 travellerId.value=id;
}
function createOrOpenAccount(){
 suggestTravellerId();
 if(guideSelect.value=="__new__"){alert("Please register the new guide first."); return;}
 let id=travellerId.value.trim(); if(!id){alert("Name / Nickname, Nationality, and Guide are required."); return;}
 let db=all();
 if(!db[id]) db[id]={id, travellerName:travellerName.value, nationality:nationality.value, guide:guideSelect.value, ratings:{}, itemComments:{}, history:[]};
 currentId=id; loadSurvey(db[id]); logAction("Account opened / created"); go("profile");
}
function loadSurvey(s){
 currentId=s.id; travellerId.value=s.id||""; travellerName.value=s.travellerName||""; nationality.value=s.nationality||"";
 renderGuideSelect(); guideSelect.value=s.guide||"George";
 accommodation.value=s.accommodation||""; location.value=s.location||""; travelType.value=s.travelType||"Solo"; purpose.value=s.purpose||"Holiday"; nights.value=s.nights||1; guests.value=s.guests||1;
 ratings=s.ratings||{}; itemComments=s.itemComments||{}; improve.value=s.improve||""; continueWell.value=s.continueWell||""; guideNote.value=s.guideNote||""; response.value=s.response||""; contactInfo.value=s.contactInfo||""; mayContact.checked=!!s.mayContact;
 if(inputMode) inputMode.value=s.inputMode||"guest";
 activeAccount.textContent="Traveller Account: "+currentId;
 updateMode();
}
function collect(){ saveItemComment(); return {id:currentId, travellerName:travellerName.value, nationality:nationality.value, guide:guideSelect.value, inputMode:inputMode ? inputMode.value : "guest", accommodation:accommodation.value, location:location.value, travelType:travelType.value, purpose:purpose.value, nights:nights.value, guests:guests.value, ratings, itemComments, improve:improve.value, continueWell:continueWell.value, guideNote:guideNote.value, response:response.value, contactInfo:contactInfo.value, mayContact:mayContact.checked, history:(all()[currentId]?.history||[])};}
function saveCurrent(action="Saved"){ if(!currentId)return; let db=all(); db[currentId]=collect(); saveAll(db); logAction(action); }
function startRatings(){saveCurrent("Entered rating screen");idx=0;showRating();go("ratings")}
function saveAndGo(id){saveCurrent("Saved and moved to "+id);go(id)}
function saveItemComment(){ if(document.getElementById("itemComment")) itemComments[items[idx][0]]=itemComment.value; }
function showRating(){
 const [name,hint]=items[idx];
 progressText.textContent=`Item ${idx+1} / ${items.length}`;
 ratingTitle.textContent=name;
 ratingHint.textContent=hint;
 ratingButtons.innerHTML="";
 for(let n=1;n<=5;n++){
   let b=document.createElement("button");
   b.textContent=n;
   b.onclick=()=>{
     saveItemComment();
     ratings[name]=n;
     showRating();
     setTimeout(()=>itemComment.focus(),0);
   };
   if(ratings[name]===n)b.classList.add("selected");
   ratingButtons.appendChild(b);
 }
 itemComment.value=itemComments[name]||"";
}
function nextRating(){saveItemComment();saveCurrent("Added / edited: "+items[idx][0]); if(idx<items.length-1){idx++;showRating()} else go("review")}
function prevRating(){saveItemComment();saveCurrent("Moved back from rating"); if(idx>0){idx--;showRating()} else go("profile")}
function renderReview(){ saveCurrent("Viewed review screen"); reviewList.innerHTML=items.map(([k])=>`<div class="item"><b>${k}</b>: ${ratings[k]||"-"}<br><span class="quiet">${itemComments[k]||""}</span></div>`).join("");}
function renderAccounts(){ let db=all(); accountList.innerHTML=Object.values(db).map(s=>`<div class="item"><b>${s.id}</b> ${s.travellerName||""}<br>${s.accommodation||""} ${s.nationality||""}<br><span class="quiet">${(s.history||[]).slice(-1)[0]?.action||""}</span><br><button onclick="openSurvey('${s.id}')">Open</button></div>`).join("") || "<p>No saved surveys.</p>";}
function openSurvey(id){let db=all(); loadSurvey(db[id]); logAction("Opened existing survey for viewing / editing"); go("profile")}
function finishSurvey(){saveCurrent("Finished and logged out"); currentId=null; go("home")}
function printCurrent(){saveCurrent("Printed draft / final"); let s=collect(); let rows=items.map(([k])=>`<tr><td>${k}</td><td>${s.ratings[k]||""}</td><td>${(s.itemComments[k]||"").replaceAll("<","&lt;")}</td></tr>`).join(""); printArea.innerHTML=`<div class="print-title">BTIS Accommodation Improvement Report</div><div class="print-box"><b>Traveller:</b> ${s.id||""} ${s.travellerName||""} / ${s.nationality||""}</div><div class="print-box"><b>Accommodation:</b> ${s.accommodation||""} / ${s.location||""} / Guide: ${s.guide||""}</div><div class="print-box"><table><tr><th>Item</th><th>Score</th><th>Optional Comment</th></tr>${rows}</table></div><div class="print-box"><b>Anything improved?</b><br>${s.improve||""}</div><div class="print-box"><b>Continue doing well?</b><br>${s.continueWell||""}</div><div class="print-box"><b>FOR BTIS USE ONLY — Guide's Note</b><br>${s.guideNote||""}</div><div class="tiny">Optional Contact not shared with accommodation: ${s.contactInfo||""}</div>`; window.print();}
function updateDashboard(){let db=Object.values(all()); surveyCount.textContent=db.length; let total=0,n=0,sums={},counts={}; db.forEach(s=>Object.entries(s.ratings||{}).forEach(([k,v])=>{total+=v;n++;sums[k]=(sums[k]||0)+v;counts[k]=(counts[k]||0)+1;})); if(!n){avgScore.textContent="-";priority.textContent="-";aiText.textContent="No surveys yet.";return} let av=Object.keys(sums).map(k=>[k,sums[k]/counts[k]]).sort((a,b)=>a[1]-b[1]); avgScore.textContent=(total/n).toFixed(1); priority.textContent=av[0][0]; aiText.textContent=`Current priority: ${av[0][0]} (${av[0][1].toFixed(1)} average).`;}
function updateMode(){
 const mode = inputMode ? inputMode.value : "guest";
 const guideSectionButton = document.getElementById("commentsNextBtn");
 if(guideSectionButton) guideSectionButton.textContent = mode==="guest" ? "Finish Guest Section" : "Next";
}
function nextAfterComments(){
 saveCurrent("Saved guest comments");
 const mode = inputMode ? inputMode.value : "guest";
 if(mode==="guest"){ go("contact"); }
 else { go("guide"); }
}
go("home");
