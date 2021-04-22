const can = document.getElementById("can");
const ctx = can.getContext("2d");
can.width = 512;
can.height = 512;

let ipsum = "a ac adipiscing aliquam amet at augue blandit commodo condimentum consectetur consequat convallis cras curabitur cursus diam dictum dignissim dolor dui duis efficitur eget elementum elit enim erat eros est eu ex faucibus felis fringilla fusce gravida hendrerit iaculis id imperdiet in ipsum justo lacinia lacus leo ligula lobortis lorem maecenas magna malesuada mauris maximus molestie nam nec neque nibh nisi nisl non nulla ornare pharetra porta posuere praesent pretium purus quam quis risus sagittis sapien scelerisque sed sem semper sit sollicitudin tellus tincidunt tristique turpis ultrices ultricies urna ut varius velit venenatis vestibulum vitae vivamus viverra volutpat";
ipsum = ipsum.split(" ");
const randIpsum = () => ipsum[~~(Math.random() * ipsum.length)];
const randIpsumPhrase = () => {
  let phrase = "";
  for (let i = 0; i < 2 + Math.random() * 3; i++) {
    phrase += randIpsum() + " ";
  }
  return phrase;
}

const imageTint = "#71e83a33";
const filterTint = "#3c39e333";
const deleteTint = "#e83a3a33";

const clamp = (x, a, b) => Math.min(Math.max(a, x), b);

