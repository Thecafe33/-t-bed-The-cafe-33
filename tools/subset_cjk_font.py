#!/usr/bin/env python3
"""Rebuild the shipped Chinese UI font subset from Noto CJK (fontTools + brotli)."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset
import argparse
root=Path(__file__).resolve().parent.parent
parser=argparse.ArgumentParser();parser.add_argument('--source-dir',default='/usr/share/fonts/opentype/noto');args=parser.parse_args()
text='简体中文'
for path in list((root/'assets').glob('*.js'))+list(root.glob('*.html')):text+=path.read_text()
chars=''.join(sorted({c for c in text if 0x2e80<=ord(c)<=0x9fff or 0xf900<=ord(c)<=0xfaff or 0xff00<=ord(c)<=0xffef}))
for style in ['Regular','Bold']:
 font=TTFont(str(Path(args.source_dir)/f'NotoSansCJK-{style}.ttc'),fontNumber=2)
 options=subset.Options();options.flavor='woff2';options.layout_features=['ccmp','locl','kern'];options.name_IDs=[0,1,2,3,4,5,6,13,14,16,17];options.name_legacy=True
 sub=subset.Subsetter(options=options);sub.populate(text=chars);sub.subset(font)
 names={1:'Townwalk SC',4:'Townwalk SC '+style,6:'TownwalkSC-'+style,16:'Townwalk SC'}
 for record in font['name'].names:
  if record.nameID in names:record.string=names[record.nameID].encode(record.getEncoding())
 font.recalcTimestamp=False
 font.flavor='woff2';dest=root/'assets/fonts'/f'townwalk-sc-{style.lower()}.woff2';font.save(str(dest));print(dest.name,len(chars),'characters',dest.stat().st_size,'bytes')
