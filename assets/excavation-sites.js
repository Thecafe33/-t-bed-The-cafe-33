// Excavation game configuration. Every find refers to a sourced card in artifacts.js.
//
// ADD AN IMAGE LATER
//   1. Put a transparent-background WebP in assets/heritage-art/ (e.g. dau-phat-naga.webp).
//   2. Set `image` below to the file name without extension (e.g. image:'dau-phat-naga').
//   Finds with image:null use a drawn placeholder labelled as temporary.
//
// ADD MORE FINDS
//   Add a sourced card to artifacts.js first, then list its id in FINDS and in a site.
//   kind: ring | relief | head | jar | linga | beads (placeholder shape and sound of the dig)
//   size: illustration box in simulated metres (not the real object size)
//   fragile: the trowel scratches it; switch to the bamboo pick near its surface
//   small: tiny objects that only appear when excavated soil is sieved
export const FINDS = {
  'nandin-giong-cat': { kind: 'ring', image: 'nandin-giong-cat', size: 0.62, fragile: true },
  'phat-linh-son-bac': { kind: 'relief', image: 'linh-son-bac-relief', size: 1.35 },
  'dau-phat-naga': { kind: 'head', image: null, size: 0.85 },
  'mo-vo-cay-tram': { kind: 'jar', image: 'jar-go-cay-tram', size: 1.05 },
  'mo-vo-linh-son-nam': { kind: 'jar', image: null, size: 1.15 },
  'linga-yoni-linh-son': { kind: 'linga', image: 'linga-yoni-linh-son', size: 1.1 },
  'hat-chuoi-go-oc-eo': { kind: 'beads', image: null, small: true },
  'hat-chuoi-lung-lon': { kind: 'beads', image: null, small: true },
  'hat-chuoi-giong-trom': { kind: 'beads', image: null, small: true },
};

// Sites group finds by the area named in their sources. The practice field mixes
// every find and is labelled as a training ground, not a real location.
export const SITES = [
  {
    id: 'do-thi-oc-eo',
    name: 'Đô thị cổ Óc Eo',
    note: 'Gò Giồng Cát, Gò Cây Trâm, Gò Óc Eo, Lung Lớn, Gò Giồng Trôm',
    cols: 7, rows: 9,
    finds: ['nandin-giong-cat', 'mo-vo-cay-tram', 'hat-chuoi-go-oc-eo', 'hat-chuoi-lung-lon', 'hat-chuoi-giong-trom'],
  },
  {
    id: 'ba-the-linh-son',
    name: 'Núi Ba Thê – Linh Sơn',
    note: 'Linh Sơn Bắc, Linh Sơn Nam, chùa Linh Sơn',
    cols: 7, rows: 9,
    finds: ['phat-linh-son-bac', 'dau-phat-naga', 'mo-vo-linh-son-nam', 'linga-yoni-linh-son'],
  },
  {
    id: 'bai-tong-hop',
    name: 'Bãi luyện tập tổng hợp',
    note: 'Gom mọi hiện vật trong một hố lớn · không phải một địa điểm thật',
    cols: 10, rows: 12,
    finds: Object.keys(FINDS),
  },
];