const defaultDrawFunc = (ctx, brush) => drawImage(ctx, brush, mousePos, 0);
const dataManipFunc = (ctx, dims, scale, func) => {
  const w = dims[0] * scale * drawSize;
  const h = dims[1] * scale * drawSize;
  const dx = ~~clamp(mousePos[0] - (w / 2), 0, can.width);
  const dy = ~~clamp(mousePos[1] - (h / 2), 0, can.height);
  const imageData = ctx.getImageData(
    dx, dy,
    ~~clamp(w, 0, can.width), ~~clamp(h, 0, can.height));
  func(imageData);
  ctx.putImageData(imageData, dx, dy);
}
const brushes = [{
    name: "Cursor",
    iconDrawing: true,
    iconPath: "./images/cursor.png",
    scale: 1,
    dims: Object.seal([0, 0]),
    img: null,
    toolbarButton: null,
    buttonTint: imageTint,
    drawFunc: (ctx, brush) => {
      ctx.beginPath();
      ctx.moveTo(~~prevMousePos[0], ~~prevMousePos[1]);
      ctx.lineTo(~~mousePos[0], ~~mousePos[1]);
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 20 * brush.scale * drawSize;
      ctx.stroke();
      ctx.lineWidth = 16 * brush.scale * drawSize;
      ctx.strokeStyle = "#000";
      ctx.stroke();
      drawImage(ctx, brush, mousePos, 0);
    },
  },
  {
    name: "Wheel",
    iconDrawing: true,
    iconPath: "./images/wheel.png",
    dims: Object.seal([0, 0]),
    scale: 0.6,
    img: null,
    toolbarButton: null,
    buttonTint: imageTint,
    drawFunc: (ctx, brush) => drawImage(ctx, brush, mousePos, time * 20),
  },
  {
    name: "Text",
    iconDrawing: false,
    iconPath: "./images/text.png",
    dims: Object.seal([10, 25]),
    scale: 1,
    img: can,
    toolbarButton: null,
    buttonTint: imageTint,
    drawFunc: (ctx, brush) => {
      const text = randIpsumPhrase();
      ctx.strokeStyle = "#fff";
      ctx.textBaseline = "middle";
      ctx.lineWidth = 4;
      ctx.font = (24 * drawSize * brush.scale) + "px Times New Roman";
      ctx.strokeText(text, ~~mousePos[0], ~~mousePos[1]);
      ctx.fillStyle = "#000";
      ctx.fillText(text, ~~mousePos[0], ~~mousePos[1]);
    },
  },
  {
    name: "Canvas",
    iconDrawing: false,
    iconPath: "./images/missing.png",
    dims: Object.seal([can.width, can.height]),
    scale: 1,
    img: can,
    toolbarButton: null,
    buttonTint: imageTint,
    drawFunc: defaultDrawFunc,
  },
  {
    name: "MiniCanvas",
    iconDrawing: false,
    iconPath: "./images/missing2.png",
    dims: Object.seal([can.width, can.height]),
    scale: 0.5,
    img: can,
    toolbarButton: null,
    buttonTint: imageTint,
    drawFunc: (ctx, brush) => drawImage(ctx, brush, mousePos, time),
  },
  {
    name: "Hole",
    iconDrawing: true,
    iconPath: "./images/hole.png",
    dims: Object.seal([50, 50]),
    scale: 1,
    img: null,
    toolbarButton: null,
    buttonTint: deleteTint,
    drawFunc: (ctx, brush) => dataManipFunc(ctx, brush.dims, brush.scale, (data) => {
      const raw = data.data;
      for (let i = 0; i < raw.length; i += 4) {
        raw[i + 3] = raw[i + 3] * 0.8;
      }
    }),
  },
  {
    name: "Shift",
    iconDrawing: false,
    iconPath: "./images/shift.png",
    dims: Object.seal([200, 200]),
    scale: 1,
    img: null,
    toolbarButton: null,
    buttonTint: filterTint,
    drawFunc: (ctx, brush) => dataManipFunc(ctx, brush.dims, brush.scale, (data) => {
      const raw = data.data;
      for (let i = 0; i < raw.length - 4; i++) {
        raw[i] = raw[i + 4];
        raw[i + 1] = raw[i + 5];
        raw[i + 2] = raw[i + 6];
        raw[i + 3] = raw[i + 7];
      }
    }),
  },
  {
    name: "Stretch",
    iconDrawing: false,
    iconPath: "./images/stretch.png",
    dims: Object.seal([200, 200]),
    scale: 1,
    img: null,
    toolbarButton: null,
    buttonTint: filterTint,
    drawFunc: (ctx, brush) => dataManipFunc(ctx, brush.dims, brush.scale, (data) => {
      const raw = data.data;
      for (let x = 0; x < data.width - 1; x++) {
        for (let y = 0; y < data.height - 1; y++) {
          const i1 = (x + y * data.width) * 4;
          const i2 = (x + (y + 1) * data.width) * 4;
          if (Math.random() < 0.5) {
            raw[i1 + 0] = Math.max(raw[i1 + 0], raw[i2 + 4]);
            raw[i1 + 1] = Math.min(raw[i1 + 1], raw[i2 + 5]);
            raw[i1 + 2] = Math.max(raw[i1 + 2], raw[i2 + 6]);
            raw[i1 + 3] = Math.max(raw[i1 + 3], raw[i2 + 7]);
          } else {
            raw[i1 + 0] = Math.min(raw[i1 + 0], raw[i2 + 4]);
            raw[i1 + 1] = Math.max(raw[i1 + 1], raw[i2 + 5]);
            raw[i1 + 2] = Math.min(raw[i1 + 2], raw[i2 + 6]);
            raw[i1 + 3] = Math.max(raw[i1 + 3], raw[i2 + 7]);
          }
        }
      }
    }),
  },
  {
    name: "Sort",
    iconDrawing: false,
    iconPath: "./images/sort.png",
    dims: Object.seal([200, 200]),
    scale: 1,
    img: null,
    toolbarButton: null,
    buttonTint: filterTint,
    drawFunc: (ctx, brush) => dataManipFunc(ctx, brush.dims, brush.scale, (data) => {
      const raw = data.data;
      for (let x = 0; x < data.width; x++) {
        for (let y = 0; y < data.height - 1; y++) {
          const i1 = (x + y * data.width) * 4;
          const i2 = i1 + data.width * 4;

          const hsl1 = rgb_hsl(raw[i1] / 255, raw[i1 + 1] / 255, raw[i1 + 2] / 255);
          const hsl2 = rgb_hsl(raw[i2] / 255, raw[i2 + 1] / 255, raw[i2 + 2] / 255);

          if (hsl1[0] < hsl2[0]) {
            const r1 = raw[i1];
            const g1 = raw[i1 + 1];
            const b1 = raw[i1 + 2];
            const a = Math.max(raw[i1 + 3], raw[i2 + 3]);
            raw[i1] = raw[i2];
            raw[i1 + 1] = raw[i2 + 1];
            raw[i1 + 2] = raw[i2 + 2];
            raw[i1 + 3] = a;
            raw[i2] = r1;
            raw[i2 + 1] = g1;
            raw[i2 + 2] = b1;
            raw[i2 + 3] = a;
          }
        }
      }
    }),
  },
  {
    name: "Bleed",
    iconDrawing: false,
    iconPath: "./images/bleed.png",
    dims: Object.seal([200, 200]),
    scale: 1,
    img: null,
    toolbarButton: null,
    buttonTint: filterTint,
    drawFunc: (ctx, brush) => dataManipFunc(ctx, brush.dims, brush.scale, (data) => {
      const raw = data.data;
      for (let x = 0; x < data.width; x++) {
        if (Math.random() < 0.5) {
          continue;
        }
        for (let y = data.height - 1; y >= 0; y--) {
          const i1 = (x + y * data.width) * 4;
          const hsl1 = rgb_hsl(raw[i1] / 255, raw[i1 + 1] / 255, raw[i1 + 2] / 255);
          const i2 = i1 + data.width * 4;
          
          const hsl2 = rgb_hsl(raw[i2] / 255, raw[i2 + 1] / 255, raw[i2 + 2] / 255);

          if (hsl1[2] > hsl2[2]) {
            raw[i2 + 0] = raw[i1 + 0] - 2;
            raw[i2 + 1] = raw[i1 + 1] - 2;
            raw[i2 + 2] = raw[i1 + 2] - 2;
            raw[i2 + 3] = raw[i1 + 3];
          }
        }
      }
    }),
  },
  {
    name: "Contrast",
    iconDrawing: false,
    iconPath: "./images/rgb.png",
    dims: Object.seal([200, 200]),
    scale: 1,
    img: can,
    toolbarButton: null,
    buttonTint: filterTint,
    drawFunc: (ctx, brush) => dataManipFunc(ctx, brush.dims, brush.scale, (data) => {
      const raw = data.data;
      v = 255 / (3 + Math.random() * 5);
      for (let i = 0; i < raw.length; i += 4) {
        // const r = raw[i];
        // raw[i] = raw[i + 1];
        // raw[i + 1] = raw[i + 2];
        // raw[i + 2] = r;
        raw[i + 0] = Math.round(raw[i + 0] / v) * v;
        raw[i + 1] = Math.round(raw[i + 1] / v) * v;
        raw[i + 2] = Math.round(raw[i + 2] / v) * v;
      }
    }),
  },
];

