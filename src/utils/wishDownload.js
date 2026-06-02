const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => resolve(image);
  image.onerror = reject;
  image.src = src;
});

const wrapText = (context, text, x, y, maxWidth, lineHeight, maxLines) => {
  const words = text.split(/\s+/);
  let line = '';
  let lines = 0;

  for (let index = 0; index < words.length; index += 1) {
    const testLine = `${line}${words[index]} `;
    if (context.measureText(testLine).width > maxWidth && line) {
      context.fillText(line.trim(), x, y);
      y += lineHeight;
      lines += 1;
      line = `${words[index]} `;
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }

  if (line && lines < maxLines) context.fillText(line.trim(), x, y);
};

const wrapTextLines = (context, text, maxWidth) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';

  for (let index = 0; index < words.length; index += 1) {
    const testLine = line ? `${line} ${words[index]}` : words[index];
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = words[index];
    } else {
      line = testLine;
    }
  }

  if (line) lines.push(line);
  return lines;
};

const drawRoundedRect = (context, x, y, width, height, radius = 24) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
};

const clampLines = (lines, maxLines) => {
  if (lines.length <= maxLines) return lines;
  const clipped = lines.slice(0, maxLines);
  const lastLine = clipped[maxLines - 1];
  clipped[maxLines - 1] = `${lastLine.replace(/\s+$/, '')}…`;
  return clipped;
};

const drawWishCardTile = async (context, wish, x, y, width, height) => {
  const contentWidth = width - 48;
  const hasImage = Boolean(wish.imageUrl);
  const imageBoxHeight = hasImage ? 220 : 0;

  context.save();
  drawRoundedRect(context, x, y, width, height, 34);
  context.fillStyle = '#ffffff';
  context.shadowColor = 'rgba(0, 0, 0, 0.1)';
  context.shadowBlur = 24;
  context.shadowOffsetY = 10;
  context.fill();
  context.restore();

  let cursorY = y + 34;

  if (hasImage) {
    drawRoundedRect(context, x + 24, cursorY, contentWidth, imageBoxHeight, 24);
    context.save();
    context.clip();
    try {
      const image = await loadImage(wish.imageUrl);
      const ratio = Math.max(contentWidth / image.width, imageBoxHeight / image.height);
      const imageWidth = image.width * ratio;
      const imageHeight = image.height * ratio;
      const imageX = x + 24 + (contentWidth - imageWidth) / 2;
      const imageY = cursorY + (imageBoxHeight - imageHeight) / 2;
      context.drawImage(image, imageX, imageY, imageWidth, imageHeight);
    } catch {
      context.fillStyle = '#f5ecff';
      context.fillRect(x + 24, cursorY, contentWidth, imageBoxHeight);
    }
    context.restore();
    cursorY += imageBoxHeight + 26;
  }

  if (wish.mood) {
    drawRoundedRect(context, x + 24, cursorY, 160, 48, 24);
    context.fillStyle = '#f5ebff';
    context.fill();
    context.fillStyle = '#7a3ea2';
    context.font = '700 18px Inter, sans-serif';
    context.fillText(wish.mood, x + 36, cursorY + 32);
    cursorY += 66;
  }

  const fontSize = wish.message.length > 260 ? 26 : wish.message.length > 180 ? 28 : 30;
  context.fillStyle = '#392e4a';
  context.font = `600 ${fontSize}px Inter, sans-serif`;
  const lines = clampLines(wrapTextLines(context, wish.message || '', contentWidth), 8);
  const lineHeight = fontSize + 10;
  lines.forEach((line, index) => {
    context.fillText(line, x + 24, cursorY + lineHeight * index);
  });

  context.fillStyle = '#6d5380';
  context.font = '700 24px Inter, sans-serif';
  context.fillText(`- ${wish.name || 'Friend'}`, x + 24, y + height - 52);

  context.fillStyle = '#b89ef8';
  context.font = '600 16px Inter, sans-serif';
  context.fillText('Made with birthday wishes', x + 24, y + height - 24);
};

const createWishCollageCanvas = async (pageWishes, pageIndex, pageCount, options = {}) => {
  const width = 1700;
  const height = 2360;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#fff6f8');
  gradient.addColorStop(0.35, '#fff5f2');
  gradient.addColorStop(0.75, '#eef5ff');
  gradient.addColorStop(1, '#fdf8ff');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  drawBalloon(context, 200, 160, '#ff8ed6', 1.05);
  drawBalloon(context, 410, 120, '#ffd96d', 0.9);
  drawBalloon(context, 1360, 170, '#7ad1ff', 0.95);
  drawCake(context, 1480, 240, 0.6);

  context.fillStyle = 'rgba(255, 255, 255, 0.72)';
  drawRoundedRect(context, 80, 66, 1540, 140, 48);
  context.fill();

  context.fillStyle = '#4a2c5b';
  context.font = '700 62px Georgia, serif';
  context.textAlign = 'left';
  context.fillText('Thank you for the birthday wishes', 120, 136);

  context.fillStyle = '#7a4d91';
  context.font = '600 28px Inter, sans-serif';
  context.fillText(options.heading || 'Birthday Wishes Collage', 120, 184);
  context.fillText(`Page ${pageIndex + 1} of ${pageCount}`, 1400, 164);

  const cardWidth = 720;
  const cardHeight = 520;
  const columns = 2;
  const gapX = 60;
  const gapY = 50;
  const startX = 100;
  const startY = 220;

  for (let index = 0; index < pageWishes.length; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + column * (cardWidth + gapX);
    const y = startY + row * (cardHeight + gapY);
    await drawWishCardTile(context, pageWishes[index], x, y, cardWidth, cardHeight);
  }

  return canvas;
};

