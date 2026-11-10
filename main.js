// Local assets: drop files into assets/images (jpg, png or webp) and assets/videos (mp4)
const IMAGE_EXTS = ['jpg', 'png', 'webp'];

function placeholderSrc(name) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 623 441"><rect width="623" height="441" fill="#1d3f9c"/><rect x="10" y="10" width="603" height="421" rx="30" fill="none" stroke="#9fd0ff" stroke-width="3" stroke-dasharray="14 10"/><text x="311" y="205" fill="#fff" font-family="monospace" font-size="26" font-weight="700" text-anchor="middle">Add image:</text><text x="311" y="248" fill="#9fd0ff" font-family="monospace" font-size="26" text-anchor="middle">assets/images/${name}.jpg</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const PNG_NAMES = new Set(['logo-cover', 'logo-header', 'signature', 'fox']);

function loadImg(img, name) {
  const first = PNG_NAMES.has(name) ? 'png' : 'jpg';
  const order = [first, ...IMAGE_EXTS.filter((ext) => ext !== first)];
  let i = 0;
  let round = 0;
  img.classList.add('img-loading');
  img.onload = () => img.classList.remove('img-loading');
  img.onerror = () => {
    i += 1;
    if (i < order.length) {
      img.src = `assets/images/${name}.${order[i]}`;
    } else if (round < 1) {
      // Everything failed: wait a moment and try once more in case the connection hiccuped
      round += 1;
      i = 0;
      setTimeout(() => { img.src = `assets/images/${name}.${order[0]}?retry=1`; }, 1500);
    } else {
      img.onerror = null;
      img.src = placeholderSrc(name);
    }
  };
  img.src = `assets/images/${name}.${order[0]}`;
}

function failedNote(path, retry) {
  console.warn(`Could not load ${path}`);
  const note = document.createElement('div');
  note.className = 'media-missing';
  const msg = document.createElement('p');
  msg.textContent = "This video couldn't load. Check your connection and try again.";
  const hint = document.createElement('small');
  hint.textContent = path;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'retry-button';
  button.textContent = 'Try again';
  button.addEventListener('click', retry);
  note.append(msg, hint, button);
  return note;
}

function buildVideo(media) {
  const path = `assets/videos/${media.src}.mp4`;
  const video = document.createElement('video');
  video.className = 'media-viewer-video';
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.preload = 'auto';

  const loader = document.createElement('div');
  loader.className = 'media-loading';
  loader.innerHTML = '<span class="spinner"></span><span class="media-loading-text">Loading video…</span><span class="media-loading-hint">Slow connection, hang tight.</span>';
  const text = loader.querySelector('.media-loading-text');
  const hint = loader.querySelector('.media-loading-hint');
  const slowTimer = setTimeout(() => hint.classList.add('is-visible'), 6000);

  const show = () => loader.classList.remove('is-hidden');
  const hide = () => { loader.classList.add('is-hidden'); clearTimeout(slowTimer); };
  video.addEventListener('loadstart', show);
  video.addEventListener('waiting', show);
  video.addEventListener('canplay', hide);
  video.addEventListener('playing', hide);
  video.addEventListener('progress', () => {
    if (video.duration && video.buffered.length) {
      const pct = Math.min(100, Math.round((video.buffered.end(video.buffered.length - 1) / video.duration) * 100));
      text.textContent = `Loading video… ${pct}%`;
    }
  });
  video.addEventListener('error', () => {
    clearTimeout(slowTimer);
    mediaViewerCard.replaceChildren(failedNote(path, () => mediaViewerCard.replaceChildren(...buildVideo(media))));
  });
  video.src = path;
  return [video, loader];
}