let activeBrush = 0;

let mouseIn = false;
can.addEventListener("mouseenter", (e) => {
  mouseIn = true;
});

can.addEventListener("mouseleave", (e) => {
  mouseIn = false;
});

const eToMousePos = (e, arr) => {
  arr[0] = (e.offsetX / displayDims[0]) * can.width;
  arr[1] = (e.offsetY / displayDims[1]) * can.height;
}

let displayDims = Object.seal([0, 0]);
new ResizeObserver((es) => {
  const e = es[0];
  displayDims[0] = e.contentRect.width;
  displayDims[1] = e.contentRect.height;
}).observe(can);

drawImage = (ctx, imgDat, position, rotation) => {
  const img = imgDat.img;
  const width = ~~(img.width * imgDat.scale * drawSize);
  const height = ~~(img.height * imgDat.scale * drawSize);

  ctx.setTransform(1, 0, 0, 1, position[0], position[1]); // sets scale and origin
  ctx.rotate(rotation);
  ctx.drawImage(img,
    0, 0,
    ~~img.width, ~~img.height,
    -(width >> 1), -(height >> 1),
    width, height);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

const doDraw = () => {
  const imgDat = brushes[activeBrush];
  imgDat.drawFunc(ctx, imgDat);
}

const maxStates = 20;
let stateIndex = 0;
const stateStack = [];

const pushState = () => {
  stateStack.length = Math.min(stateStack.length, stateIndex);
  stateIndex++;
  stateStack.push(ctx.getImageData(0, 0, can.width, can.height));
}

const decrementState = () => {
  if (stateIndex > 0) {
    let removedState = null;
    if (stateIndex === stateStack.length) {
      removedState = ctx.getImageData(0, 0, can.width, can.height);
    }

    stateIndex--;
    ctx.putImageData(stateStack[stateIndex], 0, 0);

    if (removedState !== null) {
      stateStack.push(removedState);
    }
  }
}

const incrementState = () => {
  if (stateIndex < stateStack.length - 1) {
    stateIndex++;
    ctx.putImageData(stateStack[stateIndex], 0, 0);
  }
}

let drawSize = 1;
const mousePos = Object.seal([0, 0]);
const prevMousePos = Object.seal([0, 0]);
const mousePagePos = Object.seal([0, 0]);

const brushPreview = document.getElementById("cursor");
const brushPreviewDims = Object.seal([0, 0]);
const updateBrushPreviewDims = () => {
  const brush = brushes[activeBrush];
  brushPreviewDims[0] = brush.dims[0] * brush.scale * drawSize;
  brushPreviewDims[1] = brush.dims[1] * brush.scale * drawSize;

  brushPreview.style.width = brushPreviewDims[0] + "px";
  brushPreview.style.height = brushPreviewDims[1] + "px";
  updateBrushPreviewPos();
  brushPreview.textContent = drawSize;
}

const updateBrushPreviewPos = () => {
  brushPreview.style.left = (mousePagePos[0] - (brushPreviewDims[0] / 2)) + "px";
  brushPreview.style.top = (mousePagePos[1] - (brushPreviewDims[1] / 2)) + "px";
}

document.addEventListener("mousemove", (e) => {
  eToMousePos(e, mousePos);
  mousePagePos[0] = e.pageX;
  mousePagePos[1] = e.pageY;
  updateBrushPreviewPos();
  if (mouseDown && mouseIn) {
    doDraw();
  }

  prevMousePos[0] = mousePos[0];
  prevMousePos[1] = mousePos[1];
});



let time = 0;
window.setInterval((e) => {
  time += 0.033;
}, 33);

let mouseDown = false;
let mouseDownPos = Object.seal([0, 0]);
can.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    mouseDown = true;
    eToMousePos(e, mouseDownPos);
    pushState();
    doDraw();
  }
});

