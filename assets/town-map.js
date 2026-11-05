import {appURL} from './app-paths.js';
import {escapeHTML as e} from './model.js';
const NS='http://www.w3.org/2000/svg';
const mainRoad=kind=>['primary','secondary','tertiary','primary_link','secondary_link','tertiary_link'].includes(kind);
const footway=kind=>['path','footway','track','steps','cycleway'].includes(kind);
const forest=kind=>['wood','forest','scrub','orchard'].includes(kind);
function addPatterns(svg){
 const defs=document.createElementNS(NS,'defs');
 defs.innerHTML='<pattern id="town-fields" width="17" height="17" patternUnits="userSpaceOnUse"><rect width="17" height="17" fill="#edf0d7"/><path d="m-3 17 20-20m-4 24 12-12" stroke="#dce3bb" stroke-width=".7"/></pattern><pattern id="town-grove" width="23" height="23" patternUnits="userSpaceOnUse"><rect width="23" height="23" fill="#c8d8aa"/><path d="M11 8c-4 0-5 4-2 6-3 2-1 5 2 4 3 1 5-2 2-4 3-2 2-6-2-6Z" fill="#b1c596"/><path d="M11 15v5" stroke="#91ab73" stroke-width=".7"/></pattern>';
 svg.prepend(defs);
}
function longestLine(feature){
 const g=feature.geometry;
 if(g.type==='LineString')return g.coordinates;
 if(g.type==='MultiLineString')return [...g.coordinates].sort((a,b)=>b.length-a.length)[0];
 return null;
}
/** Own SVG cartography from a clipped, attributed OSM extract. No remote tiles. */
export async function mountTownMap(map){
 const response=await fetch(appURL('assets/data/oceo-town-map.geojson'));
 if(!response.ok)throw Error('Local map unavailable');
 const data=await response.json();
 if(data.type!=='FeatureCollection'||!Array.isArray(data.features)||!data.boundary)throw Error('Invalid local map');
 const pane=map.createPane('town-cartography');pane.style.zIndex=200;pane.classList.add('townwalk-cartography');
 const renderer=L.svg({pane:'town-cartography',padding:.5});
 const layers=L.layerGroup().addTo(map);
 const geo=(features,style)=>L.geoJSON({type:'FeatureCollection',features},{renderer,interactive:false,style}).addTo(layers);
 const boundary=L.geoJSON({type:'Feature',properties:{},geometry:data.boundary},{renderer,interactive:false,style:{fillColor:'#f4f1df',fillOpacity:1,color:'#b6bea2',weight:1.2,dashArray:'3 5'}}).addTo(layers);
 const land=data.features.filter(f=>f.properties.role==='land');
 geo(land,f=>{const k=f.properties.kind;return {color:forest(k)?'#b5c99a':'#e0e2c9',weight:.6,fillOpacity:1,fillColor:k==='water'?'#bad9db':forest(k)?'url(#town-grove)':k==='farmland'?'url(#town-fields)':k==='residential'?'#ede5d7':'#e6e9ce'};});
 const water=data.features.filter(f=>f.properties.role==='waterway');
 const waterways=geo(water,{color:'#9ac6ce',weight:3,opacity:.9,lineCap:'round'});
 const roads=data.features.filter(f=>f.properties.role==='road');
 const casing=geo(roads,f=>({color:'#fffdf3',weight:mainRoad(f.properties.kind)?7:footway(f.properties.kind)?2:4.5,opacity:1,lineCap:'round',lineJoin:'round'}));
 const ink=geo(roads,f=>({color:mainRoad(f.properties.kind)?'#e3c778':footway(f.properties.kind)?'#b0b98d':'#ded5bb',weight:mainRoad(f.properties.kind)?3.2:footway(f.properties.kind)?1:1.6,opacity:1,dashArray:footway(f.properties.kind)||f.properties.access?'3 4':null,lineCap:'round',lineJoin:'round'}));
 addPatterns(pane.querySelector('svg'));
 map.attributionControl.setPrefix(false);
 map.attributionControl.addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>');
 L.control.scale({position:'bottomleft',imperial:false,maxWidth:65}).addTo(map);
 const bounds=boundary.getBounds();map.setMaxBounds(bounds.pad(.6));map.setMinZoom(12);
 const labels=L.layerGroup().addTo(layers), names=new Map();
 for(const feature of roads){const name=feature.properties.name,coords=longestLine(feature);if(!name||!coords||name.startsWith('Cầu'))continue;const old=names.get(name);if(!old||coords.length>old.length)names.set(name,coords);}
 const roadLabels=[];
 for(const [name,coords] of names){
  if(!/943|Gò Cây Thị|Vành đai/.test(name))continue;
  const middle=Math.floor(coords.length/2),point=coords[middle];
  const label=L.marker([point[1],point[0]],{pane:'town-cartography',interactive:false,keyboard:false,icon:L.divIcon({className:'town-road-label',html:`<span data-no-translate>${e(name.replace('Tỉnh Lộ ','ĐT. ').replace('Đường tỉnh ','ĐT. '))}</span>`,iconSize:[140,20],iconAnchor:[70,10]})});
  roadLabels.push(label);
 }
 for(const peak of data.features.filter(f=>f.properties.role==='peak')){
  const [lng,lat]=peak.geometry.coordinates;
  L.marker([lat,lng],{pane:'town-cartography',interactive:false,keyboard:false,icon:L.divIcon({className:'town-hill-label',html:`<svg viewBox="0 0 100 65" aria-hidden="true"><path d="M5 56 32 17 43 31 60 7 95 56Z" fill="#809b65"/><path d="m32 17 11 14 17-24 9 18-10-5-15 22-12-11-17 25" fill="#b7ca8c"/><path d="M4 57h92" fill="none" stroke="#173f36" stroke-width="1.5"/></svg><span data-no-translate>${e(peak.properties.name||'')}</span>`,iconSize:[100,88],iconAnchor:[50,44]})}).addTo(labels);
 }
 function update(){
  const zoom=map.getZoom(), factor=Math.max(.7,Math.min(1.8,1+(zoom-15)*.2));
  waterways.setStyle({weight:2.4*factor});
  casing.setStyle(f=>({weight:(mainRoad(f.properties.kind)?7:footway(f.properties.kind)?2:4.5)*factor}));
  ink.setStyle(f=>({weight:(mainRoad(f.properties.kind)?3.2:footway(f.properties.kind)?1:1.6)*factor}));
  for(const label of roadLabels){if(zoom>=14){if(!labels.hasLayer(label))labels.addLayer(label);}else labels.removeLayer(label);}
  pane.classList.toggle('town-map-close',zoom>=17);
 }
 map.on('zoomend',update);update();
 return {data,destroy(){map.off('zoomend',update);layers.remove();pane.remove();}};
}
