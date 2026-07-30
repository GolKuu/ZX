/**
 * Remove the coloured gameplay-diagram layer from IDOL's attack panels.
 *
 * The source artwork has blue hurtboxes, red hitboxes and a green pushbox baked
 * into it. Their thin saturated outlines are restored from neighbouring pixels;
 * that opens the pale box fills to the already-keyed background, which can then
 * be flood-cleared without touching the fighter inside her own ink outline.
 */
export function cleanIdolAttack(data, width, height) {
  const ink = debugInkMask(data, width, height);
  const character = characterMask(data, ink, width, height);
  restoreDebugInk(data, ink, width, height);
  clearBackgroundWashes(data, character, width, height);
  clearOutsideCharacter(data, character);
  return data;
}

function debugInkMask(data, width, height) {
  const mask = new Uint8Array(width * height);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const offset = pixel * 4;
    if (data[offset + 3] === 0) continue;
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const light = luminance(red, green, blue);
    const blueInk = (
      blue - red > 42
      && blue - green > 17
      && blue > 112
      && (light < 188 || blue - red > 92)
    );
    const greenInk = (
      green - red > 22
      && green - blue > 5
      && green > 92
      && light < 188
    );
    const redInk = (
      red - green > 62
      && red - blue > 42
      && red > 174
      && green < 148
      && blue < 148
      && Math.abs(green - blue) < 38
    );
    if (blueInk || greenInk || redInk) mask[pixel] = 1;
  }
  return mask;
}

function restoreDebugInk(data, mask, width, height) {
  const source = Buffer.from(data);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel] === 0) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const horizontal = opposingSamples(source, mask, width, height, x, y, 1, 0);
    const vertical = opposingSamples(source, mask, width, height, x, y, 0, 1);
    const pair = bestPair(horizontal, vertical);
    const colour = pair === null
      ? nearestSample(source, mask, width, height, x, y)
      : average(pair[0], pair[1]);
    if (colour === null) {
      data[pixel * 4 + 3] = 0;
      continue;
    }
    const offset = pixel * 4;
    data[offset] = colour[0];
    data[offset + 1] = colour[1];
    data[offset + 2] = colour[2];
    data[offset + 3] = 255;
  }
}

function opposingSamples(data, mask, width, height, x, y, dx, dy) {
  const before = directionalSample(data, mask, width, height, x, y, -dx, -dy);
  const after = directionalSample(data, mask, width, height, x, y, dx, dy);
  return before === null || after === null ? null : [before, after];
}

function directionalSample(data, mask, width, height, x, y, dx, dy) {
  for (let distance = 1; distance <= 7; distance += 1) {
    const sampleX = x + dx * distance;
    const sampleY = y + dy * distance;
    if (sampleX < 0 || sampleY < 0 || sampleX >= width || sampleY >= height) {
      return null;
    }
    const pixel = sampleY * width + sampleX;
    if (mask[pixel] !== 0 || data[pixel * 4 + 3] === 0) continue;
    const offset = pixel * 4;
    return [data[offset], data[offset + 1], data[offset + 2]];
  }
  return null;
}

function bestPair(horizontal, vertical) {
  if (horizontal === null) return vertical;
  if (vertical === null) return horizontal;
  return colourDistance(horizontal[0], horizontal[1])
    <= colourDistance(vertical[0], vertical[1])
    ? horizontal
    : vertical;
}

function nearestSample(data, mask, width, height, x, y) {
  for (let radius = 1; radius <= 7; radius += 1) {
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== radius) continue;
        const sampleX = x + dx;
        const sampleY = y + dy;
        if (sampleX < 0 || sampleY < 0 || sampleX >= width || sampleY >= height) {
          continue;
        }
        const pixel = sampleY * width + sampleX;
        if (mask[pixel] !== 0 || data[pixel * 4 + 3] === 0) continue;
        const offset = pixel * 4;
        return [data[offset], data[offset + 1], data[offset + 2]];
      }
    }
  }
  return null;
}

function characterMask(data, ink, width, height) {
  const anchors = new Uint8Array(width * height);
  for (let pixel = 0; pixel < anchors.length; pixel += 1) {
    const offset = pixel * 4;
    if (
      data[offset + 3] !== 0
      && ink[pixel] === 0
      && !isBackgroundWash(data[offset], data[offset + 1], data[offset + 2])
    ) {
      anchors[pixel] = 1;
    }
  }

  const figure = meaningfulMaskComponents(anchors, width, height);
  const closed = erode(dilate(figure, width, height, 12), width, height, 12);
  const barrier = new Uint8Array(width * height);
  for (let pixel = 0; pixel < barrier.length; pixel += 1) {
    if (figure[pixel] !== 0 || closed[pixel] !== 0) barrier[pixel] = 1;
  }
  const outside = new Uint8Array(width * height);
  const stack = [];
  const consider = (pixel) => {
    if (
      pixel < 0
      || pixel >= outside.length
      || outside[pixel] !== 0
      || barrier[pixel] !== 0
    ) return;
    outside[pixel] = 1;
    stack.push(pixel);
  };
  for (let x = 0; x < width; x += 1) {
    consider(x);
    consider((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    consider(y * width);
    consider(y * width + width - 1);
  }
  while (stack.length > 0) {
    const pixel = stack.pop();
    const x = pixel % width;
    if (x > 0) consider(pixel - 1);
    if (x + 1 < width) consider(pixel + 1);
    if (pixel >= width) consider(pixel - width);
    if (pixel + width < width * height) consider(pixel + width);
  }

  const character = new Uint8Array(width * height);
  for (let pixel = 0; pixel < character.length; pixel += 1) {
    if (barrier[pixel] !== 0 || outside[pixel] === 0) character[pixel] = 1;
  }
  return bridgeNarrowGaps(character, width, height, 7);
}

function bridgeNarrowGaps(mask, width, height, reach) {
  const bridged = Uint8Array.from(mask);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel] !== 0) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const horizontal = hasMaskWithin(mask, width, height, x, y, -1, 0, reach)
      && hasMaskWithin(mask, width, height, x, y, 1, 0, reach);
    const vertical = hasMaskWithin(mask, width, height, x, y, 0, -1, reach)
      && hasMaskWithin(mask, width, height, x, y, 0, 1, reach);
    if (horizontal || vertical) bridged[pixel] = 1;
  }
  return bridged;
}

