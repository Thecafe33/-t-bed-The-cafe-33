import {
  HERITAGE_REFERENCE_URL,
  SOURCE_CATALOG,
  contentSourced,
  visibleStop,
  cloneDefault,
  validateSite,
  escapeHTML as e,
  safeURL,
  eligible,
  canCollectStamp,
  passProgress,
  distanceMeters,
  POLICY_VERSION,
} from "./model.js";
import { icon, mark } from "./icons.js";
import { passArtwork, stampColor } from "./pass-art.js";
import {heritageSymbolHTML} from "./heritage-symbols.js";
import {JOURNEY,journeyState,journeyHTML} from "./journey.js";
import {campaignHomeHTML} from "./campaign-home.js";
import {placeCardHTML} from "./place-feed.js";
import {mountStoryCreator} from "./story-creator.js";
import { stampOutline } from "./stamp-shape.js";
import { appURL } from "./app-paths.js";
import { mountTownMap } from "./town-map.js";
import {ARTIFACTS,artifactsForPlaces} from "./artifacts.js";
import {artifactSection,artifactIndexHTML,artifactDetailHTML,getArtifact} from "./artifact-view.js";
import {ArtifactDeckState} from "./artifact-deck-state.js";
import {mountArtifactDeck} from "./artifact-deck.js";
import { initI18n, translateText, getLanguage, dateLocale } from "./i18n.js";
import { initEffects, revealView, playEffect, armSound, reducedMotion } from "./effects.js";
import * as cloud from "./cloud.js";
import { privacyHTML } from "./policy.js";
export const APP_BUILD='campaign-v1';
let site = cloneDefault(),
  filter = "heritage",
  profile = { name: "", badges: [], policyVersion: POLICY_VERSION },
  reviews = [],
  map,
  markerLayer,
  townMapLoad,
  reviewLoading = false,
  bookPage = 0,
  heritageGroup = "all";
let mapCategory = "all", mapSelectedId = null, mapHasFramed = false, userPoint = null, userMarker, mapJourneyOnly=false;
const mapMarkers = new Map();
let activeTab = null,
  reviewsRequested = false,
  passNeedsRender = true;
history.scrollRestoration = "manual";
const artifactDeckState=new ArtifactDeckState();
let artifactDeckUI=null,storyCreatorUI=null,storyProfileSignature='',profileEpoch=0,modalEpoch=0,navigationEpoch=0;
const tabScroll = {};
const tabTitles = {
  explore: "Khám phá",
  map: "Bản đồ",
  day: "Chuyến đi",
  pass: "Óc Eo Pass",
  community: "Cộng đồng",
};
const $ = (s) => document.querySelector(s),
  modal = $("#modal"),
  body = $("#modal-body");
