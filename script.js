/**
 * Perlin Noise Utility
 */
class Perlin {
    constructor() {
        this.p = new Array(512);
        const p = [151, 160, 137, 91, 90, 15,
            131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
            190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
            88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
            77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
            102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
            135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
            5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 162, 215, 171, 180, 72, 127,
            132, 243, 121, 167, 93, 154, 152, 157, 189, 128, 155, 204, 115, 221, 104, 106, 193, 121, 182,
            24, 11, 214, 125, 249, 211, 210, 135, 112, 111, 236, 110, 67, 113, 220, 114, 232, 192, 115, 221];
        for (let i = 0; i < 256; i++) {
            this.p[i] = this.p[i + 256] = p[i];
        }
    }

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
    lerp(t, a, b) { return a + t * (b - a); }
    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    noise(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);
        const A = this.p[X] + Y, AA = this.p[A] + Z, AB = this.p[A + 1] + Z;
        const B = this.p[X + 1] + Y, BA = this.p[B] + Z, BB = this.p[B + 1] + Z;

        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[AA], x, y, z),
            this.grad(this.p[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.p[AB], x, y - 1, z),
                this.grad(this.p[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1),
                this.grad(this.p[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1),
                    this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))));
    }
}

/**
 * Main Application logic
 */
const perlin = new Perlin();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const indicator = document.getElementById('indicator');
const valorOverlay = document.getElementById('valor');
const logicOverlay = document.getElementById('logic');

let currentProgress = 0.5;
let targetProgress = 0.5;

const imgA = new Image();
const imgB = new Image();
imgA.src = 'assets/Pau_Scholar.jpg';
imgB.src = 'assets/Pau_Athlete.jpg';

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}

function getDrawMeta(img, w, h) {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;
    let drawW, drawH, offsetX, offsetY;
    if (imgRatio > canvasRatio) {
        drawW = h * imgRatio;
        drawH = h;
        offsetX = (w - drawW) / 2;
        offsetY = 0;
    } else {
        drawW = w;
        drawH = w / imgRatio;
        offsetX = 0;
        offsetY = (h - drawH) / 2;
    }
    return { drawW, drawH, offsetX, offsetY };
}

function render() {
    // Spring physics simulation
    currentProgress = lerp(currentProgress, targetProgress, 0.1);

    const width = canvas.width;
    const height = canvas.height;
    const time = Date.now() * 0.0003;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Update UI elements
    indicator.style.left = (currentProgress * 100) + '%';

    // Opacity based on progress
    const vOpacity = Math.max(0, Math.min(1, (0.6 - currentProgress) / 0.3));
    const lOpacity = Math.max(0, Math.min(1, (currentProgress - 0.4) / 0.3));
    valorOverlay.style.opacity = vOpacity;
    logicOverlay.style.opacity = lOpacity;

    // 1. Draw Background (Athlete)
    if (imgB.complete && imgB.naturalWidth > 0) {
        const meta = getDrawMeta(imgB, width, height);
        ctx.drawImage(imgB, meta.offsetX, meta.offsetY, meta.drawW, meta.drawH);
    }

    // 2. Draw Transition (Corporate)
    if (imgA.complete && imgA.naturalWidth > 0) {
        const metaA = getDrawMeta(imgA, width, height);
        const baseSize = 8;
        const cols = Math.ceil(width / baseSize);
        const rows = Math.ceil(height / baseSize);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const relX = i / cols;
                const relY = j / rows;

                const n1 = perlin.noise(relX * 2, relY * 2, time);
                const n2 = perlin.noise(relX * 5, relY * 5, time * 1.5);
                const dither = (Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;

                const threshold = relX + (n1 * 0.15) + (n2 * 0.1) + (dither * 0.08);
                const dist = currentProgress - threshold;

                if (dist > 0) {
                    const x = i * baseSize;
                    const y = j * baseSize;
                    const relativeXInDraw = x - metaA.offsetX;
                    const relativeYInDraw = y - metaA.offsetY;

                    if (relativeXInDraw >= 0 && relativeXInDraw < metaA.drawW &&
                        relativeYInDraw >= 0 && relativeYInDraw < metaA.drawH) {

                        const sampleX = (relativeXInDraw / metaA.drawW) * imgA.width;
                        const sampleY = (relativeYInDraw / metaA.drawH) * imgA.height;

                        const t = Math.min(1.0, dist / 0.2);
                        const currentBlockSize = baseSize + (24 * (1 - Math.pow(t, 2)));
                        const visualOffsetX = (baseSize - currentBlockSize) / 2;
                        const visualOffsetY = (baseSize - currentBlockSize) / 2;

                        ctx.globalAlpha = Math.min(1.0, t * 2);

                        if (t < 0.4) {
                            ctx.drawImage(imgA, sampleX, sampleY, 1, 1, x + visualOffsetX, y + visualOffsetY, currentBlockSize, currentBlockSize);
                        } else {
                            const sw = (baseSize / metaA.drawW) * imgA.width;
                            const sh = (baseSize / metaA.drawH) * imgA.height;
                            ctx.drawImage(imgA, sampleX, sampleY, sw, sh, x, y, baseSize, baseSize);
                        }
                    }
                }
            }
        }
        ctx.globalAlpha = 1.0;
    }

    requestAnimationFrame(render);
}