function hasMaskWithin(mask, width, height, x, y, dx, dy, reach) {
  for (let distance = 1; distance <= reach; distance += 1) {
    const sampleX = x + dx * distance;
    const sampleY = y + dy * distance;
    if (sampleX < 0 || sampleY < 0 || sampleX >= width || sampleY >= height) {
      return false;
    }
    if (mask[sampleY * width + sampleX] !== 0) return true;
  }
  return false;
}

function meaningfulMaskComponents(mask, width, height) {
  const seen = new Uint8Array(width * height);
  const kept = new Uint8Array(width * height);
  for (let start = 0; start < mask.length; start += 1) {
    if (seen[start] !== 0 || mask[start] === 0) continue;
    const component = [];
    const stack = [start];
    let minimumX = width;
    let maximumX = 0;
    let minimumY = height;
    let maximumY = 0;
    seen[start] = 1;
    while (stack.length > 0) {
      const pixel = stack.pop();
      component.push(pixel);
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      minimumX = Math.min(minimumX, x);
      maximumX = Math.max(maximumX, x);
      minimumY = Math.min(minimumY, y);
      maximumY = Math.max(maximumY, y);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const nextX = x + dx;
          const nextY = y + dy;
          if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
            continue;
          }
          const next = nextY * width + nextX;
          if (seen[next] !== 0 || mask[next] === 0) continue;
          seen[next] = 1;
          stack.push(next);
        }
      }
    }
    const boxArea = (maximumX - minimumX + 1) * (maximumY - minimumY + 1);
    const density = component.length / boxArea;
    if (component.length < 18 || density < 0.035) continue;
    for (const pixel of component) kept[pixel] = 1;
  }
  return kept;
}

function dilate(mask, width, height, radius) {
  const expanded = new Uint8Array(mask.length);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel] === 0) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (nextX < 0 || nextY < 0 || nextX >= width || nextY >= height) {
          continue;
        }
        expanded[nextY * width + nextX] = 1;
      }
    }
  }
  return expanded;
}

function erode(mask, width, height, radius) {
  const reduced = new Uint8Array(mask.length);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel] === 0) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    let surrounded = true;
    for (let dy = -radius; dy <= radius && surrounded; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const nextX = x + dx;
        const nextY = y + dy;
        if (
          nextX < 0
          || nextY < 0
          || nextX >= width
          || nextY >= height
          || mask[nextY * width + nextX] === 0
        ) {
          surrounded = false;
          break;
        }
      }
    }
    if (surrounded) reduced[pixel] = 1;
  }
  return reduced;
}

function clearBackgroundWashes(data, character, width, height) {
  const queued = new Uint8Array(width * height);
  const stack = [];
  const consider = (pixel) => {
    if (pixel < 0 || pixel >= queued.length || queued[pixel] !== 0) return;
    if (character[pixel] !== 0) return;
    const offset = pixel * 4;
    if (data[offset + 3] !== 0 && !isBackgroundWash(
      data[offset],
      data[offset + 1],
      data[offset + 2],
    )) return;
    queued[pixel] = 1;
    stack.push(pixel);
  };

  for (let pixel = 0; pixel < width * height; pixel += 1) {
    if (data[pixel * 4 + 3] === 0) consider(pixel);
  }
  while (stack.length > 0) {
    const pixel = stack.pop();
    data[pixel * 4 + 3] = 0;
    const x = pixel % width;
    if (x > 0) consider(pixel - 1);
    if (x + 1 < width) consider(pixel + 1);
    if (pixel >= width) consider(pixel - width);
    if (pixel + width < width * height) consider(pixel + width);
  }
}

function isBackgroundWash(red, green, blue) {
  const light = luminance(red, green, blue);
  const minimum = Math.min(red, green, blue);
  const maximum = Math.max(red, green, blue);
  if (light < 145 || minimum < 104) return false;
  if (maximum - minimum < 34) return true;
  if (blue > red + 7 && blue > green + 3) return true;
  if (green > red + 9 && green > blue + 3) return true;
  return red > green + 22 && red > blue + 22 && Math.min(green, blue) > 132;
}

function clearOutsideCharacter(data, character) {
  for (let pixel = 0; pixel < character.length; pixel += 1) {
    if (character[pixel] === 0) data[pixel * 4 + 3] = 0;
  }
}

function average(left, right) {
  return left.map((channel, index) => Math.round((channel + right[index]) / 2));
}

function colourDistance(left, right) {
  return left.reduce((total, channel, index) => {
    const delta = channel - right[index];
    return total + delta * delta;
  }, 0);
}

function luminance(red, green, blue) {
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}