const artworks = {
  scribble: {
    height: 748,
    title: 'Scribble Art titled “Is it Normal?“',
    image: { src: 'scribble', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 703, y: 126, w: 705,
      value: '“As much as I want to  be positive about this, I keep seeing my own insecurities. I see myself (The Fox) falling in a void, carried by  a broken heart and being judged. I wonder if what im doing and how I act is even normal...? I always hated how outdated I am, and how I fail to capture the humor of people around me.... Thats for sure, I guess\n\n-Kirk Jedrik”',
    },
    button: {
      x: 181, y: 546, label: 'View Art',
      media: { type: 'image', src: 'scribble-full', w: 1347, h: 953 },
    },
  },

  bookspine: {
    height: 2019,
    title: 'Book Spine Poetry',
    image: { src: 'bookspine', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 703, y: 126, w: 683,
      value: 'An Activity where we have to create a Poem out of the side covers of the Books from the Library',
    },
    extras: [
      { type: 'image', src: 'bookspine-2', x: 784, y: 628, w: 623, h: 636 },
      {
        type: 'quote', x: 30, y: 727, w: 754,
        value: '“In the Midst Of Winter\nIn Search of our Mothers’ Gardens\nMy Mother was Right\nNothing ever breaks except the heart”',
      },
      {
        type: 'quote', x: 719, y: 1482, w: 754,
        value: '“Edges of Reality\nThe Long DARK NIGHT\nnothing more\nA time gone by”',
      },
      { type: 'image', src: 'bookspine-3', x: 74, y: 1406, w: 623, h: 441 },
    ],
  },

  coffee: {
    height: 748,
    title: 'Coffee Painting titled “COZY AFTER NOON”',
    image: { src: 'coffee', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 177, w: 740,
      value: 'One of my personal favorites. It is only my second time painting with coffee, and I really enjoyed it. For this art I was trying to practice perspective and making the depth work by trying different intensity shades of coffee. I also tried thinking of a unique scene possible that can showcase a good lighting. ',
    },
    button: {
      x: 181, y: 546, label: 'View Art',
      media: { type: 'image', src: 'coffee-full', w: 1347, h: 953 },
    },
  },

  blackout: {
    height: 748,
    title: 'Blackout Poetry titled “TREE OF WISDOM”',
    image: { src: 'blackout', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 177, w: 769,
      value: 'This one came out roughly because I was tricked of the deadline being extremely near than it should be. Anyways, I had to record proof of me, making it at the side of the stairs, absolutely rushing it. Anyways I think it would’ve been better if it was actually readable.',
    },
    extras: [
      {
        type: 'quote', x: 690, y: 409, w: 754,
        value: '“Interconnections has an opportunity to carve its own path, allowing better view as a person.”',
      },
    ],
    button: {
      x: 181, y: 546, label: 'View Art',
      media: { type: 'image', src: 'blackout-full', w: 1347, h: 953 },
    },
  },

  ai: {
    height: 1386,
    title: 'AI Appreciation Art “Academic Scream”',
    image: { src: 'ai', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 182, w: 718,
      value: 'Probably my least favorite activity out of the bunch. Basically prompting the AI to do some weird alterations to the artwork to make something new yet conveying the same meaning. Although I used AI for the art, I never claimed it as mine',
    },
    extras: [
      { type: 'image', src: 'ai-original', x: 784, y: 628, w: 623, h: 636 },
      {
        type: 'quote', x: 30, y: 727, w: 754,
        value: 'The Original Painting:\nThe Scream by Edvard Munch in 1893',
      },
    ],
  },

  multimedia: {
    height: 748,
    title: 'Multi-Media Arts',
    image: { src: 'multimedia', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 177, w: 786,
      value: 'This Activity is interesting! We get to choose between film making, and Photography, and we chose Film Making for some reason.',
    },
    button: {
      x: 181, y: 546, label: 'View Film',
      media: { type: 'video', src: 'film-multimedia', w: 1653, h: 953 },
    },
  },

  painting: {
    height: 913,
    title: 'Painting: “ Mona Holisa”',
    image: { src: 'painting', x: 37, y: 16, w: 623, h: 649 },
    text: {
      x: 690, y: 126, w: 751,
      value: 'In this painting activity, I took the Monalisa  printed outline, and recolored her to look like Jesus and Mother Mary at the same time.',
    },
    button: {
      x: 181, y: 718, label: 'View Art',
      media: { type: 'image', src: 'painting-full', w: 1347, h: 1496 },
    },
  },

  balota: {
    height: 748,
    title: 'Video Presentation: "BALOTA"',
    image: { src: 'balota', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 177, w: 769,
      value: 'For this activity, we had to analyze a given film, and we chose "On the job" which is this film. We have to apply the analytical process discussed in class: Observe | Analyze | Contextualize | Interpret | Judge.',
    },
    extras: [
      {
        type: 'quote', x: 690, y: 409, w: 754,
        value: '“Oh yeah, and Im the editor.”',
      },
    ],
    button: {
      x: 181, y: 546, label: 'View Film',
      media: { type: 'video', src: 'film-balota', w: 1683, h: 968 },
    },
  },

  digital: {
    height: 1174,
    title: 'Digital Art titled “Sleepy Snepy”',
    image: { src: 'digital', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 177, w: 790,
      value: 'Digital Art or Digital Painting is my specialty artwork, it is my main hobby ever since I tried IbisPaint for mobile back in 2019. At the time, resources were limited, and I found it really convenient to just have all the tools available for me in the digital alternative, so I just continued my drawing journey from there.\n\nThis is one of the favorite Digital Artwork I have made~. it features my partner named “Filip” the Snow Leopard, sleeping on his messy bed, with a low light room. \n\nMade with Krita in around 10 Hours',
    },
    button: {
      x: 181, y: 546, label: 'View Art',
      media: { type: 'image', src: 'digital-full', w: 1695, h: 953 },
    },
    extras: [
      { type: 'subtitle', x: 37, y: 742, value: 'Proof and Layering' },
      {
        type: 'text', x: 39, y: 842, w: 763,
        value: 'Layers are grouped, and each group consist of: outline, color , shadow, lighting. Depending on the environment; the blending I used for shadows is Color burn, and Addition for the Lighting.',
      },
      { type: 'image', src: 'digital-layers', x: 854, y: 658, w: 623, h: 441 },
    ],
  },

  model: {
    height: 2284,
    title: '3D model named “Lulz”',
    image: { src: 'model', x: 37, y: 44, w: 623, h: 441 },
    text: {
      x: 690, y: 126, w: 753,
      value: 'Okay so, I always wanted to try 3D modeling, but I didn’t know how... but after countless of tutorials, I have made my first terrible model! Ill name him Lulz because why not.',
    },
    button: {
      x: 181, y: 546, label: 'View Animation',
      media: { type: 'video', src: 'animation-lulz', w: 1653, h: 953 },
    },
    extras: [
      { type: 'image', src: 'model-head', x: 720, y: 580, w: 742, h: 441 },
      { type: 'subtitle', x: 24, y: 760, value: 'The Beginning' },
      {
        type: 'text', x: 24, y: 841, w: 763,
        value: 'I have made the base model for the head, which probably took 3 hours or more. It looks perfect for me but could use some more polishing....',
      },
      { type: 'image', src: 'model-body', x: 53, y: 1180, w: 742, h: 441 },
      { type: 'subtitle', x: 850, y: 1214, value: 'The Body' },
      {
        type: 'text', x: 850, y: 1301, w: 634,
        value: 'Very confusing to make... I spent a lot of time more on the feet',
      },
      { type: 'subtitle', x: 63, y: 1723, value: 'Texturing' },
      {
        type: 'text', x: 63, y: 1810, w: 634,
        value: 'Very..... awful way to texture a model, but hey- Im still new to this',
      },
      { type: 'image', src: 'model-texture', x: 712, y: 1690, w: 742, h: 441 },
    ],
  },

  song: {
    height: 1174,
    title: 'Song titled “Distant Shore” by\nJennifer Paz',
    image: { src: 'song', x: 41, y: 44, w: 615, h: 529 },
    text: {
      x: 690, y: 177, w: 706,
      value: 'I dont consider myself as a Good singer, because I dont know.. I thought maybe I could change my own mind by singing a song for my last artwork\n(Also made a quick digital art for the cover image)',
    },
    button: {
      x: 181, y: 623, label: 'Listen',
      media: { type: 'video', src: 'song-distant-shore', w: 1088, h: 1080 },
    },
    extras: [
      { type: 'image', src: 'song-editing', x: 834, y: 604, w: 623, h: 441 },
      { type: 'subtitle', x: 43, y: 811, value: 'Editing with Davinci Resolve' },
      {
        type: 'text', x: 43, y: 893, w: 763,
        value: 'I sang the song with my phone and laptop recording my voice at the same time, because theres a part in the song where I used double voice to convey a stronger feeling.',
      },
    ],
  },
};

