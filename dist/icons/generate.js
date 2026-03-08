const { createCanvas } = require('canvas');
const fs = require('fs');
[16, 48, 128].forEach(size => {
  const c = createCanvas(size, size);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();
  ctx.fillStyle = '#1c1917';
  ctx.font = `bold ${size * 0.6}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('J', size/2, size/2 + size*0.05);
  fs.writeFileSync(`icon${size}.png`, c.toBuffer('image/png'));
});
console.log('Icons generated');
