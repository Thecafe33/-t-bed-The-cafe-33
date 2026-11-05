import test from "node:test";
import assert from "node:assert/strict";
import {
  cloneDefault,
  validateSite,
  eligible,
  canCollectStamp,
  passProgress,
  visibleStop,
  distanceMeters,
  escapeHTML,
  safeURL,
} from "../assets/model.js";
globalThis.location = { origin: "https://oceotownwalk.web.app" };
test("curated records distinguish collection membership from available check-in positions", () => {
  const d = cloneDefault();
  assert.equal(d.places.filter(eligible).length, 7);
  assert.equal(d.places.length, 16);
  assert.equal(d.stops.length, 9);
  for (const p of d.places.filter(p=>p.recordType!=="hidden-gem")) {
    assert.ok(p.sourceUrl.startsWith("https://vanhoaoceo.angiang.gov.vn/"));
    assert.equal(p.contentVerified, true);
  }
  assert.doesNotThrow(() => validateSite(d));
});
test("confirmation requires post-merger scope, source and valid coordinates", () => {
  const p = {
    verified: true,
    scopeConfirmed: true,
    sourceUrl: "https://example.org/evidence",
    coordinateSource: "https://example.org/coordinates",
    lat: 10.2,
    lng: 105.1,
  };
  assert.equal(eligible(p), true);
  for (const update of [
    { scopeConfirmed: false },
    { sourceUrl: "" },
    { lat: null },
    { lng: 200 },
    { verified: false },
  ])
    assert.equal(eligible({ ...p, ...update }), false);
  const d = cloneDefault();
  d.places.find(p=>p.id==='go-ut-trach').verified = true;
  assert.throws(() => validateSite(d), /nguồn HTTPS/);
});
test("geofence measures same point, near point and far point", () => {
  assert.equal(distanceMeters({ lat: 10, lng: 105 }, { lat: 10, lng: 105 }), 0);
  assert.ok(
    distanceMeters({ lat: 10, lng: 105 }, { lat: 10.001, lng: 105 }) < 150,
  );
  assert.ok(
    distanceMeters({ lat: 10, lng: 105 }, { lat: 10.01, lng: 105 }) > 1000,
  );
});
test("config imports reject duplicate IDs, invalid time and missing destination", () => {
  const d = cloneDefault();
  d.places[1].id = d.places[0].id;
  assert.throws(() => validateSite(d), /duy nhất/);
  const n = cloneDefault();
  n.itinerary[0].time = "25:00";
  assert.throws(() => validateSite(n), /HH:MM/);
  const m = cloneDefault();
  m.itinerary[0].placeId = "missing";
  assert.throws(() => validateSite(m), /không tồn tại/);
});
test("user supplied text is escaped and unsafe navigation schemes are rejected", () => {
  assert.equal(escapeHTML("<script>\"&'"), "&lt;script&gt;&quot;&amp;&#39;");
  for (const s of [
    "javascript:alert(1)",
    "data:text/html,x",
    "http://untrusted.org",
  ])
    assert.equal(safeURL(s), "");
  assert.equal(
    safeURL("/assets/art.svg", { image: true }),
    "https://oceotownwalk.web.app/assets/art.svg",
  );
  assert.equal(
    safeURL("https://example.org/source"),
    "https://example.org/source",
  );
});

test("user-supplied site names are retained without invented map coordinates", () => {
  const sites = cloneDefault().places;
  for (const id of ["go-sau-thuan", "go-ut-trach"]) {
    const p = sites.find((p) => p.id === id);
    assert.ok(p);
    assert.equal(p.lat, null);
    assert.equal(p.lng, null);
    assert.equal(eligible(p), false);
    assert.equal(p.x, undefined);
    assert.equal(p.y, undefined);
  }
  assert.ok(
    sites.find((p) => p.id === "go-sau-thuan").aliases.includes("Gò 6 Thuận"),
  );
});

test("empty URLs never become the HTTPS homepage as an image source", () => {
  assert.equal(safeURL("", { image: true }), "");
  assert.equal(safeURL(null, { image: true }), "");
  assert.equal(safeURL(undefined), "");
});

test("all mapped coordinates lie within the cited OSM geometry",async()=>{
 const {readFile}=await import('node:fs/promises');
 const g=JSON.parse(await readFile(new URL('../assets/data/oceo-boundary.geojson',import.meta.url),'utf8')).geometry;
 const rings=g.type==='Polygon'?[g.coordinates]:g.coordinates;
 const insideRing=(point,ring)=>{let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if(((yi>point[1])!==(yj>point[1]))&&(point[0]<(xj-xi)*(point[1]-yi)/(yj-yi)+xi))hit=!hit;}return hit;};
 for(const p of [...cloneDefault().places,...cloneDefault().stops].filter(eligible))assert.ok(rings.some(poly=>insideRing([p.lng,p.lat],poly[0])&&!poly.slice(1).some(h=>insideRing([p.lng,p.lat],h))),p.name);
});