const coverScreen = document.getElementById('cover-screen');
const browseScreen = document.getElementById('browse-screen');
const startButton = document.getElementById('start-button');
const artOverlay = document.getElementById('art-overlay');
const overlayPanel = document.getElementById('overlay-panel');
const overlayBackdrop = document.getElementById('overlay-backdrop');
const mediaViewer = document.getElementById('media-viewer');
const mediaViewerCard = document.getElementById('media-viewer-card');
const mediaViewerBackdrop = document.getElementById('media-viewer-backdrop');
const stageFrame = document.getElementById('stage-frame');

function place(element, { x, y, w, h }) {
  element.style.left = `${x}px`;
  element.style.top = `${y}px`;
  if (w) element.style.width = `${w}px`;
  if (h) element.style.height = `${h}px`;
}

function createText(className, value, box) {
  const element = document.createElement('p');
  element.className = className;
  element.textContent = value;
  place(element, box);
  return element;
}

function createImage(item) {
  const element = document.createElement('img');
  element.className = 'overlay-image';
  loadImg(element, item.src);
  element.alt = '';
  place(element, item);
  return element;
}

function openOverlay(key) {
  const art = artworks[key];
  const content = document.createElement('div');
  content.className = 'overlay-content';
  content.style.height = `${art.height}px`;

  const title = document.createElement('h2');
  title.className = 'overlay-title';
  title.textContent = art.title;
  place(title, { x: 690, y: 44 });
  content.append(title, createImage(art.image));
  content.append(createText('overlay-text', art.text.value, art.text));

  (art.extras || []).forEach((item) => {
    if (item.type === 'image') content.append(createImage(item));
    if (item.type === 'text') content.append(createText('overlay-text', item.value, item));
    if (item.type === 'quote') content.append(createText('overlay-quote', item.value, item));
    if (item.type === 'subtitle') content.append(createText('overlay-subtitle', item.value, item));
  });

  if (art.button) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'glass-button overlay-button';
    button.textContent = art.button.label;
    place(button, art.button);
    button.addEventListener('click', () => openViewer(art.button.media));
    content.append(button);
  }

  overlayPanel.replaceChildren(content);
  overlayPanel.scrollTop = 0;
  artOverlay.classList.remove('is-closing');
  artOverlay.hidden = false;
}

