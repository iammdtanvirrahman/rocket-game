const rocketParts = [];

function noseSVG() {
    return `
    <svg class="rocket-svg" viewBox="0 0 120 120">
        <defs>
            <linearGradient id="noseGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#ff9a9a"/>
                <stop offset="100%" stop-color="#ff3b3b"/>
            </linearGradient>
        </defs>
        <path d="M60 6 L108 108 L12 108 Z" fill="url(#noseGrad)"/>
    </svg>`;
}

function bodySVG() {
    return `
    <svg class="rocket-svg" viewBox="0 0 120 180">
        <defs>
            <linearGradient id="bodyGrad" x1="0" x2="1">
                <stop offset="0%" stop-color="#bfc7d5"/>
                <stop offset="50%" stop-color="#f8fafc"/>
                <stop offset="100%" stop-color="#8b97a8"/>
            </linearGradient>
        </defs>
        <rect x="18" y="6" width="84" height="168" rx="22"
              fill="url(#bodyGrad)" stroke="#ffffff" stroke-opacity="0.35"/>
        <circle cx="60" cy="54" r="18" fill="#5bc0ff"/>
        <circle cx="60" cy="54" r="8" fill="#dff4ff"/>
        <rect x="28" y="94" width="64" height="8" rx="4"
              fill="#64748b" opacity="0.75"/>
    </svg>`;
}

function engineSVG() {
    return `
    <svg class="rocket-svg" viewBox="0 0 120 120">
        <defs>
            <linearGradient id="engineGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#5b6575"/>
                <stop offset="100%" stop-color="#151b27"/>
            </linearGradient>
            <radialGradient id="flameGrad" cx="50%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#fff7c2"/>
                <stop offset="45%" stop-color="#ffd166"/>
                <stop offset="100%" stop-color="#ff7a18"/>
            </radialGradient>
        </defs>
        <path d="M24 10 H96 L82 64 L38 64 Z" fill="url(#engineGrad)"/>
        <path d="M46 64 Q60 112 74 64 Z" fill="url(#flameGrad)"/>
    </svg>`;
}

export function getRocketStats() {
    const nose = rocketParts.filter(p => p === 'nose').length;
    const body = rocketParts.filter(p => p === 'body').length;
    const engine = rocketParts.filter(p => p === 'engine').length;

    return {
        parts: rocketParts,
        stages: body,
        height: nose * 2 + body * 5 + engine * 3,
        weight: nose * 120 + body * 850 + engine * 420,
        thrust: engine * 1200,
        fuel: body * 100
    };
}

export function createBuilder(root, onLaunchReady) {
    root.innerHTML = `
        <h2>🛠️ Rocket Assembly Hangar</h2>

        <div class="part-list">
            <button class="part-btn" data-part="nose">🔺 Add Nose Cone</button>
            <button class="part-btn" data-part="body">⬜ Add Fuel Stage</button>
            <button class="part-btn" data-part="engine">⚙️ Add Main Engine</button>
            <button class="part-btn" id="clear-rocket" style="background: linear-gradient(135deg, #dc2626, #ef4444);">🗑️ Clear Rocket</button>
        </div>

        <div class="rocket-preview">
            <h3>🚀 Live Preview</h3>
            <div class="rocket-stack" id="rocket-preview">
                <div class="launch-placeholder">Build your first rocket 🚀</div>
            </div>
        </div>

        <div class="rocket-info" id="rocket-info">
            <div>Stages: <span>0</span></div>
            <div>Height: <span>0 m</span></div>
            <div>Weight: <span>0 kg</span></div>
            <div>Thrust: <span>0 kN</span></div>
        </div>

        <button class="part-btn" id="proceed-launch-btn" style="margin-top: 15px; background: linear-gradient(135deg, #059669, #10b981); width: 100%;" disabled>
            🚀 Proceed to Launch Pad
        </button>
    `;

    const preview = root.querySelector('#rocket-preview');
    const info = root.querySelector('#rocket-info');
    const launchBtn = root.querySelector('#proceed-launch-btn');

    function renderRocket() {
        if (rocketParts.length === 0) {
            preview.innerHTML = `<div class="launch-placeholder">Build your first rocket 🚀</div>`;
            launchBtn.disabled = true;
        } else {
            preview.innerHTML = '';
            rocketParts.forEach(part => {
                const wrapper = document.createElement('div');
                if (part === 'nose') wrapper.innerHTML = noseSVG();
                if (part === 'body') wrapper.innerHTML = bodySVG();
                if (part === 'engine') wrapper.innerHTML = engineSVG();
                preview.prepend(wrapper.firstElementChild);
            });

            // Enable launch if an engine is present
            const hasEngine = rocketParts.includes('engine');
            launchBtn.disabled = !hasEngine;
        }

        const stats = getRocketStats();
        info.innerHTML = `
            <div>Stages: <span>${stats.stages}</span></div>
            <div>Height: <span>${stats.height} m</span></div>
            <div>Weight: <span>${stats.weight} kg</span></div>
            <div>Thrust: <span>${stats.thrust} kN</span></div>
        `;
    }

    root.querySelectorAll('.part-btn[data-part]').forEach(btn => {
        btn.addEventListener('click', () => {
            rocketParts.push(btn.dataset.part);
            renderRocket();
        });
    });

    root.querySelector('#clear-rocket').addEventListener('click', () => {
        rocketParts.length = 0;
        renderRocket();
    });

    launchBtn.addEventListener('click', () => {
        if (onLaunchReady) onLaunchReady(getRocketStats());
    });
}