const paginateWishPages = (wishes) => {
  const itemsPerPage = 6;
  const pages = [];
  for (let index = 0; index < wishes.length; index += itemsPerPage) {
    pages.push(wishes.slice(index, index + itemsPerPage));
  }
  return pages;
};

export const downloadWishCollagePages = async (wishes, options = {}) => {
  const pages = paginateWishPages(wishes);

  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const pageCanvas = await createWishCollageCanvas(pages[pageIndex], pageIndex, pages.length, options);
    const filename = `birthday-wishes-page-${pageIndex + 1}.png`;
    downloadBlob(await canvasToBlob(pageCanvas), filename);
  }
};

const drawBalloon = (context, x, y, color, scale = 1) => {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  const balloonGradient = context.createLinearGradient(-34, -48, 42, 58);
  balloonGradient.addColorStop(0, '#ffffff');
  balloonGradient.addColorStop(1, color);
  context.fillStyle = balloonGradient;
  context.beginPath();
  context.ellipse(0, 0, 42, 54, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = 'rgba(72, 35, 57, 0.18)';
  context.beginPath();
  context.moveTo(-7, 51);
  context.lineTo(7, 51);
  context.lineTo(0, 65);
  context.closePath();
  context.fill();
  context.strokeStyle = 'rgba(72, 35, 57, 0.22)';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 65);
  context.bezierCurveTo(16, 112, -18, 152, 8, 198);
  context.stroke();
  context.restore();
};

const drawCake = (context, x, y, scale = 1) => {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = '#5d7cff';
  context.fillRect(-8, -82, 16, 48);
  context.fillStyle = '#ffbf2f';
  context.beginPath();
  context.ellipse(0, -96, 12, 18, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#ff7fb4';
  context.roundRect(-110, -36, 220, 54, 18);
  context.fill();
  context.fillStyle = '#8de7ff';
  context.roundRect(-138, 8, 276, 64, 18);
  context.fill();
  context.fillStyle = '#ffbf2f';
  context.roundRect(-168, 58, 336, 78, 20);
  context.fill();
  context.fillStyle = 'rgba(255, 255, 255, 0.78)';
  [-76, -24, 34, 86].forEach((dot) => {
    context.beginPath();
    context.arc(dot, -10, 8, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();
};

const drawConfettiPiece = (context, x, y, color, rotation = 0, size = 10) => {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.fillStyle = color;
  context.fillRect(-size / 2, -size / 2, size, size);
  context.restore();
};

const drawPopper = (context, x, y, rotation = 0, colors = ['#ff5db9','#ffbf2f','#6ad8ff']) => {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  // cone
  context.fillStyle = '#5d7cff';
  context.beginPath();
  context.moveTo(-18, 6);
  context.lineTo(18, 6);
  context.lineTo(0, -48);
  context.closePath();
  context.fill();
  // stripes
  context.fillStyle = 'rgba(255,255,255,0.12)';
  context.fillRect(-6, -20, 12, 26);

  // confetti burst
  for (let i = 0; i < 14; i += 1) {
    const angle = (Math.PI * 2 * i) / 14;
    const len = 28 + Math.random() * 28;
    const cx = Math.cos(angle) * len;
    const cy = Math.sin(angle) * len;
    const color = colors[i % colors.length];
    drawConfettiPiece(context, cx, cy, color, Math.random() * Math.PI, 8);
  }
  context.restore();
};

const drawSparkle = (context, x, y, size, color) => {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, -size);
  context.lineTo(size * 0.25, -size * 0.25);
  context.lineTo(size, 0);
  context.lineTo(size * 0.25, size * 0.25);
  context.lineTo(0, size);
  context.lineTo(-size * 0.25, size * 0.25);
  context.lineTo(-size, 0);
  context.lineTo(-size * 0.25, -size * 0.25);
  context.closePath();
  context.fill();
  context.restore();
};

export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (blob) resolve(blob);
    else reject(new Error('Status download failed'));
  }, 'image/png', 0.95);
});

export const makeSafeName = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'birthday-wish';

