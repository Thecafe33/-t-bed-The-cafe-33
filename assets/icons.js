const paths = {
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  locate: '<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',

  sound: '<path d="m3 9 5 0 5-5v16l-5-5H3Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  soundoff: '<path d="m3 9 5 0 5-5v16l-5-5H3Zm14 0 5 6m0-6-5 6"/>',
  compass:
    '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  arrowup: '<path d="M6 18 18 6M6 6h12v12"/>',
  star: '<path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1-5.6-2.9L6.4 20l1.1-6.1L3 9.5l6.2-.9Z"/>',
  passport:
    '<rect x="5" y="3" width="15" height="18" rx="3"/><path d="M8 3v18m4-5h5"/><circle cx="14.5" cy="10" r="3"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
  leaf: '<path d="M20 3C7 2 2 8 5 15s16 8 15-12ZM5 20 16 8"/>',
  temple: '<path d="m3 10 9-7 9 7ZM5 11v7m7-7v7m7-7v7M3 21h18M2 18h20"/>',
  pot: '<path d="M8 3h8M9 3v5c-8 5-8 13 3 13s11-8 3-13V3M7 12h10M6 16h12"/>',
  gem: '<path d="m3 9 4-5h10l4 5-9 12ZM3 9h18M7 4l5 17 5-17"/>',
  food: '<path d="M5 3v7m4-7v7M3 3v5a4 4 0 0 0 8 0V3M7 12v9M19 3c-4 4-4 9 0 9V3v18"/>',
  coffee:
    '<path d="M4 8h12v7a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5ZM16 9h2a3 3 0 0 1 0 6h-2M7 2v2m5-2v2M2 22h18"/>',
  bed: '<path d="M3 5v16m18-12v12M3 17h18M3 9h14a4 4 0 0 1 4 4v4M6 9v8"/>',
  camera: '<path d="m8 5 2-2h4l2 2h4v15H4V5Z"/><circle cx="12" cy="12" r="4"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Zm-4 9 3 3 5-6"/>',
  logout: '<path d="M10 3H4v18h6m4-14 5 5-5 5M8 12h13"/>',
  settings: '<path d="M4 7h16M4 17h16M9 4v6m6 4v6"/>',
  flag: '<path d="M5 22V3c5-4 9 4 14 0v10c-5 4-9-4-14 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  heart:
    '<path d="M12 21 3.8 13A5.5 5.5 0 0 1 12 5.7 5.5 5.5 0 0 1 20.2 13Z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
};
export const icon = (name, cls = "") =>
  `<svg class="icon ${cls}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.compass}</svg>`;
export const mark = `<svg viewBox="0 0 40 40" class="brand-mark" aria-hidden="true"><g fill="currentColor"><path d="M20 20C-6 19 8-4 20 20Zm0 0C21-6 44 8 20 20Zm0 0C46 21 32 44 20 20Zm0 0C19 46-4 32 20 20Z"/><circle cx="20" cy="20" r="4"/></g></svg>`;
