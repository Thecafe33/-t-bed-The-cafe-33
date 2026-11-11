import {HERITAGE_RESEARCH,RESEARCH_LABELS} from './heritage-research.js';
import {escapeHTML as e,safeURL,contentSourced} from './model.js';

export function heritageResearchHTML(place){
 const record=HERITAGE_RESEARCH[place.id];
 if(!record||place.category!=='heritage'||!place.scopeConfirmed||!contentSourced(place))return '';
 return `<section class="heritage-research"><h3>${e(RESEARCH_LABELS.title[0])}</h3>
 <dl>${['history','period','finds'].map(key=>`<div><dt>${e(RESEARCH_LABELS[key][0])}</dt><dd>${e(record[key][0])}</dd></div>`).join('')}</dl>
 <details><summary>${e(RESEARCH_LABELS.limits[0])}</summary><p>${e(record.limits[0])}</p></details>
 <div class="research-sources"><strong>${e(RESEARCH_LABELS.sources[0])}</strong><ul>${record.sources.filter(source=>safeURL(source.url)).map(source=>`<li><a href="${e(safeURL(source.url))}" target="_blank" rel="noopener noreferrer"><span>${e(source.label[0])}</span> <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div></section>`;
}