function closeOverlay() {
  if (artOverlay.hidden || artOverlay.classList.contains('is-closing')) return;
  const finish = () => {
    artOverlay.hidden = true;
    artOverlay.classList.remove('is-closing');
    overlayPanel.replaceChildren();
  };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  artOverlay.classList.add('is-closing');
  setTimeout(finish, 450); // matches the panel-out duration in styles.css
}

function openViewer(media) {
  mediaViewerCard.style.setProperty('--media-width', media.w);
  mediaViewerCard.style.setProperty('--media-height', media.h);

  if (media.type === 'image') {
    const img = document.createElement('img');
    img.className = 'media-viewer-image';
    img.alt = '';
    loadImg(img, media.src);
    mediaViewerCard.replaceChildren(img);
  } else {
    mediaViewerCard.replaceChildren(...buildVideo(media));
  }
  mediaViewer.hidden = false;
}

function closeViewer() {
  const video = mediaViewerCard.querySelector('video');
  if (video) { // stop playing and stop downloading
    video.pause();
    video.removeAttribute('src');
    video.load();
  }
  mediaViewer.hidden = true;
  mediaViewerCard.replaceChildren();
}

function fitStage() {
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  stageFrame.style.setProperty('--stage-scale', scale);
}

startButton.addEventListener('click', () => {
  coverScreen.classList.remove('is-active');
  browseScreen.classList.add('is-active');
});