document.addEventListener("mouseup", (e) => {
  mouseDown = false;
});

document.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "z":
      if (e.metaKey || e.ctrlKey) {
        // e.preventDefault();
        if (e.shiftKey) {
          incrementState();
        } else {
          decrementState();
        }
      }
      break;
    case "0":
      drawSize = 0.05;
      updateBrushPreviewDims();
      break;
    case "1":
      drawSize = 0.1;
      updateBrushPreviewDims();
      break;
    case "2":
      drawSize = 0.25;
      updateBrushPreviewDims();
      break;
    case "3":
      drawSize = 0.5;
      updateBrushPreviewDims();
      break;
    case "4":
      drawSize = 0.75;
      updateBrushPreviewDims();
      break;
    case "5":
      drawSize = 1;
      updateBrushPreviewDims();
      break;
    case "6":
      drawSize = 1.25;
      updateBrushPreviewDims();
      break;
    case "7":
      drawSize = 1.5;
      updateBrushPreviewDims();
      break;
    case "8":
      drawSize = 2;
      updateBrushPreviewDims();
      break;
    case "9":
      drawSize = 3;
      updateBrushPreviewDims();
      break;
  }
});

const selectBrush = (i) => {
  brushes[activeBrush].toolbarButton.classList.remove("selected");
  brushes[i].toolbarButton.classList.add("selected");
  activeBrush = i;
  updateBrushPreviewDims();
}

let pendingLoads = brushes.length;

const toolbar = document.getElementById("brushes");

for (let i = 0; i < brushes.length; i++) {
  const brush = brushes[i];
  // iconDrawing = it draws its icon
  if (brush.iconPath !== null && brush.iconDrawing) {
    const img = new Image();
    img.onload = () => {
      brush.img = img;
      brush.dims[0] = img.width;
      brush.dims[1] = img.height;
      console.log(brush.iconPath + " " + brush.dims);
      pendingLoads--;
      if (pendingLoads === 0) {
        onLoaded()
      }
    }
    // img.crossOrigin = "data";
    img.src = brush.iconPath;
  } else {
    pendingLoads--;
  }

  const button = document.createElement("div");
  brush.toolbarButton = button;
  button.className = "toolbar-item";
  button.style.background = brush.buttonTint;
  button.addEventListener("click", () => selectBrush(i));
  const buttonIcon = document.createElement("img");
  if (brush.iconPath !== null) {
    buttonIcon.src = brush.iconPath;
  }
  button.appendChild(buttonIcon);
  toolbar.appendChild(button);
}

const rgb_hsl = (r, g, b) => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  let l = (max + min) / 2;
  if (max === min) {
    h = 0;
    s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function onLoaded() {
  selectBrush(0);
  console.log("loaded");
}