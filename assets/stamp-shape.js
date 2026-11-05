/** Rounded paper with broad, inward semicircular cuts, shared by UI and PNG export. */
export function stampOutline(width, height) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0)
    throw Error('Stamp dimensions must be positive.');
  const radius = Math.min(width, height) * .07;
  const corner = Math.min(width, height) * .027;
  const positions = length => {
    const count = Math.max(2, Math.round(length / (radius * 2.55)) - 1);
    return Array.from({length: count}, (_, i) => length * (i + 1) / (count + 1));
  };
  const horizontal = positions(width), vertical = positions(height);
  const n = value => Number(value.toFixed(3));
  const arc = (x,y) => `A${n(radius)} ${n(radius)} 0 0 0 ${n(x)} ${n(y)}`;
  const path = [`M${n(corner)} 0`];
  for (const x of horizontal) path.push(`L${n(x-radius)} 0`,arc(x+radius,0));
  path.push(`L${n(width-corner)} 0 Q${n(width)} 0 ${n(width)} ${n(corner)}`);
  for (const y of vertical) path.push(`L${n(width)} ${n(y-radius)}`,arc(width,y+radius));
  path.push(`L${n(width)} ${n(height-corner)} Q${n(width)} ${n(height)} ${n(width-corner)} ${n(height)}`);
  for (const x of horizontal.slice().reverse()) path.push(`L${n(x+radius)} ${n(height)}`,arc(x-radius,height));
  path.push(`L${n(corner)} ${n(height)} Q0 ${n(height)} 0 ${n(height-corner)}`);
  for (const y of vertical.slice().reverse()) path.push(`L0 ${n(y+radius)}`,arc(0,y-radius));
  path.push(`L0 ${n(corner)} Q0 0 ${n(corner)} 0 Z`);
  return path.join(' ');
}