document.querySelectorAll('[data-left]').forEach((element) => {
  element.style.left = `${element.dataset.left}px`;
});

document.querySelectorAll('.art-card').forEach((card) => {
  card.addEventListener('click', () => openOverlay(card.dataset.art));
});

overlayBackdrop.addEventListener('click', closeOverlay);
mediaViewerBackdrop.addEventListener('click', closeViewer);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!mediaViewer.hidden) closeViewer();
  else if (!artOverlay.hidden) closeOverlay();
});

window.addEventListener('resize', fitStage);
fitStage();

// Hydrate static images
document.querySelectorAll('img[data-img]').forEach((img) => loadImg(img, img.dataset.img));

// Browse screen motion: wheel scroll, centered-card grow, drifting glass squares
const shelfScroller = document.getElementById('shelf-scroller');
const squaresLayer = document.getElementById('glass-squares');
const browseShapes = document.querySelector('.browse-shapes');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const SHELF_OFFSET = 168;
const MAX_SQUARES = 18;

const shelfCards = [...document.querySelectorAll('.art-card')].map((card) => ({
  card,
  center: SHELF_OFFSET + Number(card.dataset.left) + (card.querySelector('.art-thumb-narrow') ? 589 : 623) / 2,
}));

const squares = [];
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
let scrollX = 0;

// Far squares (low depth) are small and slow, near ones are bigger and faster
function spawnSquare(screenX) {
  const depth = 0.15 + rnd() * 0.65;
  const size = 60 + rnd() * 90 + depth * 80;
  const el = document.createElement('div');
  el.className = 'glass-square';
  el.style.width = el.style.height = `${size}px`;
  el.style.top = `${240 + rnd() * (740 - size)}px`;
  el.style.opacity = 0.45 + depth * 0.55;
  squaresLayer.append(el);
  squares.push({ el, size, depth, x: screenX + scrollX * depth, speed: 20 + depth * 70, rot: (rnd() - 0.5) * 50 });
}
for (let i = 0; i < 10; i += 1) spawnSquare(rnd() * 1920);

let last = 0;
let nextSpawn = 0.8;
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.1);
  last = now;

  if (browseScreen.classList.contains('is-active')) {
    scrollX = shelfScroller.scrollLeft;

    if (!reduceMotion) {
      nextSpawn -= dt;
      if (nextSpawn <= 0 && squares.length < MAX_SQUARES) {
        spawnSquare(1920 + 200); // just past the right edge
        nextSpawn = 0.5 + rnd() * 1.8; // random gap before the next one
      }
    }

    for (let i = squares.length - 1; i >= 0; i -= 1) {
      const s = squares[i];
      if (!reduceMotion) s.x -= s.speed * dt;
      const sx = s.x - scrollX * s.depth; // drift plus scroll parallax
      if (sx < -s.size - 200 || sx > 2600) {
        s.el.remove();
        squares.splice(i, 1);
      } else {
        s.el.style.transform = `translate3d(${sx}px,0,0) rotate(${s.rot}deg)`;
      }
    }

    browseShapes.style.transform = `translate3d(${-scrollX * 0.45}px,0,0)`;

    shelfCards.forEach(({ card, center }) => {
      const t = Math.max(0, 1 - Math.abs(center - scrollX - 960) / 560);
      const eased = t * t * (3 - 2 * t);
      card.style.transform = `scale(${1 + 0.1 * eased})`;
      card.style.zIndex = eased > 0.5 ? 2 : 1;
    });
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

shelfScroller.addEventListener('wheel', (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    shelfScroller.scrollLeft += e.deltaY;
    e.preventDefault();
  }
}, { passive: false });