function normalizedTab(hash = location.hash) {
  const value = hash.replace(/^#/, "");
  if(!value&&new URLSearchParams(location.search).get('journey')===JOURNEY.id)return 'day';
  const aliases = { home: "explore", memories: "community", passport: "pass" };
  return Object.hasOwn(tabTitles, value) ? value : aliases[value] || "explore";
}
function activateTab(tab, { focus = false } = {}) {
  if (activeTab === tab) return;
  navigationEpoch++;
  if (activeTab) tabScroll[activeTab] = window.scrollY;
  if (modal.open) modal.close();
  activeTab = tab;
  if(tab!=="map")closeMapSearch();
  document
    .querySelectorAll(".app-view[data-view]")
    .forEach((view) => (view.hidden = view.dataset.view !== tab));
  document.querySelectorAll(".app-tabbar [data-route]").forEach((link) => {
    if (link.dataset.route === tab) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.body.dataset.tab = tab;
  document.title = `${tabTitles[tab]} — Óc Eo townwalk`;
  if (
    tab === "pass" &&
    (passNeedsRender || !$("#pass-content").hasChildNodes())
  )
    showPassport();
  if (tab === "map") showTownMap();
  if (tab === "community" && !reviewsRequested) {
    reviewsRequested = true;
    loadReviews(true);
  }
  window.scrollTo({ top: tabScroll[tab] || 0, behavior: "instant" });
  revealView(document.querySelector(`.app-view[data-view="${tab}"]`));
  if (focus)
    document
      .querySelector(`[data-view="${tab}"] h1`)
      ?.focus({ preventScroll: true });
}
function navigate(tab) {
  if (activeTab === tab) {
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "instant" : "smooth" });
    return;
  }
  history.pushState(null, "", `#${tab}`);
  activateTab(tab, { focus: true });
}
window.addEventListener("popstate", () => activateTab(normalizedTab()));
window.addEventListener("hashchange", () => activateTab(normalizedTab()));
function hydrate(root = document) {
  root
    .querySelectorAll("[data-icon]")
    .forEach((el) => (el.innerHTML = icon(el.dataset.icon)));
  root.querySelectorAll("[data-mark]").forEach((el) => (el.innerHTML = mark));
}
function toast(s) {
  $("#toast").textContent = s;
  $("#toast").classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("show"), 5500);
}
function localRead(k, fallback) {
  try {
    return JSON.parse(localStorage.getItem(k)) || fallback;
  } catch {
    return fallback;
  }
}
function store(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    toast(
      "Trình duyệt không cho lưu dữ liệu. Óc Eo Pass có thể mất khi đóng trang.",
    );
    return false;
  }
}
const profileKey = () => `oceo-passport-${cloud.state.user?.uid || "guest"}`;
function readProfile() {
  profileEpoch++;
  if(modal.open&&modal.dataset.view==='story')modal.close();
  storyCreatorUI?.destroy();storyCreatorUI=null;storyProfileSignature='';
  passNeedsRender = true;
  const v = localRead(profileKey(), {});
  profile = {
    name: typeof v.name === "string" ? v.name.slice(0, 60) : "",
    badges: Array.isArray(v.badges)
      ? v.badges.filter((x) => typeof x === "string")
      : [],
    policyVersion: POLICY_VERSION,
  };
}
async function saveProfile() {
  const uid=cloud.state.user?.uid, data={...profile,badges:[...profile.badges]};
  store(profileKey(), data);
  renderCampaign();
  if (uid) {
    try {
      await cloud.saveProfile(data,uid);
    } catch (err) {
      if(cloud.state.user?.uid===uid)toast("Đã giữ trên máy, chưa đồng bộ: " + cloud.friendlyError(err));
    }
  }
}
function openModal(kicker, html, view = "generic") {
  modalEpoch++;
  artifactDeckUI?.destroy();artifactDeckUI=null;
  storyCreatorUI?.destroy();storyCreatorUI=null;storyProfileSignature='';
  modal.classList.toggle('story-dialog',view==='story'||view==='story-sample');
  modal.classList.toggle("artifact-deck-dialog",view==="artifacts");
  modal.classList.toggle("artifact-detail-dialog",view==="artifact");
  $("#artifact-back").hidden=view!=="artifact";
  $("#close-modal").setAttribute("aria-label",translateText(view==="artifact"?"← Về bộ thẻ cổ vật":"Đóng hộp thoại"));
  modal.dataset.view = view;
  delete modal.dataset.placeId;
  $("#modal-kicker").textContent = kicker;
  body.innerHTML = html;
  modal.classList.toggle("passport-dialog", view === "passport");
  hydrate(body);
  if (!modal.open) modal.showModal();
  modal.scrollTop = 0;
  body.scrollTop = 0;
}
function dismissModal(){
  if(modal.dataset.view==="artifact"){showArtifactIndex();return;}
  modal.close();
}
$("#close-modal").onclick = dismissModal;
$("#artifact-back").onclick = () => showArtifactIndex();
modal.addEventListener("cancel",event=>{
  if(modal.dataset.view==="artifact"){event.preventDefault();showArtifactIndex();}
});
modal.addEventListener("click", (ev) => {
  if (ev.target === modal) {
    const r = modal.getBoundingClientRect();
    if (
      ev.clientX < r.left ||
      ev.clientX > r.right ||
      ev.clientY < r.top ||
      ev.clientY > r.bottom
    )
      dismissModal();
  }
});
modal.addEventListener("close", () => {
  modalEpoch++;
  artifactDeckUI?.destroy();artifactDeckUI=null;
  storyCreatorUI?.destroy();storyCreatorUI=null;storyProfileSignature='';
  if (photoURL) {
    URL.revokeObjectURL(photoURL);
    photoURL = "";
  }
  photoBlob = null;
  photoGeneration++;
});
function empty(title, text) {
  return `<div class="empty-state"><h3>${title}</h3><p>${text}</p></div>`;
}
function renderPlaces() {
  document.body.classList.toggle(
    "is-searching",
    !!$("#place-search").value.trim(),
  );
  document.querySelectorAll("[data-filter]").forEach((b) => {
    b.classList.toggle("active", b.dataset.filter === filter);
    b.setAttribute("aria-pressed", String(b.dataset.filter === filter));
  });
  const source =
    filter === "heritage"
      ? site.places
      : site.stops
          .filter((p) =>
            filter === "food"
              ? p.category === "food"
              : ["rest", "stay"].includes(p.category),
          )
          .filter(visibleStop)
          .sort((a,b) => Number(b.featured === true) - Number(a.featured === true));
  const data = source.filter(
    (p) =>
      matchesSearch(p, $("#place-search").value) &&
      (filter !== "heritage" ||
        heritageGroup === "all" ||
        p.group === heritageGroup),
  );
  if(filter==='heritage')data.sort((a,b)=>Number(!!safeURL(b.image,{image:true}))-Number(!!safeURL(a.image,{image:true})));
  $("#data-note").textContent =
    filter === "heritage"
      ? `${site.places.length} hồ sơ: di tích khu A/B, nhà trưng bày và điểm khám phá tùy chọn. Không phải toàn bộ mọi di chỉ khảo cổ. Đọc nguồn riêng và lưu ý tiếp cận từng điểm; vị trí OSM là tham khảo.`
      : "Địa điểm có nguồn bản đồ và gợi ý địa phương tại Óc Eo. Dịch vụ, món và giá cần xác nhận với cơ sở; các món định vị theo mốc chỉ có mô tả, chưa gắn pin phỏng đoán.";
  $("#catalog-summary").textContent =
    `${data.length} địa điểm${filter === "heritage" ? " · " + site.places.filter(eligible).length + " có vị trí tham khảo" : ""}`;
  $("#heritage-groups").hidden = filter !== "heritage";
  document
    .querySelectorAll("[data-group]")
    .forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.group === heritageGroup)),
    );
  $("#places-grid").innerHTML = data.length
    ? data.map((p,i)=>placeCardHTML(p,i,{saved:savedSiteIds().includes(p.id)})).join('')
    : $("#place-search").value.trim()
      ? empty(
          "Chưa tìm thấy trong danh sách.",
          "Thử tên khác. Danh mục di tích vẫn đang được bổ sung, không phải toàn bộ các di tích tại xã Óc Eo.",
        )
      : empty(
          filter === "food"
            ? "Ăn ngon, nhưng phải đúng chỗ."
            : "Một chỗ nghỉ, đang chờ xác minh.",
          "Chưa có cơ sở được xác minh trong xã Óc Eo sau sáp nhập. Chúng mình sẽ cập nhật tên, địa chỉ và nguồn thực tế; không gợi ý quán hay nơi lưu trú giả.",
        );
  $('#places-grid').scrollLeft=0;
  catalogCardObserver.disconnect();
  $('#places-grid').querySelectorAll('.feed-card').forEach(card=>catalogCardObserver.observe(card));
  requestAnimationFrame(syncCatalogShelf);
}
function syncCatalogShelf(){
 const rail=$('#places-grid'),max=rail.scrollWidth-rail.clientWidth;
 // Size the shelf to the card in view, so a longer warning far along the shelf
 // does not leave empty space below every other stop. Search keeps natural height.
 if(document.body.classList.contains('is-searching'))rail.style.height='';
 else if(rail.clientWidth){
  const bounds=rail.getBoundingClientRect();
  const cards=[...rail.querySelectorAll('.feed-card')];
  const current=cards.reduce((best,card)=>Math.abs(card.getBoundingClientRect().left-bounds.left)<Math.abs(best.getBoundingClientRect().left-bounds.left)?card:best,cards[0]);
  rail.style.height=current?`${Math.ceil(current.getBoundingClientRect().height)+26}px`:'';
 }
 document.querySelectorAll('[data-catalog-move]').forEach(button=>button.disabled=Number(button.dataset.catalogMove)<0?rail.scrollLeft<3:rail.scrollLeft>=max-3);
}
const catalogCardObserver=new ResizeObserver(syncCatalogShelf);
$('#places-grid').addEventListener('scroll',syncCatalogShelf,{passive:true});
window.addEventListener('resize',syncCatalogShelf);
function normalizedSearch(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase();
}
function matchesSearch(place, query) {
  const text = normalizedSearch(
    [place.name, ...(Array.isArray(place.aliases) ? place.aliases : []), ...ARTIFACTS.filter(a=>a.placeId===place.id||a.displayPlaceId===place.id).flatMap(a=>a.name)].join(
      " ",
    ),
  );
  const q=normalizedSearch(query).trim();
  return q.split(/\s+/).every(word=>text.includes(word)) || text.replace(/\s+/g,"").includes(q.replace(/\s+/g,""));
}
function mapPlaces() {
  return [...site.places, ...site.stops.filter(visibleStop)].filter((p) =>
    (!mapJourneyOnly||JOURNEY.stops.includes(p.id)) &&
    (mapCategory === "all" || p.category === mapCategory) &&
    matchesSearch(p, $("#map-search").value));
}
function coordinateLabel(p) {
  const url = safeURL(p.coordinateSource);
  return url.includes("openstreetmap.org/") ? "Bản đồ cộng đồng" :
    url.includes("google.com/maps") ? "Trang địa điểm Google Maps" : "Nguồn vị trí";
}
function renderHomeStories() {
  const stories = [
    {id:"go-giong-cat", className:"story-ring", icon:"gem", tag:"01 / CỔ VẬT KỂ CHUYỆN", title:"Nhẫn cổ kể chuyện gì?", action:"Mở chuyện Giồng Cát"},
    {id:"xofa", className:"story-drink", icon:"coffee", tag:"02 / MỘT NGỤM ÓC EO", title:"Vị Phù Nam, phiên bản hôm nay.", action:"Thử Sữa Gạo Phù Nam"},
    {id:"nha-trung-bay-cu-ba-the", className:"story-mountain", icon:"compass", tag:"03 / MỘT GÓC BA THÊ", title:"Trên núi, có gì khác?", action:"Đọc lưu ý trước khi đi"},
  ].filter(story=>findPlace(story.id));
  $("#curiosity-trail").innerHTML=stories.map(story=>`<button class="curiosity-card ${story.className}" data-place="${e(story.id)}"><small>${story.tag}</small><span class="story-art" aria-hidden="true">${icon(story.icon)}</span><strong>${story.title}</strong><span>${story.action} ${icon("arrowup")}</span></button>`).join("");
  $(".curiosity-section").hidden=!stories.length;
  $("#surprise-me").disabled=!site.places.some(p=>p.collectible!==false && contentSourced(p));
}
let lastSurprise;
$("#surprise-me").onclick=()=>{
  const pool=site.places.filter(p=>p.collectible!==false && contentSourced(p));
  const candidates=pool.filter(p=>p.id!==lastSurprise), choices=candidates.length?candidates:pool;
  const picked=choices[Math.floor(Math.random()*choices.length)];
  if(picked){lastSurprise=picked.id;placeDetail(picked.id);}
};
function renderMapSelection() {
  const visible=mapPlaces(), located=visible.filter(eligible);
  const p=visible.find(p=>p.id===mapSelectedId && eligible(p)) || ($("#map-search").value.trim() && located.length===1?located[0]:null);
  if(p){
    const distance=userPoint?Math.round(distanceMeters(userPoint,p)):null;
    const detail=distance===null?`${p.duration} phút gợi ý`:`${distance} m · đường chim bay`;
    $("#map-selection").innerHTML=`<div class="map-card-top"><div class="map-card-art">${safeURL(p.image,{image:true})?`<img src="${e(safeURL(p.image,{image:true}))}" alt="">`:icon(p.symbol)}</div><div class="map-card-copy"><small>${p.category==="heritage"?"CHẠM DI SẢN":p.category==="stay"?"NGHỈ LẠI ÓC EO":"DỪNG MỘT CHÚT"}</small><h2>${e(p.name)}</h2><p>${detail}</p></div></div><div class="map-card-actions"><button class="button" data-place="${e(p.id)}">Khám phá ${icon("arrowup")}</button><a class="button outline" href="https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}" target="_blank" rel="noopener noreferrer">Mở vị trí ${icon("map")}</a></div>`;
  }else{
    const preferred=["chua-linh-son","go-cay-thi","xofa"].map(findPlace).filter(p=>p && located.some(v=>v.id===p.id));
    const jumps=(preferred.length?preferred:located).slice(0,3);
    $("#map-selection").innerHTML=`<div class="map-selection-empty"><h2>${located.length?"Đi đâu tiếp nhỉ?":"Có câu chuyện, chưa có pin."}</h2><p>${located.length?"Chạm pin để xem điểm đến. Cụm số chứa các điểm gần nhau.":"Xem mô tả và mốc địa phương trong danh sách bên dưới."}</p><div class="map-quick-jumps">${jumps.length?jumps.map(p=>`<button data-map-jump="${e(p.id)}">${e(p.name)}</button>`).join(""):'<button data-open-map-directory>Danh sách điểm đến ↓</button>'}</div></div>`;
  }
}
function selectMapPlace(id) {
  const p=findPlace(id);if(!p || !eligible(p))return;
  mapSelectedId=id;
  for(const [key,marker] of mapMarkers){marker.getElement()?.classList.toggle("is-selected",key===id);marker.setZIndexOffset(key===id?1000:0);}
  renderMapSelection();revealView($("#map-selection"));
  if(map){map.setView([p.lat,p.lng],Math.max(map.getZoom(),17),{animate:false});if(map.getSize().y<420)map.panBy([0,18],{animate:false});const marker=mapMarkers.get(id);if(marker)markerLayer.zoomToShowLayer(marker,()=>{marker.getElement()?.classList.add("is-selected");marker.openTooltip();});}
}
function fitMapPoints() {
  const points=mapPlaces().filter(eligible);
  if(map && points.length){const compact=map.getSize().y<420;map.fitBounds(points.map(p=>[p.lat,p.lng]),{paddingTopLeft:[35,compact?118:127],paddingBottomRight:[62,compact?130:218],maxZoom:16,animate:false});mapHasFramed=true;}
}
function openMapDirectory(){
  closeMapSearch();
  $("#map-directory").open=true;
  $("#map-directory").scrollIntoView({block:"start",behavior:reducedMotion()?"instant":"smooth"});
}
function renderMapSearchResults(){
  const visible=mapPlaces(), query=$("#map-search").value.trim();
  const suggested=["chua-linh-son","go-cay-thi","xofa"].map(findPlace).filter(p=>p && visible.some(v=>v.id===p.id));
  const results=query?visible.slice(0,8):(suggested.length?suggested:visible.slice(0,3));
  $("#map-search-count").textContent=query?`${visible.length} kết quả`:"Gợi ý cho chuyến đi";
  $("#clear-map-search").hidden=!query;
  $("#toggle-map-search").dataset.searchActive=String(!!query);
  $("#map-search-results").innerHTML=results.length?results.map(p=>`<button class="map-search-result" data-map-result="${e(p.id)}">${icon(p.symbol)}<span><strong>${e(p.name)}</strong><small>${eligible(p)?"Xem điểm trên bản đồ":"Có câu chuyện · vị trí đang bổ sung"}</small></span>${icon("arrowup")}</button>`).join(""):'<p class="map-search-empty">Chưa tìm thấy tên này trong danh sách đang biên tập.</p>';
  if(query && visible.length>8)$("#map-search-results").insertAdjacentHTML("beforeend",'<button class="text-button" data-open-map-directory>Xem toàn bộ kết quả ↓</button>');
}
function closeMapSearch({returnFocus=false}={}){
  $("#map-search-panel").hidden=true;
  $("#toggle-map-search").setAttribute("aria-expanded","false");
  if(returnFocus)$("#toggle-map-search").focus({preventScroll:true});
}
function openMapSearch(){
  $("#map-search-panel").hidden=false;
  $("#toggle-map-search").setAttribute("aria-expanded","true");
  renderMapSearchResults();
  $("#map-search").focus({preventScroll:true});
}
$("#toggle-map-search").onclick=()=>$("#map-search-panel").hidden?openMapSearch():closeMapSearch({returnFocus:true});
$("#close-map-search").onclick=()=>closeMapSearch({returnFocus:true});
$("#clear-map-search").onclick=()=>{$("#map-search").value="";renderMap();$("#map-search").focus({preventScroll:true});};
document.addEventListener("keydown",ev=>{if(ev.key==="Escape"&&!$("#map-search-panel").hidden){ev.preventDefault();closeMapSearch({returnFocus:true});}});
document.addEventListener("click",ev=>{
  if(!$("#map-search-panel").hidden && !ev.target.closest("#map-search-panel,#toggle-map-search"))closeMapSearch();
  const result=ev.target.closest("[data-map-result]");
  if(result){const p=findPlace(result.dataset.mapResult);closeMapSearch({returnFocus:true});if(p){if(eligible(p))selectMapPlace(p.id);else placeDetail(p.id);}}
});
function renderMap() {
  const visible = mapPlaces();
  const located = visible.filter(eligible).length;
  document.querySelectorAll("[data-map-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mapCategory === mapCategory);
    button.setAttribute("aria-pressed", String(button.dataset.mapCategory === mapCategory));
  });
  $("#map-inventory-count").textContent =
    `${visible.length} địa điểm / gợi ý · ${located} có pin. Nguồn từng vị trí ghi trong chi tiết.`;
  $("#map-list").innerHTML = visible.length
    ? visible
        .map(
          (p) =>
            `<button class="map-list-item" data-place="${e(p.id)}">${icon(p.symbol)}<span>${e(p.name)}<small>${p.collectible === false ? "Hidden gem tùy chọn · đọc lưu ý đường núi" : eligible(p) ? "Có vị trí tham khảo" : p.localRecommendation ? p.address || "Gợi ý địa phương · chưa có pin" : "Có tư liệu · đang bổ sung vị trí"}</small></span>${icon("arrowup")}</button>`,
        )
        .join("")
    : '<p class="map-search-empty">Chưa tìm thấy tên này trong danh sách đang biên tập.</p>';
  $("#map-result-count").textContent=`${visible.length} điểm`;
  if(mapSelectedId && !visible.some(p=>p.id===mapSelectedId))mapSelectedId=null;
  renderMapSelection();
  renderMapSearchResults();
  if ($("#map-search").value.trim()) $("#map-directory").open=true;
  if (map) renderMarkers({fit:true});
}
function renderTimeline() {
  $("#timeline").innerHTML = site.itinerary
    .map(
      (s) =>
        `<article class="timeline-row"><time>${e(s.time)}</time><div><h3>${e(s.title)}</h3><p>${e(s.description)}</p>${s.placeId ? `<button class="text-button" data-place="${e(s.placeId)}">Xem điểm dừng ${icon("arrow")}</button>` : ""}</div></article>`,
    )
    .join("");
}
function renderSite() {
  renderCampaign();
  renderHomeStories();
  passNeedsRender = true;
  renderPlaces();
  renderMap();
  renderTimeline();
  renderSavedTrip();
  if (activeTab === "pass") showPassport();
}
function findPlace(id) {
  return [...site.places, ...site.stops].find((p) => p.id === id);
}
function showArtifactIndex(selected=artifactDeckState.selected){
 const returning=modal.open&&modal.dataset.view==="artifact";
 closeMapSearch();
 const available=artifactsForPlaces(site.places);
 artifactDeckState.selected=selected==='all'||available.some(a=>a.placeId===selected)?selected:'all';
 openModal("THEO DẤU CỔ VẬT",artifactIndexHTML(site.places,artifactDeckState.selected),"artifacts");
 artifactDeckUI=mountArtifactDeck({root:body,dialog:modal,state:artifactDeckState,places:site.places,onOpen:showArtifact});
 if(returning)$("#artifact-open")?.focus({preventScroll:true});
}
function showArtifact(id){
 const a=artifactsForPlaces(site.places).find(a=>a.id===id);if(!a)return;
 closeMapSearch();openModal("HIỆN VẬT ↔ ĐỊA ĐIỂM",artifactDetailHTML(a,site.places),"artifact");
 $("#artifact-back").focus({preventScroll:true});
}
function placeDetail(id) {
  closeMapSearch();
  const p = findPlace(id);
  if (!p) return;
  const valid = eligible(p),
    sourced = contentSourced(p);
  const saved = savedSiteIds().includes(p.id);
  openModal(
    p.group
      ? `ÓC EO / ${p.group === "A" ? "NÚI BA THÊ" : "ĐÔ THỊ ÓC EO"}`
      : "ÓC EO / ĐIỂM DỪNG",
    `
 <div class="eyebrow">${e(p.label)}</div><h2>${e(p.name)}</h2>
 ${p.accessWarning ? `<aside class="access-warning" aria-label="Lưu ý đường đi"><strong>${icon("compass")} Lưu ý đường đi</strong><p>${e(p.accessWarning)}</p>${p.collectible === false ? "<small>Điểm tùy chọn · không cần ghé để hoàn thành Óc Eo Pass.</small>" : ""}</aside>` : ""}
 ${p.bookingNotice ? `<aside class="booking-notice"><strong>${icon("coffee")} Nghỉ đúng lúc. Đặt trước nhé.</strong><p>${e(p.bookingNotice)}</p>${safeURL(p.bookingUrl) ? `<a class="button dark" id="book-stop" href="${e(safeURL(p.bookingUrl))}" target="_blank" rel="noopener noreferrer">${e(p.bookingLabel || "Đặt lịch trước")} ${icon("arrowup")}</a>` : ""}</aside>` : ""}
 ${!p.recordType && p.aliases?.length ? `<p class="detail-alias">Còn tìm thấy bằng: ${e(p.aliases.join(" · "))}</p>` : ""}
 <div class="detail-illustration ${safeURL(p.image, { image: true }) ? "has-photo" : ""} ${["butter", "lavender", "peach", "lime"].includes(p.color) ? p.color : "butter"}">${safeURL(p.image, { image: true }) ? `<img src="${e(safeURL(p.image, { image: true }))}" alt="${e(p.name)}">` : icon(p.symbol)}</div>
 ${p.imageCredit ? `<p class="photo-credit">Ảnh: ${e(p.imageCredit)} ${safeURL(p.imageSource) ? `<a href="${e(safeURL(p.imageSource))}" target="_blank" rel="noopener noreferrer">Nguồn ảnh ↗</a>` : ""}</p>` : ""}
 ${p.hook ? `<h3 class="detail-hook">${e(p.hook)}</h3>` : ""}<p class="detail-description">${e(p.description)}</p>
 ${p.lookFor ? `<div class="look-for">${icon("compass")}<div><strong>Thử nhìn kỹ hơn</strong><p>${e(p.lookFor)}</p></div></div>` : ""}
 ${artifactSection(p,site.places)}
 <div class="visit-facts"><span>${icon("clock")} ${e(p.duration)} phút gợi ý</span><span>${icon("sun")} ${e(p.hours || "Hỏi giờ đón khách")}</span></div>
 ${p.category !== "heritage" ? `<div class="stop-facts">${p.address ? `<p>${icon("pin")} ${e(p.address)}</p>` : ""}${p.price ? `<p>${icon("coffee")} ${e(p.price)}</p>` : ""}</div>` : ""}
 ${canCollectStamp(p) ? `<p class="gps-zone">${icon("pin")} Nhận tem trong bán kính ${Math.min(site.radius,p.checkInRadius || site.radius)} m quanh vị trí tham khảo, sau khi GPS xác định thành công.</p>` : ""}
 <p class="detail-description">${e(p.note || "")}</p>
 <div class="notice ${valid ? "" : "warning"}">${p.collectible === false ? "Điểm tùy chọn, không phát tem và không tính vào tiến độ Óc Eo Pass. Chưa xác nhận quyền tiếp cận hoặc tọa độ công trình." : valid ? "Pin là vị trí tham khảo. Xác nhận đúng lối vào và giờ đón khách trước khi đến." : sourced ? (p.category==="heritage"?"Nội dung đã đối chiếu tư liệu. Chưa có tọa độ đủ căn cứ; chưa mở chỉ đường và nhận tem tại điểm này.":"Danh bạ tham khảo, chưa xác nhận hoạt động. Mở nguồn gốc hoặc gọi kiểm tra trước khi đến.") : p.localRecommendation && p.category !== "heritage" ? "Gợi ý theo mốc địa phương; chưa đủ tọa độ gắn pin. Hỏi đúng điểm bán, giờ phục vụ và giá trước khi ghé." : "Thông tin đang được đối chiếu; chưa mở chỉ đường hoặc nhận tem."}</div>
 ${valid && p.coordinateNote ? `<details class="coordinate-details"><summary>Về vị trí trên bản đồ</summary><p>${e(p.coordinateNote)}</p></details>` : ""}
 <div class="source-links">${safeURL(p.sourceUrl) ? `<a href="${e(safeURL(p.sourceUrl))}" target="_blank" rel="noopener noreferrer">${icon("leaf")} Đọc nguồn ${e(p.sourceLabel || (p.category === "heritage" ? "Ban Quản lý" : "OpenStreetMap"))} ↗</a>` : p.category === "heritage" ? `<a class="heritage-reference" href="${HERITAGE_REFERENCE_URL}" target="_blank" rel="noopener noreferrer">Tra cứu tư liệu Óc Eo ↗</a>` : `<span class="local-source-note">Gợi ý địa phương · cập nhật ${e(p.contentReviewedAt || "")}</span>`}${safeURL(p.coordinateSource) ? `<a href="${e(safeURL(p.coordinateSource))}" target="_blank" rel="noopener noreferrer">${e(coordinateLabel(p))} ↗</a>` : ""}</div>
 <div class="detail-actions">${p.phone && /^\+?[0-9]{9,15}$/.test(p.phone) ? `<a class="button outline" href="tel:${e(p.phone)}">${e(p.phoneLabel || "Gọi cơ sở · số công khai")}</a>` : ""}${valid ? `<a class="button outline" href="https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}" target="_blank" rel="noopener noreferrer">Mở vị trí ${icon("map")}</a><button class="button outline" id="focus-on-map">Xem trong app ${icon("pin")}</button>` : ""}${p.category === "heritage" && p.collectible !== false ? `<button class="button dark" id="checkin" ${!canCollectStamp(p) ? "disabled" : ""}>${profile.badges.includes(p.id) ? "Đã có tem · xem Pass" : "Mình đang ở đây"} ${icon("pin")}</button>` : ""}</div>
 <button class="button outline full-width" id="share-place">${icon("arrowup")} Gửi điểm này cho bạn bè</button><button class="button outline full-width" id="save-place">${icon(saved ? "check" : "heart")} ${saved ? "Đã lưu vào chuyến đi" : "Lưu vào chuyến đi"}</button>
 <small class="detail-privacy">GPS chỉ dùng khi nhận tem, không lưu tọa độ. Đặt tên di tích vào danh sách lưu không xác nhận địa điểm đang mở cửa.</small>`,
    "place",
  );
  modal.dataset.placeId=p.id;
  $("#share-place").onclick = async () => {
    const url = new URL(location.origin + location.pathname);
    url.searchParams.set("place", p.id);
    url.hash = "explore";
    try {
      if (navigator.share)
        await navigator.share({
          title: `${p.name} · Óc Eo Townwalk`,
          text: p.hook || p.name,
          url: url.href,
        });
      else {
        await navigator.clipboard.writeText(url.href);
        toast("Đã sao chép liên kết điểm đến.");
      }
    } catch (err) {
      if (err.name !== "AbortError")
        prompt(translateText("Sao chép liên kết điểm đến:"), url.href);
    }
  };
  if ($("#checkin")) $("#checkin").onclick = () => checkIn(p);
  $("#save-place").onclick = () => {
    let list = savedSiteIds();
    list = list.includes(p.id)
      ? list.filter((x) => x !== p.id)
      : [...list, p.id];
    store("oceo-saved-sites", list);
    placeDetail(p.id);
    renderSavedTrip();
  };
  $("#focus-on-map")?.addEventListener("click", () => {
    mapCategory = "all";
    $("#map-search").value = "";
    renderMap();
    navigate("map");
    requestAnimationFrame(() => selectMapPlace(p.id));
  });
}
function savedSiteIds() {
  const value = localRead("oceo-saved-sites", []);
  return Array.isArray(value)
    ? value.filter((id) => typeof id === "string")
    : [];
}
function renderSavedTrip() {
  const ids = savedSiteIds(),
    places = [...site.places, ...site.stops].filter((p) => ids.includes(p.id));
  $("#saved-trip").innerHTML = places.length
    ? `<div class="saved-trip"><h3>Chuyến đi bạn đã lưu <span>${places.length}</span></h3>${places.map((p) => `<button data-place="${e(p.id)}">${icon(p.symbol)} ${e(p.name)} ${icon("arrowup")}</button>`).join("")}<small>Đây là danh sách cá nhân, chưa tối ưu đường đi.</small></div>`
    : "";
  document.querySelectorAll('[data-save-place]').forEach(button=>{
    const saved=ids.includes(button.dataset.savePlace);button.classList.toggle('is-saved',saved);button.setAttribute('aria-pressed',String(saved));button.setAttribute('aria-label',translateText(saved?'Bỏ lưu điểm':'Lưu điểm'));button.innerHTML=icon(saved?'check':'heart');
  });
}
function journeyKey(){return `${profileKey()}:journey`;}
function journeyIsActive(){
  const value=localRead(journeyKey(),null);
  return value?.id===JOURNEY.id&&value?.version===JOURNEY.version&&value?.active===true;
}
function journeyShareURL(){
  const url=new URL(appURL('index.html'));
  url.searchParams.set('journey',JOURNEY.id);url.hash='day';
  return url.href;
}
function renderCampaign(){
  const state=journeyState(site,profile.badges),active=journeyIsActive();
  $('#campaign-home').innerHTML=campaignHomeHTML({active,count:state.count,total:state.total,canStory:state.canStory});
  $('#campaign-journey').innerHTML=journeyHTML(site,profile.badges,{active});
  $('#journey-map-bar').innerHTML=`<button data-journey-action="${mapJourneyOnly?'all-map':'map'}" aria-pressed="${mapJourneyOnly}">${icon(mapJourneyOnly?'check':'map')}<span>${mapJourneyOnly?'Đang xem ba chặng':'Xem ba chặng theo dấu cổ vật'}</span></button>${mapJourneyOnly?'<button class="text-button" data-journey-action="all-map">Xem toàn bộ địa điểm</button>':''}`;
  if(storyCreatorUI&&storyProfileSignature!==JSON.stringify(state.pass.earned.map(p=>p.id))){
    storyCreatorUI.destroy();storyCreatorUI=null;storyProfileSignature='';modal.close();
    toast('Bộ tem đã thay đổi. Mở lại công cụ để dùng tiến độ mới.');
  }
  hydrate($('#campaign-home'));hydrate($('#campaign-journey'));
}
function openJourney(){if(modal.open)modal.close();navigate('day');window.scrollTo({top:0,behavior:'instant'});$('#day-heading').focus({preventScroll:true});}
function openPersonalStory(){
  const {earned}=passProgress(site.places,profile.badges);
  if(!earned.length){showStorySample();return;}
  const name=(activeTab==='pass'?$('#passport-name')?.value:profile.name)||profile.name;
  openModal('ÓC EO, CÓ DẤU TÔI.', '<div id="story-creator-root"></div>','story');
  storyProfileSignature=JSON.stringify(earned.map(p=>p.id));
  storyCreatorUI=mountStoryCreator({root:$('#story-creator-root'),places:site.places,earned,
    name,locale:getLanguage(),journeyURL:journeyShareURL(),journeyCount:journeyState(site,profile.badges).count,
    journeyIds:[...JOURNEY.stops],onClose:()=>modal.close(),onToast:toast});
}
function showStorySample(){
  const image=appURL(`assets/previews/oc-eo-personal-story-${getLanguage()}.webp`);
  openModal('ÓC EO, CÓ DẤU TÔI.',`<section class="story-sample"><h2>Chuyến đi của bạn sẽ trông thế nào?</h2><p>Đây là mẫu story để xem bố cục. Có một tem thật, bạn có thể chọn ảnh của mình và tạo story riêng.</p><img src="${image}" alt="Ảnh mẫu story cá nhân Óc Eo, có ghi rõ đây là minh hoạ" width="1080" height="1920"><p class="story-privacy">Ảnh Ba Thê: Bùi Thụy Đào Nguyên · CC BY-SA 3.0. Bố cục và tem trong mẫu dùng để minh hoạ.</p><button class="button dark" data-journey-action="open">Chọn chuyến để nhận tem đầu tiên</button><a class="text-button" href="${image}" download="oc-eo-story-sample.webp">Mở mẫu và tải ảnh ↗</a><a class="text-button" href="${appURL('elio-pass-preview.html')}" target="_blank" rel="noopener noreferrer">Xem poster bộ sưu tập ↗</a></section>`,'story-sample');
}
async function copyJourneyLink(){
  const url=journeyShareURL();
  try{await navigator.clipboard.writeText(url);toast('Đã sao chép liên kết chuyến đi.');}
  catch{prompt(translateText('Sao chép liên kết chuyến đi:'),url);}
}
async function shareJourney(){
  if(!navigator.share){await copyJourneyLink();return;}
  try{await navigator.share({title:'Óc Eo Townwalk',text:translateText('Cùng theo dấu cổ vật ở Óc Eo.'),url:journeyShareURL()});}
  catch(err){if(err.name!=='AbortError')await copyJourneyLink();}
}
async function packJourney(button){
  if(!navigator.serviceWorker?.controller||!('caches' in window)){
    toast('Ứng dụng chưa lưu xong. Giữ kết nối và thử lại sau.');return;
  }
  button.disabled=true;button.setAttribute('aria-busy','true');
  try{
    const root=new URL(appURL()),prefix=`oceo-townwalk:${encodeURIComponent(root.pathname)}:`;
    const cacheName=(await caches.keys()).find(k=>k.startsWith(prefix));
    if(!cacheName)throw Error('cache');
    const cache=await caches.open(cacheName),assets=new URL(appURL('assets/'));
    const images=journeyState(site,profile.badges).stops.map(s=>s.place?.image).filter(Boolean).map(p=>safeURL(p,{image:true})).filter(Boolean).filter(p=>{const u=new URL(p);return u.origin===assets.origin&&u.pathname.startsWith(assets.pathname);});
    await Promise.all(images.map(async url=>{if(await cache.match(url))return;const r=await fetch(url);if(!r.ok)throw Error('photo');await cache.put(url,r);}));
    toast('Đã chuẩn bị bản đồ và tư liệu trên thiết bị này. Link nguồn và đặt chỗ cần mạng.');
  }catch{toast('Chưa chuẩn bị xong. Giữ kết nối rồi thử lại.');}
  finally{if(button.isConnected){button.disabled=false;button.removeAttribute('aria-busy');}}
}
async function checkIn(p) {
  if (!canCollectStamp(p)) return;
  if (profile.badges.includes(p.id)) {
    showPassport();
    return;
  }
  if (!navigator.geolocation) {
    toast("Thiết bị không hỗ trợ định vị.");
    return;
  }
  armSound();
  const btn = $("#checkin");
  const owner=profileKey(),epoch=profileEpoch;
  btn.disabled = true;
  btn.textContent = "Đang xác định vị trí…";
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const current=findPlace(p.id);
      if(owner!==profileKey()||epoch!==profileEpoch)return;
      if(!current||!canCollectStamp(current)||current.lat!==p.lat||current.lng!==p.lng){toast('Điểm nhận tem đã thay đổi. Mở lại hồ sơ trước khi thử.');return;}
      const radius=Math.min(site.radius,current.checkInRadius||site.radius);
      const distance = distanceMeters(
        { lat: pos.coords.latitude, lng: pos.coords.longitude },
        p,
      );
      if (pos.coords.accuracy > Math.min(100, radius)) {
        toast("GPS chưa đủ chính xác. Ra nơi thoáng và thử lại.");
        if (modal.open&&modal.dataset.view === "place"&&modal.dataset.placeId===p.id) placeDetail(p.id);
        return;
      }
      if (distance > radius) {
        toast(
          `Bạn còn cách điểm khoảng ${Math.round(distance)} m. Cần ở trong bán kính ${radius} m để nhận tem.`,
        );
        if (modal.open&&modal.dataset.view === "place"&&modal.dataset.placeId===p.id) placeDetail(p.id);
        return;
      }
      if (!profile.badges.includes(p.id)) { profile.badges.push(p.id); playEffect("stamp"); }
      await saveProfile();
      if(owner!==profileKey()||epoch!==profileEpoch)return;
      toast("Một nơi đã đến. Một con tem mới!");
      bookPage = 0;
      showPassport();
    },
    (err) => {
      if(owner!==profileKey()||epoch!==profileEpoch)return;
      toast(
        err.code === 1
          ? "Bạn chưa cho phép định vị. Có thể tiếp tục khám phá mà không check-in."
          : "Chưa lấy được vị trí. Thử lại ngoài trời hoặc kiểm tra GPS.",
      );
      if (modal.open&&modal.dataset.view === "place"&&modal.dataset.placeId===p.id) placeDetail(p.id);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
}
function renderMarkers({fit=false} = {}) {
  markerLayer.clearLayers();
  mapMarkers.clear();
  const verified = mapPlaces().filter(eligible);
  for (const p of verified) {
    const marker = L.marker([p.lat, p.lng], {
      icon: L.divIcon({
        className: `osm-pin pin-${p.category}${p.id===mapSelectedId?" is-selected":""}`,
        html: icon(p.symbol),
        iconSize: [44, 44],
        iconAnchor: [22, 35],
      }),
      title: p.name,
      alt: p.name,
    }).addTo(markerLayer);
    marker.bindTooltip(e(p.name), {permanent: p.featured === true, direction: p.featured === true ? "auto" : "top", offset: p.featured === true ? [0,0] : [0,-18], className: "townwalk-map-label"});
    mapMarkers.set(p.id,marker);
    marker.on("click", () => selectMapPlace(p.id));
  }
  if (fit || !mapHasFramed) fitMapPoints();
  $("#map-disclaimer").textContent = verified.length
    ? `${verified.length} vị trí tham khảo trên bản đồ Óc Eo Townwalk. Thiết kế riêng từ dữ liệu mở; nguồn tọa độ được giữ trong từng hồ sơ. Phạm vi minh hoạ theo OSM, không thay thế bản đồ hành chính pháp lý.`
    : "Không có pin phù hợp bộ lọc này. Một số gợi ý mới chỉ có mốc tương đối; xem mô tả trong danh sách.";
}
function showTownMap() {
  if (!window.L) {
    $("#map-network-state").hidden = false;
    return;
  }
  if (!map) {
    // Instant zoom keeps tiles sharp when switching views and under reduced-motion CSS.
    map = L.map("osm-map", { maxZoom:19, scrollWheelZoom: false, zoomAnimation: false,
      fadeAnimation: false, markerZoomAnimation: false }).setView(
      [10.2557721, 105.1534925],
      13,
    );
    map.zoomControl.setPosition("topright");
    markerLayer = L.markerClusterGroup({animate:false,showCoverageOnHover:false,maxClusterRadius:40,disableClusteringAtZoom:18,spiderfyOnMaxZoom:true,iconCreateFunction:cluster=>L.divIcon({className:"map-cluster",html:`<span data-cluster-count="${cluster.getChildCount()}" aria-label="${cluster.getChildCount()} điểm gần nhau, chạm để phóng to">${cluster.getChildCount()}</span>`,iconSize:[46,46]})}).addTo(map);
    loadTownCartography();
  }
  requestAnimationFrame(() => {
    map.invalidateSize();
    renderMarkers();
  });
}
function loadTownCartography(){
  if(townMapLoad)return townMapLoad;
  $("#map-loading").hidden=false;
  townMapLoad=mountTownMap(map).then(()=>{
    $("#map-loading").hidden=true;$("#map-network-state").hidden=true;
  }).catch(()=>{
    townMapLoad=null;$("#map-loading").hidden=true;$("#map-network-state").hidden=false;
  });
  return townMapLoad;
}
function retryMap() {showTownMap();loadTownCartography();}
$("#reload-map").onclick = retryMap;
$("#retry-map").onclick = retryMap;
$("#show-map-list").onclick = openMapDirectory;
$("#fit-map").onclick = ()=>{mapSelectedId=null;renderMapSelection();renderMarkers({fit:true});};
$("#locate-me").onclick = ()=>{
  if(!navigator.geolocation){toast("Thiết bị không hỗ trợ định vị.");return;}
  const button=$("#locate-me");button.disabled=true;button.setAttribute("aria-busy","true");
  navigator.geolocation.getCurrentPosition(pos=>{
    button.disabled=false;button.removeAttribute("aria-busy");
    if(pos.coords.accuracy>100){toast("GPS chưa đủ chính xác. Ra nơi thoáng và thử lại.");return;}
    userPoint={lat:pos.coords.latitude,lng:pos.coords.longitude};
    if(map){userMarker?.remove();userMarker=L.marker([userPoint.lat,userPoint.lng],{icon:L.divIcon({className:"map-user-location",iconSize:[18,18]}),interactive:false}).addTo(map);}
    const nearest=mapPlaces().filter(eligible).sort((a,b)=>distanceMeters(userPoint,a)-distanceMeters(userPoint,b))[0];
    if(nearest)selectMapPlace(nearest.id);
    toast("Đã tìm điểm gần bạn. Khoảng cách là đường chim bay, không phải tuyến đi.");
  },err=>{button.disabled=false;button.removeAttribute("aria-busy");toast(err.code===1?"Bạn chưa cho phép định vị. Có thể tiếp tục khám phá mà không check-in.":"Chưa lấy được vị trí. Thử lại ngoài trời hoặc kiểm tra GPS.");},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
};
$("#map-search").addEventListener("input", renderMap);
$("#place-search").addEventListener("input", renderPlaces);
let stampBorderObserver;
function updateStampBorders() {
  stampBorderObserver?.disconnect();
  const apply = (element, width, height) => {
    if (width > 0 && height > 0) element.style.clipPath = `path("${stampOutline(width,height)}")`;
  };
  if (typeof ResizeObserver !== "undefined") stampBorderObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const size = entry.borderBoxSize?.[0];
      apply(entry.target, size?.inlineSize || entry.target.offsetWidth, size?.blockSize || entry.target.offsetHeight);
    }
  });
  for (const element of document.querySelectorAll('#pass-content .stamp')) {
    apply(element, element.offsetWidth, element.offsetHeight);
    stampBorderObserver?.observe(element);
  }
}
function showPassport() {
  if (modal.open) modal.close();
  if (activeTab !== "pass") {
    navigate("pass");
    return;
  }
  const {collection, earned, ready, total, count, complete} = passProgress(site.places, profile.badges);
  const all = earned;
  const pages = Math.max(1, Math.ceil(all.length / 4));
  bookPage = Math.max(0, Math.min(pages - 1, bookPage));
  passNeedsRender = false;
  $("#pass-content").innerHTML =
    `<div class="app-view-heading"><div class="eyebrow">GOM TEM DI SẢN. LAN TỎA ÓC EO.</div><h1 id="pass-heading" tabindex="-1">Óc Eo <span class="serif">Pass.</span></h1><p>Mỗi con tem là một lần chạm Óc Eo.</p></div><div class="pass-story-entry"><button class="button dark" data-journey-action="story" ${!count ? "disabled" : ""}>Tạo story với ảnh của tôi ${icon("camera")}</button><p>Có một tem là có thể kể. Ảnh chỉ xử lý trên máy.</p></div><div class="pass-toolbar"><button class="button dark" id="save-pass-image">Lưu ảnh về máy ${icon("download")}</button><button class="text-button book-toggle" id="toggle-book">Đóng bìa Óc Eo Pass ${icon("passport")}</button></div><p class="pass-save-caption">Lưu ảnh tiến độ bất cứ lúc nào.</p><div class="passport-book"><button class="passport-cover" id="open-book">${mark}<small>ÓC EO TOWNWALK</small><h3>Óc Eo<br><span class="serif">Pass.</span></h3><span>Chạm để mở một chuyến đi ↗</span></button><div class="passport-spread"><div class="passport-page"><div class="eyebrow">ÓC EO TOWNWALK / YOUR PASS</div><h3>Óc Eo.<br><span class="serif">I was here.</span></h3><p>Óc Eo Pass này thuộc về</p><div class="owner-name" data-no-translate>${e(profile.name || translateText("Một tâm hồn tò mò"))}</div><small>Xã Óc Eo · An Giang</small><div class="passport-progress"><span style="width:${total ? (count / total) * 100 : 0}%"></span></div><p>${total ? `Bạn đã đạt ${count} / ${total} tem` : "Bộ sưu tập đang được bổ sung"}</p><small>${cloud.state.user ? "Đồng bộ với tài khoản khi có mạng" : "Chế độ khách · lưu trên thiết bị này"}</small></div><div class="passport-page passport-flip"><div class="eyebrow">NHỮNG NƠI MÌNH ĐÃ CHẠM</div>${all.length ? `<div class="stamp-grid">${all
      .slice(bookPage * 4, bookPage * 4 + 4)
      .map(
        (p) =>
          `<button class="stamp earned ${["butter", "lavender", "peach", "lime"].includes(p.color) ? p.color : "butter"}" style="background:${stampColor(p)}" data-place="${e(p.id)}" aria-label="${e(p.name)}: đã check-in">${heritageSymbolHTML(p)}<b>${e(p.name.toUpperCase())}</b><small>ĐÃ CHECK-IN</small></button>`,
      )
      .join(
        "",
      )}</div>` : `<div class="pass-empty">${icon("compass")}<h3>Tem đầu tiên đang chờ bạn.</h3><p>Đến điểm, check-in bằng GPS rồi tem mới xuất hiện ở đây.</p><button class="button outline" data-route="map">Chọn điểm check-in ${icon("arrow")}</button></div>`}</div></div></div><div class="passport-controls"><button class="text-button" id="prev-page" ${bookPage === 0 ? "disabled" : ""}>← Trang trước</button><span>${bookPage + 1} / ${pages}</span><button class="text-button" id="next-page" ${bookPage === pages - 1 ? "disabled" : ""}>Trang sau →</button></div><label class="field">Tên trên Óc Eo Pass<input id="passport-name" maxlength="60" autocomplete="off" value="${e(profile.name)}" placeholder="Bạn muốn được gọi là gì?"></label><button class="text-button" id="save-name">Lưu tên ${icon("check")}</button><div class="notice">${complete ? "Bạn đã gom trọn bộ tem Óc Eo. Khoe chuyến đi của bạn thôi!" : `Bộ sưu tập có ${total} điểm, hiện ${ready.length} điểm có vị trí mở check-in. Tem chỉ xuất hiện sau khi bạn check-in thành công. Điểm chờ tọa độ vẫn nằm trong tổng bộ sưu tập, chưa phát tem.`}</div><div class="passport-actions"><button class="button outline" id="certificate" ${!count ? "disabled" : ""}>Chia sẻ Óc Eo Pass ${icon("arrowup")}</button>${!cloud.state.user ? '<button class="button outline" id="passport-login">Đăng nhập để đồng bộ</button>' : ""}<button class="text-button danger" id="clear-passport">Xóa Óc Eo Pass này</button></div><details class="pass-destinations"><summary>${total} điểm trong bộ sưu tập ${icon("plus")}</summary><p>Đây là danh sách điểm đến, không phải tem đã nhận.</p>${collection.map(p=>`<button data-place="${e(p.id)}"><span>${e(p.name)}<small>${earned.some(s=>s.id===p.id)?"Đã check-in":canCollectStamp(p)?"Đến điểm để check-in":"Chờ xác nhận vị trí"}</small></span>${icon(earned.some(s=>s.id===p.id)?"check":"arrow")}</button>`).join("")}</details><p class="pass-export-hint">Lưu được cả khi đang gom tem. Ảnh ghi đúng tiến độ hiện tại; trên iPhone, nếu ảnh mở ra, nhấn giữ ảnh hoặc chọn Chia sẻ → Lưu hình ảnh.</p><small>Kỷ niệm tự ghi nhận, không phải giấy chứng nhận chính thức hoặc bằng chứng chống gian lận vị trí.</small>`;
  hydrate($("#pass-content"));
  updateStampBorders();
  $("#toggle-book").onclick = () => {
    playEffect("paper");
    const book = $(".passport-book");
    book.classList.toggle("closed");
    $("#toggle-book").innerHTML =
      (book.classList.contains("closed")
        ? "Mở Óc Eo Pass "
        : "Đóng bìa Óc Eo Pass ") + icon("passport");
  };
  $("#open-book").onclick = () => {
    playEffect("paper");
    $(".passport-book").classList.remove("closed");
    $("#toggle-book").innerHTML = "Đóng bìa Óc Eo Pass " + icon("passport");
  };
  $("#save-name").onclick = async () => {
    profile.name = $("#passport-name").value.trim();
    await saveProfile();
    showPassport();
    toast("Đã lưu tên trên Óc Eo Pass.");
  };
  $("#prev-page").onclick = () => {
    bookPage--;
    showPassport();
  };
  $("#next-page").onclick = () => {
    bookPage++;
    showPassport();
  };
  $("#clear-passport").onclick = async () => {
    if (!confirm(translateText("Xóa tên và tất cả tem trong Óc Eo Pass này?"))) return;
    profileEpoch++;
    profile = { name: "", badges: [], policyVersion: POLICY_VERSION };
    await saveProfile();
    showPassport();
  };
  $("#save-pass-image").onclick = async () => {
    const button = $("#save-pass-image");
    button.disabled = true;
    button.textContent = "Đang tạo ảnh PNG…";
    try {
      await showCertificate({progress: true, download: true,
        name: $("#passport-name").value.trim().slice(0,60)});
    } finally {
      if (button.isConnected) {
        button.disabled = false;
        button.innerHTML = "Lưu ảnh về máy " + icon("download");
      }
    }
  };
  $("#certificate").onclick = async () => {
    const button = $("#certificate");
    button.disabled = true;
    try { await showCertificate({progress:true,name:$("#passport-name").value.trim().slice(0,60)}); }
    finally { if(button.isConnected) button.disabled = count === 0; }
  };
  $("#passport-login")?.addEventListener("click", showLogin);
}
async function showCertificate({progress = false, download = false, name = ""} = {}) {
  const owner=profileKey(),epoch=profileEpoch,dialogVersion=modalEpoch,navVersion=navigationEpoch;
  const sameOwner=()=>owner===profileKey()&&epoch===profileEpoch;
  const sameView=()=>sameOwner()&&dialogVersion===modalEpoch&&navVersion===navigationEpoch;
  const {collection, earned, complete} = passProgress(site.places, profile.badges);
  if (!progress && !complete) return;
  const exportName = (name || profile.name || translateText("Một tâm hồn tò mò")).trim().slice(0,60);
  const date = new Intl.DateTimeFormat(dateLocale(), {timeZone:"Asia/Ho_Chi_Minh"}).format(new Date());
  const {svg,width,height} = await passArtwork({collection,earned,name:exportName,date,locale:getLanguage()});
  if(!sameOwner()||(!download&&!sameView()))return;
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    c.getContext("2d").drawImage(img, 0, 0);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    if (!blob) throw Error("Không xuất được ảnh.");
    if(!sameOwner()||(!download&&!sameView()))return;
    if (download) {
      downloadBlob(blob, "oc-eo-pass.png");
      toast("Ảnh PNG đã sẵn sàng. Nếu máy mở ảnh, nhấn giữ để lưu.");
      return;
    }
    const preview = URL.createObjectURL(blob);
    openModal(
      "ĐI ÓC EO. KỂ ÓC EO.",
      `<h2>Chuyến này,<br><span class="serif">khoe Óc Eo.</span></h2><img class="certificate-preview" src="${preview}" alt="Óc Eo Pass mang tên ${e(exportName)}"><button class="button dark" id="download-certificate">Tải ảnh PNG ${icon("download")}</button> <button class="button outline" id="share-certificate">Chia sẻ ${icon("arrowup")}</button><p>Tải ảnh để đăng story của bạn. #OcEoTownwalk #ChamNganNam</p>`,
      "certificate",
    );
    $("#download-certificate").onclick = () =>
      downloadBlob(blob, "oc-eo-townwalk.png");
    $("#share-certificate").onclick = async () => {
      const f = new File([blob], "oc-eo-townwalk.png", { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [f] })) {
          await navigator.share({
            files: [f],
            title: "Óc Eo Pass · Óc Eo townwalk",
            text: "#OcEoTownwalk #ChamNganNam",
          });
        } else {
          downloadBlob(blob, "oc-eo-townwalk.png");
          toast("Đã tải ảnh để bạn đăng lên mạng xã hội.");
        }
      } catch (err) {
        if (err.name !== "AbortError")
          toast("Chưa chia sẻ được. Bạn có thể tải ảnh PNG.");
      }
    };
    modal.addEventListener("close", () => URL.revokeObjectURL(preview), {
      once: true,
    });
  } catch (err) {
    toast("Không tạo được ảnh kỷ niệm: " + err.message);
  } finally {
    URL.revokeObjectURL(url);
  }
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function showLogin() {
  if (cloud.state.user) {
    showAccount();
    return;
  }
  const configured = !!site.operator && !!site.contactEmail;
  openModal(
    "ĐI THEO CÁCH BẠN MUỐN",
    `<h2>Xin chào,<br><span class="serif">người bạn tò mò.</span></h2><p>Không cần tài khoản để xem bản đồ và lên lịch đi chơi. Óc Eo Pass khách được lưu trên thiết bị này.</p>${!configured ? '<div class="notice warning">Trang đang chờ đơn vị vận hành hoàn thiện thông tin bảo mật. Chế độ khách vẫn hoạt động; đăng nhập cho khách sẽ mở sau khi cấu hình xong.</div>' : ""}<label class="check-field"><input type="checkbox" id="login-consent"><span>Tôi từ đủ 16 tuổi, đã đọc <button class="text-button" id="login-policy" style="padding:0;text-decoration:underline">chính sách bảo mật</button> và đồng ý dùng Google để xác thực, lưu Óc Eo Pass trên Firebase. Tôi hiểu có thể xóa dữ liệu và tài khoản.</span></label><button class="button dark full-width" id="google-login" disabled>Đăng nhập bằng Google ${icon("arrowup")}</button><button class="text-button full-width" id="continue-guest">Tiếp tục không đăng nhập ${icon("arrow")}</button><p class="error-text" id="login-error" role="alert"></p>`,
    "login",
  );
  $("#login-consent").onchange = (ev) =>
    ($("#google-login").disabled = !configured || !ev.target.checked);
  $("#login-policy").onclick = () => showPrivacy(true);
  $("#continue-guest").onclick = () => modal.close();
  $("#google-login").onclick = async () => {
    const btn = $("#google-login");
    btn.disabled = true;
    try {
      await cloud.login();
      if (modal.dataset.view === "login") showAccount();
    } catch (err) {
      if ($("#login-error"))
        $("#login-error").textContent = cloud.friendlyError(err);
    } finally {
      if ($("#google-login")) $("#google-login").disabled = false;
    }
  };
}
function showPrivacy(back = false) {
  openModal(
    "BẠN LUÔN CÓ QUYỀN LỰA CHỌN",
    privacyHTML(site) +
      (back
        ? '<button class="button outline" id="back-login">Quay lại đăng nhập</button>'
        : ""),
    "privacy",
  );
  $("#back-login")?.addEventListener("click", showLogin);
}
async function showAccount() {
  if (!cloud.state.user) {
    showLogin();
    return;
  }
  openModal(
    "TÀI KHOẢN CỦA BẠN",
    `<h2>Một góc <span class="serif">của mình.</span></h2><p>Đã đăng nhập Google. Tên công khai do bạn tự chọn, email không được hiển thị trong bài đánh giá.</p><div class="account-menu"><button class="button outline" id="account-passport">Óc Eo Pass của mình ${icon("passport")}</button><button class="button outline" id="import-guest">Nhập tem từ Óc Eo Pass khách trên máy này</button><button class="button outline" id="export-data">Xuất dữ liệu của mình ${icon("download")}</button><button class="button outline" id="my-reviews">Các đánh giá của mình</button><button class="button outline" id="logout">Đăng xuất ${icon("logout")}</button><button class="text-button danger" id="delete-account">Xóa tài khoản và dữ liệu</button></div><p class="error-text" id="account-error" role="alert"></p>`,
    "account",
  );
  $("#account-passport").onclick = showPassport;
  $("#import-guest").onclick = async () => {
    const guest = localRead("oceo-passport-guest", {});
    profile.badges = [
      ...new Set([
        ...profile.badges,
        ...(Array.isArray(guest.badges) ? guest.badges : []),
      ]),
    ];
    if (!profile.name && typeof guest.name === "string")
      profile.name = guest.name.slice(0, 60);
    await saveProfile();
    toast("Đã nhập Óc Eo Pass khách.");
  };
  $("#export-data").onclick = async () => {
    try {
      const data = {
        profile,
        reviews: await cloud.myReviews(),
        reports: await cloud.myReports(),
        exportedAt: new Date().toISOString(),
      };
      downloadBlob(
        new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
        "oc-eo-du-lieu-cua-toi.json",
      );
    } catch (err) {
      toast(cloud.friendlyError(err));
    }
  };
  $("#my-reviews").onclick = showMyReviews;
  $("#logout").onclick = async () => {
    try {
      await cloud.logout();
      modal.close();
      toast("Đã đăng xuất. Bạn đang ở chế độ khách.");
    } catch (err) {
      toast(cloud.friendlyError(err));
    }
  };
  $("#delete-account").onclick = async () => {
    if (
      !confirm(
        translateText("Xóa tài khoản, Óc Eo Pass trên mây, mọi đánh giá, ảnh và báo cáo của bạn? Thao tác này không thể hoàn tác."),
      )
    )
      return;
    const btn = $("#delete-account");
    btn.disabled = true;
    const key = profileKey();
    try {
      await cloud.deleteAccount();
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}:journey`);
      modal.close();
      toast("Đã xóa tài khoản và dữ liệu trên Firebase.");
      loadReviews(true);
    } catch (err) {
      if ($("#account-error"))
        $("#account-error").textContent =
          "Chưa xóa hoàn tất. Dữ liệu đã xóa có thể không khôi phục được; bạn có thể thử lại. " +
          cloud.friendlyError(err);
      if (btn.isConnected) btn.disabled = false;
    }
  };
}
async function showMyReviews() {
  openModal(
    "NHỮNG CÂU CHUYỆN BẠN ĐÃ ĐỂ LẠI",
    '<h2>Bài viết <span class="serif">của mình.</span></h2><p>Đang tải…</p>',
    "my-reviews",
  );
  try {
    const data = await cloud.myReviews();
    if (modal.dataset.view !== "my-reviews") return;
    body.innerHTML =
      `<h2>Bài viết <span class="serif">của mình.</span></h2>` +
      (data.length
        ? data
            .map(
              (r) =>
                `<article class="admin-card"><p data-no-translate>${e(r.text)}</p><small>${r.status === "hidden" ? "Đã được quản trị viên ẩn" : "Đang công khai"}</small><div><button class="text-button danger" data-delete-review="${e(r.id)}">Xóa bài và ảnh</button></div></article>`,
            )
            .join("")
        : "<p>Bạn chưa có bài đánh giá nào.</p>");
    body.querySelectorAll("[data-delete-review]").forEach(
      (b) =>
        (b.onclick = async () => {
          if (!confirm(translateText("Xóa đánh giá và ảnh đính kèm?"))) return;
          b.disabled = true;
          try {
            await cloud.deleteReview(
              data.find((r) => r.id === b.dataset.deleteReview),
            );
            showMyReviews();
            loadReviews(true);
          } catch (err) {
            toast(cloud.friendlyError(err));
            b.disabled = false;
          }
        }),
    );
  } catch (err) {
    if (modal.dataset.view === "my-reviews")
      body.innerHTML = `<h2>Chưa tải được bài viết.</h2><p>${e(cloud.friendlyError(err))}</p>`;
  }
}
function renderReviews() {
  $("#reviews-grid").innerHTML = reviews.length
    ? reviews
        .map(
          (r) =>
            `<article class="memory">${safeURL(r.photoURL) ? `<img src="${e(safeURL(r.photoURL))}" alt="Ảnh trải nghiệm do ${e(r.name)} chia sẻ" loading="lazy">` : ""}<div class="stars" aria-label="${Number(r.rating)} trên 5 sao">${"★".repeat(Math.max(0, Math.min(5, Number(r.rating) || 0)))}${"☆".repeat(5 - Math.max(0, Math.min(5, Number(r.rating) || 0)))}</div><p data-no-translate>${e(r.text)}</p><div class="memory-footer"><span><span data-no-translate>${e(r.name)}</span><small>${r.createdAt?.toDate ? new Intl.DateTimeFormat(dateLocale(), { timeZone: "Asia/Ho_Chi_Minh" }).format(r.createdAt.toDate()) : "Vừa chia sẻ"}</small></span><button data-report="${e(r.id)}" aria-label="Báo cáo đánh giá của ${e(r.name)}">${icon("flag")} Báo cáo</button></div></article>`,
        )
        .join("")
    : `<div class="review-zero"><article class="memory"><div class="eyebrow">YOUR ÓC EO STORY</div><div class="blank-photo">${icon("camera")} Một bức ảnh của bạn</div><h3>Góc này chờ<br><span class="serif">Óc Eo của bạn.</span></h3><p>Chưa có bài đánh giá được tải. Câu chuyện đầu tiên ở đây có thể là của bạn.</p><button class="text-button" data-action="review">Viết một chút thương ${icon("arrow")}</button></article><div class="review-note">${icon("camera")}<h3>Có ảnh mới<br>có chuyện kể.</h3><p>Mỗi đánh giá cần ít nhất một ảnh tự chụp. Giữ một khoảnh khắc thật, đừng mượn chuyến đi Óc Eo của ai.</p></div><div class="review-note">${icon("heart")}<h3>Thật lòng.<br>Và tử tế.</h3><p>Bài được công khai ngay sau khi gửi. Có thể báo cáo nội dung không phù hợp để quản trị viên xem xét.</p></div></div>`;
  $("#review-summary").textContent = reviews.length
    ? `${reviews.length} câu chuyện đã tải · ${(reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)}/5 sao trong các bài đang xem`
    : "Không có số sao hay đánh giá giả. Chỉ có trải nghiệm thật.";
}
async function loadReviews(reset = false) {
  if (reviewLoading) return;
  reviewLoading = true;
  $("#review-summary").textContent = "Đang tải những câu chuyện từ Óc Eo…";
  try {
    const result = await Promise.race([
      cloud.loadReviews({ reset }),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error("Chưa tải được đánh giá. Hãy thử lại khi có kết nối."),
            ),
          10000,
        ),
      ),
    ]);
    reviews = reset ? result.items : [...reviews, ...result.items];
    renderReviews();
    $("#more-reviews").hidden = !result.more;
    $("#more-reviews").dataset.retry="";
    $("#more-reviews").textContent="Xem thêm câu chuyện →";
  } catch (err) {
    if (!reviews.length) {
      renderReviews();
      $("#review-summary").textContent =
        "Mục cộng đồng chưa kết nối được lúc này. Bạn vẫn xem được tư liệu và lịch trình không cần đăng nhập.";
    }
    $("#more-reviews").hidden=false;
    $("#more-reviews").dataset.retry="true";
    $("#more-reviews").textContent="Thử tải lại câu chuyện ↻";
  } finally {
    reviewLoading = false;
  }
}
let photoBlob = null,
  photoURL = "",
  photoGeneration = 0;
function showReviewForm() {
  if (!cloud.state.user) {
    showLogin();
    return;
  }
  if (!site.operator || !site.contactEmail) {
    toast("Trang chưa hoàn thiện thông tin đơn vị vận hành và bảo mật.");
    return;
  }
  photoBlob = null;
  openModal(
    "ADD A MEMORY / THÊM MỘT KỶ NIỆM",
    `<h2>Một chút <span class="serif">thương nhớ.</span></h2><p>Một ảnh tự chụp. Một cảm nhận thật. Bài sẽ hiển thị ngay khi gửi thành công.</p><form id="review-form"><label class="field">Tên công khai<input name="name" required maxlength="60" value="${e(profile.name)}" placeholder="Tên bạn muốn xuất hiện"></label><fieldset style="border:0;padding:0;margin:20px 0"><legend style="font-size:11px;margin-bottom:9px">Chuyến đi của bạn thế nào?</legend><div class="stars-input">${[1, 2, 3, 4, 5].map((n) => `<label><input type="radio" name="rating" value="${n}" ${n === 5 ? "checked" : ""}>${n} ★</label>`).join("")}</div></fieldset><div class="review-paper"><label class="field">Óc Eo qua góc nhìn của bạn<textarea name="text" required maxlength="1200" placeholder="Điều gì ở Óc Eo làm bạn nhớ nhất?"></textarea></label><label class="field">${icon("camera")} Thêm ít nhất một ảnh của bạn<input id="review-photo" type="file" accept="image/jpeg,image/png,image/webp" required><small>JPG, PNG, WebP · tối đa 8 MB · tự xóa metadata vị trí trước khi tải</small></label><img id="photo-preview" class="photo-preview" alt="Xem trước ảnh đánh giá" hidden></div><label class="check-field"><input name="consent" type="checkbox" required><span>Tôi từ đủ 16 tuổi, có quyền sử dụng ảnh này, đồng ý công khai tên, ảnh và nội dung theo <a href="#" id="review-policy">chính sách bảo mật</a>. Tôi không đăng thông tin nhạy cảm hoặc hình ảnh người khác khi chưa được đồng ý.</span></label><p id="review-error" class="error-text" role="alert"></p><button type="submit" class="button dark full-width" id="submit-review">Gửi một chút thương ${icon("star")}</button></form>`,
    "review",
  );
  $("#review-policy").onclick = (ev) => {
    ev.preventDefault();
    window.open(appURL("privacy.html"), "_blank", "noopener,noreferrer");
  };
  $("#review-photo").onchange = async (ev) => {
    photoBlob = null;
    const token = ++photoGeneration;
    if (photoURL) URL.revokeObjectURL(photoURL);
    $("#photo-preview").hidden = true;
    const file = ev.target.files[0];
    if (!file) return;
    $("#submit-review").disabled = true;
    try {
      const blob = await cloud.preparePhoto(file);
      if (token !== photoGeneration || modal.dataset.view !== "review") return;
      photoBlob = blob;
      photoURL = URL.createObjectURL(blob);
      $("#photo-preview").src = photoURL;
      $("#photo-preview").hidden = false;
      $("#review-error").textContent = "";
    } catch (err) {
      if ($("#review-error"))
        $("#review-error").textContent = cloud.friendlyError(err);
      ev.target.value = "";
    } finally {
      if ($("#submit-review") && token === photoGeneration)
        $("#submit-review").disabled = false;
    }
  };
  $("#review-form").onsubmit = async (ev) => {
    ev.preventDefault();
    if (!photoBlob) {
      $("#review-error").textContent = "Bạn cần thêm ít nhất một ảnh hợp lệ.";
      return;
    }
    const f = new FormData(ev.target);
    if (!f.get("consent")) return;
    const btn = $("#submit-review");
    btn.disabled = true;
    btn.textContent = "Đang lưu kỷ niệm…";
    try {
      await cloud.postReview({
        name: f.get("name"),
        text: f.get("text"),
        rating: Number(f.get("rating")),
        photo: photoBlob,
        policyVersion: POLICY_VERSION,
      });
      modal.close();
      toast("Câu chuyện của bạn đã được công khai. Cảm ơn bạn!");
      loadReviews(true);
    } catch (err) {
      if ($("#review-error"))
        $("#review-error").textContent = cloud.friendlyError(err);
    } finally {
      if (btn.isConnected) {
        btn.disabled = false;
        btn.innerHTML = "Thử gửi lại " + icon("arrow");
      }
    }
  };
}
function reportReview(id) {
  if (!cloud.state.user) {
    showLogin();
    return;
  }
  openModal(
    "GIỮ GÓC CHIA SẺ TỬ TẾ",
    `<h2>Báo cáo <span class="serif">bài viết.</span></h2><p>Bài vẫn hiển thị trong khi quản trị viên xem xét báo cáo.</p><form id="report-form"><label class="field">Lý do<select name="reason"><option value="Xâm phạm quyền riêng tư">Xâm phạm quyền riêng tư</option><option value="Ảnh hoặc nội dung không phù hợp">Ảnh hoặc nội dung không phù hợp</option><option value="Sai thông tin / quảng cáo">Sai thông tin / quảng cáo</option><option value="Quấy rối / xúc phạm">Quấy rối / xúc phạm</option></select></label><button class="button dark" type="submit">Gửi báo cáo ${icon("flag")}</button><p id="report-error" class="error-text" role="alert"></p></form>`,
    "report",
  );
  $("#report-form").onsubmit = async (ev) => {
    ev.preventDefault();
    const btn = ev.target.querySelector("button");
    btn.disabled = true;
    try {
      await cloud.reportReview(id, new FormData(ev.target).get("reason"));
      modal.close();
      toast("Đã gửi báo cáo tới quản trị viên.");
    } catch (err) {
      if ($("#report-error"))
        $("#report-error").textContent = cloud.friendlyError(err);
      btn.disabled = false;
    }
  };
}
function showSources() {
  openModal(
    "TƯ LIỆU CÓ NGUỒN / CẬP NHẬT 05.11.2026",
    `<div class="policy"><h2>Đọc đúng. <span class="serif">Đi có hiểu.</span></h2><p>Nội dung được biên tập từ tư liệu Ban Quản lý Di tích Văn hóa Óc Eo và nguồn riêng ghi tại từng hồ sơ, đối chiếu ngày 04–05/11/2026. Không phải trang chính thức của Ban Quản lý.</p><h3>Phạm vi</h3><p>Danh mục đang có ${site.places.length} hồ sơ, gồm di tích khu A – Núi Ba Thê, khu B – Đô thị Óc Eo, Nhà trưng bày Văn hóa Óc Eo và nhà trưng bày cũ trên đỉnh Ba Thê. Điểm trên đỉnh núi là tùy chọn, không tính vào bộ tem; nguồn kiến trúc và lưu ý hiện trạng được tách rõ trong hồ sơ. Lung Lớn A/B gộp một hồ sơ; Gò Cây Thị A/B gộp một điểm. Đây không phải kiểm kê toàn bộ di chỉ. Không đưa Nền Chùa và Giồng Xoài vào tuyến trong xã Óc Eo vì thuộc phạm vi cần tách riêng.</p><h3>Bài gốc</h3>${Object.entries(
      SOURCE_CATALOG,
    )
      .map(
        ([k, url]) =>
          `<p><a href="${e(url)}" target="_blank" rel="noopener noreferrer">${e({ inventory: "Danh mục khu vực và địa điểm di sản", overview: "Đô thị cổ và giao thương", baThe: "Núi Ba Thê", visits: "Hoạt động tham quan năm 2023", buddha: "Phù điêu Phật Linh Sơn Bắc", ring: "Nhẫn Nandin Giồng Cát", survey: "Khảo sát quốc tế", education: "Giáo dục qua di sản", canals: "Công nghệ khảo cổ và kênh cổ", jar: "Mộ vò Gò Cây Trâm", event: "Tuần lễ di sản năm 2026", summit: "Nhà trưng bày cũ trên núi Ba Thê · tư liệu Wikipedia" }[k] || k)} ↗</a></p>`,
      )
      .join(
        "",
      )}<h3>Tọa độ và bản đồ</h3><p>© OpenStreetMap contributors, ODbL; Leaflet 1.9.4, BSD-2-Clause. Các điểm có tọa độ OSM là vị trí tham khảo, không phải đo đạc cổng vào. Một số quán và chỗ nghỉ dùng tâm ô Plus Code công khai ghi trên trang địa điểm Google Maps; nguồn riêng được dẫn trong từng hồ sơ. Đường nét đứt là ranh giới theo OSM, không thay thế bản đồ hành chính pháp lý. Điểm chưa có tọa độ không được đặt pin.</p><h3>Ảnh và thiết kế</h3><p>Ảnh Gò Cây Thị, Linh Sơn Nam, chùa Linh Sơn và núi Ba Thê: Bùi Thụy Đào Nguyên, Wikimedia Commons, CC BY-SA 3.0; nguồn từng ảnh được ghi trong thẻ chi tiết. Ảnh có thể được thu nhỏ bởi Wikimedia và cắt khung bằng CSS; bản gốc giữ giấy phép ghi tại trang nguồn. Các hình vẽ và logo hoa là thiết kế của dự án, không phải biểu trưng chính thức của di sản.</p><p><a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">Giấy phép ảnh CC BY-SA 3.0 ↗</a> · Phông Be Vietnam Pro/Lora/Townwalk SC (từ Noto CJK): SIL OFL.</p></div>`,
    "sources",
  );
}
$("#save-itinerary").onclick = () =>
  downloadBlob(
    new Blob(
      [
        `ÓC EO TOWNWALK — MỘT NGÀY GỢI Ý\nKhung trải nghiệm, chưa tính quãng đường. Xác minh điểm, giờ mở cửa và điều kiện đón khách trước khi đi.\n\n${site.itinerary.map((s) => `${s.time} — ${s.title}\n${s.description}`).join("\n\n")}`,
      ],
      { type: "text/plain;charset=utf-8" },
    ),
    "oc-eo-mot-ngay.txt",
  );