const createStatusCanvas = async (wish, includeImage, options = {}) => {
  const { heading = 'Happy Birthday', topLine = '' } = options;
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const context = canvas.getContext('2d');

  const gradient = context.createLinearGradient(0, 0, 1600, 900);
  gradient.addColorStop(0, '#fff6a8');
  gradient.addColorStop(0.36, '#fff2f8');
  gradient.addColorStop(0.7, '#e8f8ff');
  gradient.addColorStop(1, '#f6e4ff');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1600, 900);

  const confettiColors = ['#ff5db9', '#ffbf2f', '#6ad8ff', '#d16fff', '#7fbf7f'];
  const confettiPositions = [
    [220, 76, 0.45],
    [480, 150, -0.4],
    [900, 64, 0.8],
    [1250, 130, -0.2],
    [1420, 240, 0.6],
    [320, 500, -0.3],
    [720, 580, 0.35],
    [1180, 440, -0.5],
    [1340, 620, 0.25],
  ];
  confettiPositions.forEach(([x, y, rotation], index) => drawConfettiPiece(context, x, y, confettiColors[index % confettiColors.length], rotation, 12));
  drawSparkle(context, 1080, 90, 20, '#fff1b8');
  drawSparkle(context, 760, 180, 18, '#ffd6a5');
  drawSparkle(context, 1460, 320, 16, '#ffe066');
  drawBalloon(context, 110, 138, '#ff75ac', 1.05);
  drawBalloon(context, 250, 120, '#ffd36a', 0.9);
  drawBalloon(context, 1458, 150, '#8de7ff', 0.95);
  drawBalloon(context, 1390, 690, '#ffbf2f', 0.72);
  drawPopper(context, 420, 92, -0.5);
  drawPopper(context, 1240, 86, 0.35);
  drawCake(context, 184, 710, 0.62);

  context.fillStyle = 'rgba(255, 255, 255, 0.36)';
  for (let i = 0; i < 34; i += 1) {
    const x = 86 + ((i * 137) % 1420);
    const y = 58 + ((i * 83) % 760);
    context.beginPath();
    context.arc(x, y, i % 2 ? 5 : 8, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = 'rgba(255, 255, 255, 0.84)';
  context.strokeStyle = 'rgba(255, 93, 158, 0.26)';
  context.lineWidth = 4;
  context.roundRect(108, 92, 1384, 716, 34);
  context.fill();
  context.stroke();

  context.fillStyle = 'rgba(255, 191, 47, 0.16)';
  context.roundRect(140, 124, 1320, 652, 26);
  context.fill();

  context.save();
  context.fillStyle = 'rgba(255, 255, 255, 0.75)';
  context.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  context.lineWidth = 2;
  context.roundRect(220, 128, 1160, 108, 54);
  context.fill();
  context.stroke();
  context.restore();

  context.shadowColor = 'rgba(0, 0, 0, 0.12)';
  context.shadowBlur = 18;
  context.shadowOffsetY = 4;
  context.fillStyle = '#b01968';
  context.font = '700 72px Georgia, serif';
  context.textAlign = 'center';
  context.fillText(heading, 800, 210);
  context.shadowColor = 'transparent';

  let textX = 256;
  let textY = 336;
  let textMaxWidth = 1088;
  let maxLines = 5;
  if (includeImage && wish.imageUrl) {
    const image = await loadImage(wish.imageUrl);
    const frame = { x: 190, y: 252, width: 488, height: 460 };
    const scale = Math.max(frame.width / image.width, frame.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const x = frame.x + (frame.width - width) / 2;
    const y = frame.y + (frame.height - height) / 2;

    context.save();
    context.roundRect(frame.x, frame.y, frame.width, frame.height, 34);
    context.clip();
    context.drawImage(image, x, y, width, height);
    context.restore();
    textX = 750;
    textY = 342;
    textMaxWidth = 618;
    maxLines = 4;
  }

  context.textAlign = 'left';
  if (topLine) {
    context.fillStyle = '#b01968';
    context.font = '700 50px Georgia, serif';
    context.fillText(topLine, textX, textY);
    textY += 70;
  }

  const messageLength = wish.message.length;
  const fontSize = messageLength > 260 ? 32 : messageLength > 160 ? 38 : 44;
  context.fillStyle = '#57465a';
  context.font = `600 ${fontSize}px Inter, sans-serif`;
  wrapText(context, wish.message, textX, textY, textMaxWidth, fontSize + 18, maxLines);

  context.fillStyle = '#7e5263';
  context.font = '800 34px Inter, sans-serif';
  context.fillText(`- ${wish.name}`, textX, 688);

  context.fillStyle = '#b04b00';
  context.font = '800 24px Inter, sans-serif';
  context.textAlign = 'center';
  context.fillText('Made with a birthday wish', 800, 754);

  return canvas;
};

export const downloadWishStatus = async (wish, options = {}) => {
  try {
    const canvas = await createStatusCanvas(wish, true, options);
    downloadBlob(await canvasToBlob(canvas), `${makeSafeName(wish.name)}-status-wish.png`);
  } catch {
    const canvas = await createStatusCanvas(wish, false, options);
    downloadBlob(await canvasToBlob(canvas), `${makeSafeName(wish.name)}-status-wish.png`);
  }
};