// A mountain detour must never become a compulsory stamp just because a pin is added.
test("museum and summit detour remain distinct; optional stops never count toward the Pass", () => {
  const d=cloneDefault();
  const museum=d.places.find(p=>p.id==='nha-trung-bay-van-hoa-oc-eo');
  const hidden=d.places.find(p=>p.id==='nha-trung-bay-cu-ba-the');
  assert.ok(museum && hidden);
  assert.equal(d.places.filter(p=>p.id==='chua-linh-son').length,1);
  assert.equal(d.itinerary.find(s=>s.time==='08:30').placeId,museum.id);
  assert.equal(d.itinerary.find(s=>s.time==='09:30').placeId,'chua-linh-son');
  assert.equal(hidden.lat,null);
  assert.equal(hidden.lng,null);
  assert.match(hidden.accessWarning,/ngày mưa/);
  assert.match(hidden.accessWarning,/xe ôm/);
  const mapped={...hidden,verified:true,coordinateSource:'https://www.openstreetmap.org/node/123',lat:10.2465,lng:105.1453};
  assert.equal(eligible(mapped),true);
  assert.equal(canCollectStamp(mapped),false);
  assert.equal(d.itinerary.some(s=>s.placeId===hidden.id),false);
  const invalid=cloneDefault();
  invalid.places.find(p=>p.id===hidden.id).collectible='false';
  assert.throws(()=>validateSite(invalid),/bộ tem/);
});

test("local food tips stay visible without fake pins; cafes have distinct sourced coordinates and booking details", () => {
  const d=cloneDefault();
  for (const id of ['bun-cua-oc-eo','banh-xeo-oc-eo','du-du-dam-oc-eo']) {
    const p=d.stops.find(p=>p.id===id);
    assert.equal(visibleStop(p),true);assert.equal(eligible(p),false);assert.equal(p.lat,null);
  }
  const cafe=d.stops.find(p=>p.id==='the-cafe-33');
  const xofa=d.stops.find(p=>p.id==='xofa');
  assert.equal(cafe.bookingUrl,'https://the-cafe-33.web.app');
  assert.match(cafe.bookingNotice,/thêm phí/);
  assert.equal(xofa.signature,'Sữa Gạo Phù Nam');
  assert.match(xofa.price,/25.000/);
  for (const p of [cafe,xofa]) {assert.equal(eligible(p),true);assert.equal(canCollectStamp(p),false);assert.ok(p.locationCode);}
  assert.notEqual(cafe.lat,xofa.lat);
  const invalid=cloneDefault();invalid.stops[0].bookingUrl='javascript:alert(1)';
  assert.throws(()=>validateSite(invalid),/HTTPS/);
});

test("Pass denominator is the full collection, not GPS-ready points; count unique earned destinations only", () => {
 const d=cloneDefault();
 const ids=['chua-linh-son','linh-son-bac','linh-son-nam','go-sau-thuan'];
 const state=passProgress(d.places,[...ids,ids[0],'not-a-site','ut-map','nha-trung-bay-cu-ba-the']);
 assert.equal(state.total,15);assert.equal(state.count,4);assert.equal(state.complete,false);
 assert.deepEqual(new Set(state.earned.map(p=>p.id)),new Set(ids));
 assert.equal(passProgress(d.places,d.places.filter(canCollectStamp).map(p=>p.id)).complete,false);
 assert.equal(passProgress(d.places,state.collection.map(p=>p.id)).complete,true);
 d.places.find(p=>p.id==='linh-son-bac').verified=false;
 assert.equal(passProgress(d.places,ids).total,15);assert.equal(passProgress(d.places,ids).count,4);
});

test("story export draws only earned stamps, escapes names and retains every stamp at completion", async () => {
 const {buildPassSVG}=await import('../assets/pass-art.js');
 const {collection}=passProgress(cloneDefault().places,[]);
 const empty=buildPassSVG({collection,earned:[],name:'Bạn <Óc Eo>',date:'05/11/2026'});
 assert.equal(empty.width,1080);assert.equal(empty.height,1920);
 assert.equal((empty.svg.match(/data-earned-stamp=/g)||[]).length,0);
 assert.ok(empty.svg.includes('Bạn &lt;Óc Eo&gt;'));
 assert.ok(!empty.svg.includes('Ít lướt'));
 assert.ok(empty.svg.includes('Chạm di sản. Chia sẻ Óc Eo.'));
 const full=buildPassSVG({collection,earned:collection,name:'Người khám phá',date:'05/11/2026'});
 assert.equal(full.height,1920);
 assert.equal((full.svg.match(/data-earned-stamp=/g)||[]).length,15);
 assert.equal(new Set([...full.svg.matchAll(/id="(cut-\d+)"/g)].map(m=>m[1])).size,15);
 for(const p of collection)assert.ok(full.svg.includes(`data-earned-stamp="${p.id}"`));
});

test('local cartography is attributed and clipped to the Óc Eo reference polygon', async () => {
  const {readFile}=await import('node:fs/promises');
  const data=JSON.parse(await readFile(new URL('../assets/data/oceo-town-map.geojson',import.meta.url),'utf8'));
  const reference=JSON.parse(await readFile(new URL('../assets/data/oceo-boundary.geojson',import.meta.url),'utf8'));
  assert.deepEqual(data.boundary,reference.geometry);
  assert.match(data.license,/odbl/);assert.match(data.attribution,/OpenStreetMap contributors/);
  assert.ok(data.features.some(f=>f.properties.role==='road'));
  assert.ok(data.features.some(f=>f.properties.role==='waterway'));
  assert.ok(data.features.some(f=>f.properties.name==='Núi Ba Thê'));
  const ring=data.boundary.coordinates[0];
  function inside([x,y]){
    let hit=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const [ax,ay]=ring[i],[bx,by]=ring[j],dx=bx-ax,dy=by-ay;
      const t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));
      if(Math.hypot(x-ax-t*dx,y-ay-t*dy)<1e-6)return true;
      if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)hit=!hit;
    }
    return hit;
  }
  function check(coords){if(typeof coords[0]==='number')assert.ok(inside(coords),`Outside Óc Eo: ${coords}`);else coords.forEach(check);}
  for(const f of data.features){assert.match(f.properties.source,/^https:\/\/www.openstreetmap.org\/(way|node)\/\d+$/);check(f.geometry.coordinates);}
});
