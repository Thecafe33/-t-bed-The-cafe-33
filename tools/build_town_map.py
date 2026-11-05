#!/usr/bin/env python3
"""Build the locally styled Óc Eo extract; requires shapely. OSM data remains ODbL.
Usage: python3 tools/build_town_map.py /path/to/overpass.json
Use --download to request a fresh extract instead. Output is clipped to the
shipped OSM reference polygon, not a legally certified administrative boundary.
"""
from pathlib import Path
import argparse,json
from datetime import datetime,timezone
from urllib.request import Request,urlopen
from urllib.parse import urlencode
from shapely.geometry import shape,mapping,LineString,Polygon,Point
from shapely.validation import make_valid
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('input',nargs='?');parser.add_argument('--download',action='store_true');args=parser.parse_args()
boundary=json.loads((root/'assets/data/oceo-boundary.geojson').read_text());clip=shape(boundary['geometry'])
west,south,east,north=clip.bounds;bbox=f'{south},{west},{north},{east}'
query=f'''[out:json][timeout:90];(way["highway"]({bbox});way["waterway"]({bbox});way["natural"~"^(water|wood|scrub|wetland)$"]({bbox});way["landuse"~"^(forest|orchard|farmland|residential|retail|industrial|grass)$"]({bbox});node["natural"="peak"]({bbox}););out geom;'''
if args.download:
 request=Request('https://overpass-api.de/api/interpreter',data=urlencode({'data':query}).encode(),headers={'User-Agent':'OcEoTownwalk/1.0 (https://thecafe33.github.io/-t-bed-The-cafe-33/)'})
 with urlopen(request,timeout=110) as response:raw=json.load(response)
elif args.input:raw=json.loads(Path(args.input).read_text())
else:parser.error('provide an Overpass JSON input or --download')
features=[]
for entry in raw['elements']:
 tags=entry.get('tags',{});name=tags.get('name','');role=None;kind=''
 if entry['type']=='node' and tags.get('natural')=='peak':geom=Point(entry['lon'],entry['lat']);role='peak'
 else:
  coords=[(p['lon'],p['lat']) for p in entry.get('geometry',[])];closed=len(coords)>3 and coords[0]==coords[-1]
  if len(coords)<2:continue
  if 'highway' in tags:role='road';kind=tags['highway'];geom=LineString(coords)
  elif 'waterway' in tags:role='waterway';kind=tags['waterway'];geom=LineString(coords)
  elif closed:role='land';kind=tags.get('natural',tags.get('landuse',''));geom=make_valid(Polygon(coords))
  else:continue
 geom=geom.intersection(clip).simplify(.000012,preserve_topology=True)
 if geom.is_empty or geom.geom_type=='GeometryCollection':continue
 if role!='peak' and geom.area==0 and geom.length<.00002:continue
 props={'role':role,'kind':kind,'source':f"https://www.openstreetmap.org/{entry['type']}/{entry['id']}"}
 if name:props['name']=name
 if tags.get('access') in ['private','no']:props['access']=tags['access']
 features.append({'type':'Feature','properties':props,'geometry':mapping(geom)})
def rounded(value):
 if isinstance(value,float):return round(value,7)
 if isinstance(value,dict):return {k:rounded(v) for k,v in value.items()}
 if isinstance(value,(list,tuple)):return [rounded(v) for v in value]
 return value
out={'type':'FeatureCollection','name':'Óc Eo Townwalk · local cartography','attribution':'© OpenStreetMap contributors','license':'https://opendatacommons.org/licenses/odbl/1-0/','source':'https://overpass-api.de/api/interpreter','osmTimestamp':raw.get('osm3s',{}).get('timestamp_osm_base',''),'retrievedAt':datetime.now(timezone.utc).date().isoformat(),'scopeSource':boundary['properties']['source'],'scopeNotice':boundary['properties']['notice'],'boundary':boundary['geometry'],'features':features}
path=root/'assets/data/oceo-town-map.geojson';path.write_text(json.dumps(rounded(out),ensure_ascii=False,separators=(',',':'))+'\n');print(len(features),'clipped features;',path.stat().st_size,'bytes')