$("#account-button").onclick = () =>
  cloud.state.user ? showAccount() : showLogin();
$("#write-review").onclick = showReviewForm;
$("#more-reviews").onclick = () => loadReviews($("#more-reviews").dataset.retry==="true");
document.addEventListener("click", (ev) => {
  const catalogMove=ev.target.closest('[data-catalog-move]');
  if(catalogMove){const rail=$('#places-grid'),width=rail.querySelector('.place-card')?.getBoundingClientRect().width||rail.clientWidth;rail.scrollBy({left:Number(catalogMove.dataset.catalogMove)*(width+16),behavior:reducedMotion()?'auto':'smooth'});return;}
  const saveCard=ev.target.closest('[data-save-place]');
  if(saveCard){const p=findPlace(saveCard.dataset.savePlace);if(!p)return;let ids=savedSiteIds();ids=ids.includes(p.id)?ids.filter(id=>id!==p.id):[...ids,p.id];store('oceo-saved-sites',ids);renderSavedTrip();return;}
  const journeyButton=ev.target.closest('[data-journey-action]');
  if(journeyButton){
    if(journeyButton.disabled)return;
    const action=journeyButton.dataset.journeyAction,state=journeyState(site,profile.badges);
    if(action==='open'){if(modal.open)modal.close();openJourney();}
    if(action==='start'){
      if(!state.canStart){toast('Một chặng đang chờ xác nhận. Xem lại hồ sơ trước khi chọn.');return;}
      if(store(journeyKey(),{id:JOURNEY.id,version:JOURNEY.version,active:true})){renderCampaign();toast('Đã giữ chuyến này trên thiết bị. Tem cũ vẫn được tính riêng.');}
    }
    if(action==='stop'){store(journeyKey(),{id:JOURNEY.id,version:JOURNEY.version,active:false});renderCampaign();}
    if(action==='story')openPersonalStory();
    if(action==='sample')showStorySample();
    if(action==='map'||action==='all-map'){
      mapJourneyOnly=action==='map';mapCategory='all';$('#map-search').value='';
      if(modal.open)modal.close();renderCampaign();renderMap();navigate('map');
      if(journeyButton.dataset.place){const p=findPlace(journeyButton.dataset.place);if(p&&eligible(p))requestAnimationFrame(()=>selectMapPlace(p.id));}
    }
    if(action==='share')void shareJourney();
    if(action==='pack')void packJourney(journeyButton);
    return;
  }
  const route = ev.target.closest("[data-route]");
  if (route && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && ev.button === 0) {
    ev.preventDefault();
    navigate(route.dataset.route);
    return;
  }
  const artifact=ev.target.closest("[data-artifact]");
  if(artifact){showArtifact(artifact.dataset.artifact);return;}
  const mode=ev.target.closest("[data-artifact-mode]");
  if(mode){const a=getArtifact(mode.dataset.id);if(a&&modal.dataset.view==="artifact"){
    body.querySelectorAll("[data-artifact-mode]").forEach(b=>b.setAttribute("aria-pressed",String(b===mode)));
    $("#artifact-observation").textContent=(mode.dataset.artifactMode==="display"?a.atDisplay:a.onSite)[0];
  }return;}
  const answer=ev.target.closest("[data-artifact-answer]");
  if(answer){const a=getArtifact(answer.dataset.id),number=Number(answer.dataset.artifactAnswer);if(a&&Number.isInteger(number)&&number>=0&&number<a.options.length&&modal.dataset.view==="artifact"){
    body.querySelectorAll("[data-artifact-answer]").forEach(b=>{b.setAttribute("aria-pressed",String(b===answer));b.classList.remove("answer-correct","answer-retry");});
    const correct=number===a.answer;answer.classList.add(correct?"answer-correct":"answer-retry");
    $("#artifact-feedback").innerHTML=`<strong>${correct?"Chính xác!":"Cùng xem lại nhé."}</strong><p>${e(a.explanation[0])}</p>`;
  }return;}
  const artifactMap=ev.target.closest("[data-artifact-map]");
  if(artifactMap){const p=findPlace(artifactMap.dataset.artifactMap);if(p&&eligible(p)){
    modal.close();mapCategory="all";$("#map-search").value="";renderMap();navigate("map");requestAnimationFrame(()=>selectMapPlace(p.id));
  }return;}
  const place = ev.target.closest("[data-place]");
  if (place) {
    placeDetail(place.dataset.place);
    return;
  }
  const mapFilter = ev.target.closest("[data-map-category]");
  if (mapFilter) {
    mapCategory = mapFilter.dataset.mapCategory;
    renderMap();
    return;
  }
  const group = ev.target.closest("[data-group]");
  if (group) {
    heritageGroup = group.dataset.group;
    renderPlaces();
    return;
  }
  const f = ev.target.closest("[data-filter]");
  if (f) {
    filter = f.dataset.filter;
    renderPlaces();
    return;
  }
  const mapJump=ev.target.closest("[data-map-jump]");
  if(mapJump){selectMapPlace(mapJump.dataset.mapJump);return;}
  if(ev.target.closest("[data-open-map-directory]")){openMapDirectory();return;}
  const r = ev.target.closest("[data-report]");
  if (r) {
    reportReview(r.dataset.report);
    return;
  }
  const a = ev.target.closest("[data-action]")?.dataset.action;
  if (a === "passport") showPassport();
  if (a === "review") showReviewForm();
  if (a === "privacy") showPrivacy();
  if (a === "sources") showSources();
  if (a === "artifacts") showArtifactIndex();
});
let currentUid;
window.addEventListener("cloud-state", async () => {
  const user = cloud.state.user;
  $("#account-label").textContent = user ? "Tài khoản" : "Đăng nhập";
  if (currentUid === user?.uid) return;
  currentUid = user?.uid;
  readProfile();
  renderCampaign();
  const responseEpoch=profileEpoch;
  if (user) {
    try {
      const remote = await cloud.loadProfile();
      if (remote && cloud.state.user?.uid === user.uid && responseEpoch===profileEpoch) {
        profile = {
          name: typeof remote.name === "string" ? remote.name : "",
          badges: Array.isArray(remote.badges) ? remote.badges : [],
          policyVersion: POLICY_VERSION,
        };
        store(profileKey(), profile);
        renderCampaign();
      }
    } catch {
      toast(
        "Óc Eo Pass trên mây chưa tải được. Đang dùng bản lưu trên thiết bị.",
      );
    }
  }
  if (activeTab === "pass") showPassport();
});
hydrate();
readProfile();
renderSite();
renderReviews();
const incomingJourney=new URLSearchParams(location.search).get('journey')===JOURNEY.id;
activateTab(incomingJourney&&!location.hash?'day':normalizedTab());
cloud
  .watchSite(
    (data) => {
      if (data) {
        try {
          site = validateSite(data);
          renderSite();
        } catch (err) {
          console.warn("Nội dung v2 chưa hợp lệ:", err.message);
        }
      }
    },
    () => {},
  )
  .catch(() => {});
// Reviews load only on entering the Community tab. Hidden tabs stay mounted.

function updateConnection() {
  document.getElementById("connection-state").hidden = navigator.onLine;
}
window.addEventListener("online",()=>{updateConnection();if(activeTab==="community"&&$("#more-reviews").dataset.retry==="true")loadReviews(true);});
window.addEventListener("offline", updateConnection);
updateConnection();
const linkedPlace = new URLSearchParams(location.search).get("place");
if (!incomingJourney && linkedPlace && findPlace(linkedPlace)) placeDetail(linkedPlace);

window.addEventListener('oceo-language-change', () => {
  requestAnimationFrame(syncCatalogShelf);
  renderReviews();
  storyCreatorUI?.setLocale?.(getLanguage());
  const owner=document.querySelector('.owner-name');
  if(owner && !profile.name)owner.textContent=translateText('Một tâm hồn tò mò');
});
initI18n();
initEffects();