render();

const sliderContainer = document.getElementById('slider-container');
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        const sectionId = `section${item.getAttribute('data-section')}`;
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

document.getElementById('menu-prev').addEventListener('click', () => {
    const sections = sliderContainer.querySelectorAll('.slide-section');
    const scrollPos = sliderContainer.scrollTop;
    const containerHeight = sliderContainer.offsetHeight;
    let currentIdx = 0;

    sections.forEach((section, idx) => {
        if (scrollPos >= section.offsetTop - containerHeight / 3) {
            currentIdx = idx;
        }
    });

    if (currentIdx > 0) {
        sliderContainer.scrollTo({
            top: sections[currentIdx - 1].offsetTop,
            behavior: 'smooth'
        });
    }
});

document.getElementById('menu-next').addEventListener('click', () => {
    const sections = sliderContainer.querySelectorAll('.slide-section');
    const scrollPos = sliderContainer.scrollTop;
    const containerHeight = sliderContainer.offsetHeight;
    let currentIdx = 0;

    sections.forEach((section, idx) => {
        if (scrollPos >= section.offsetTop - containerHeight / 3) {
            currentIdx = idx;
        }
    });

    if (currentIdx < sections.length - 1) {
        sliderContainer.scrollTo({
            top: sections[currentIdx + 1].offsetTop,
            behavior: 'smooth'
        });
    }
});

// Update active menu item on scroll
sliderContainer.addEventListener('scroll', () => {
    const scrollPos = sliderContainer.scrollTop;
    const containerHeight = sliderContainer.offsetHeight;
    const sections = sliderContainer.querySelectorAll('.slide-section');
    let currentIdx = 0;

    sections.forEach((section, idx) => {
        const sectionTop = section.offsetTop;
        // Check if the scroll position has passed the midpoint of the current section
        if (scrollPos >= sectionTop - containerHeight / 3) {
            currentIdx = idx;
        }
    });

    menuItems.forEach((item, idx) => {
        if (idx === currentIdx) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Update targetProgress only if in first section
    if (currentIdx === 0) {
        // targetProgress is handled in handleMove
    }
});

function handleMove(clientX) {
    // Only update if in first section
    if (sliderContainer.scrollTop < window.innerHeight / 2) {
        targetProgress = Math.max(0, Math.min(1, clientX / window.innerWidth));
    }
}

window.addEventListener('mousemove', (e) => handleMove(e.clientX));
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) handleMove(e.touches[0].clientX);
}, { passive: true });


/**
 * Academics Section: Card Expansion Logic
 */
const academicCards = document.querySelectorAll('.academic-card');

academicCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // If clicking a link inside the card, don't toggle for the card itself
        if (e.target.closest('.institution-link')) return;

        const isExpanded = card.classList.contains('expanded');
        
        // Close all other cards for a clean UI
        academicCards.forEach(c => {
            if (c !== card) c.classList.remove('expanded');
        });

        // Toggle the clicked card
        card.classList.toggle('expanded');

        // If newly expanded, scroll it into focus
        if (!isExpanded) {
            setTimeout(() => {
                const container = document.getElementById('slider-container');
                const rect = card.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                
                // Calculate position relative to container's scroll top
                const targetTop = container.scrollTop + rect.top - containerRect.top - 80;
                
                container.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            }, 600); 
        }
    });
});
