// js/builder.js

const rocketParts = [];
const TOTAL_BUDGET = 10000;
const COSTS = {
    nose: 500,
    body: 2000,
    engine: 5000
};

// --- SVG Components ---
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
        <rect x="18" y="6" width="84" height="168" rx="22" fill="url(#bodyGrad)" stroke="#ffffff" stroke-opacity="0.35"/>
        <circle cx="60" cy="54" r="18" fill="#5bc0ff"/>
        <circle cx="60" cy="54" r="8" fill="#dff4ff"/>
        <rect x="28" y="94" width="64" height="8" rx="4" fill="#64748b" opacity="0.75"/>
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
        </defs>
        <path d="M24 10 H96 L82 64 L38 64 Z" fill="url(#engineGrad)"/>
    </svg>`;
}

// --- Dynamic Calculations ---
export function getRocketStats() {
    const nose = rocketParts.filter(p => p === 'nose').length;
    const body = rocketParts.filter(p => p === 'body').length;
    const engine = rocketParts.filter(p => p === 'engine').length;

    const currentCost = (nose * COSTS.nose) + (body * COSTS.body) + (engine * COSTS.engine);

    return {
        parts: [...rocketParts],
        noseCount: nose,
        bodyCount: body,
        engineCount: engine,
        cost: currentCost,
        remainingBudget: TOTAL_BUDGET - currentCost,
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

        <!-- Budget Monitor -->
        <div style="background: rgba(0,0,0,0.4); padding: 14px; border-radius: 12px; margin-bottom: 18px; border: 1px solid rgba(0,255,255,0.2);">
            <div style="display: flex; justify-content: space-between; font-size: 1.1rem;">
                <span>Budget: <strong style="color: #4ade80;">£10,000</strong></span>
                <span>Remaining: <strong id="rem-budget" style="color: #6cf0ff;">£10,000</strong></span>
            </div>
        </div>

        <div class="part-list">
            <button class="part-btn" data-part="nose" id="btn-nose">🔺 Nose Cone (£500) <span id="nose-count">[0/1]</span></button>
            <button class="part-btn" data-part="body" id="btn-body">⬜ Fuel Stage (£2,000) <span id="body-count">[0/5]</span></button>
            <button class="part-btn" data-part="engine" id="btn-engine">⚙️ Main Engine (£5,000) <span id="engine-count">[0/1]</span></button>

            <button class="part-btn" id="clear-rocket" style="background: linear-gradient(135deg, #dc2626, #ef4444); margin-top: 10px;">
                🗑️ Clear Rocket
            </button>
        </div>

        <!-- Live Visual Stack -->
        <div class="rocket-preview" style="box-shadow: inset 0 0 30px rgba(0,255,255,0.05); border: 1px solid rgba(0,255,255,0.15);">
            <h3>🚀 Live Preview</h3>
            <div class="rocket-stack" id="rocket-preview">
                <div class="launch-placeholder">Build your rocket to proceed 🚀</div>
            </div>
        </div>

        <div class="rocket-info" id="rocket-info">
            <div>Fuel Stages: <span id="stat-stages">0 / 5</span></div>
            <div>Total Height: <span id="stat-height">0 m</span></div>
            <div>Total Weight: <span id="stat-weight">0 kg</span></div>
            <div>Engine Thrust: <span id="stat-thrust">0 kN</span></div>
        </div>

        <!-- Validation Launch Button -->
        <button class="part-btn" id="proceed-launch-btn" style="margin-top: 18px; width: 100%; transition: 0.3s;" disabled>
            ⚠️ Add Parts to Start
        </button>
    `;

    const preview = root.querySelector('#rocket-preview');
    const remBudgetEl = root.querySelector('#rem-budget');
    const launchBtn = root.querySelector('#proceed-launch-btn');

    function renderRocket() {
        const stats = getRocketStats();

        // Budget Indicators
        remBudgetEl.textContent = '£' + stats.remainingBudget.toLocaleString();
        remBudgetEl.style.color = stats.remainingBudget < 2000 ? '#ef4444' : '#6cf0ff';

        // Update Part Counter Displays
        root.querySelector('#nose-count').textContent = `[${stats.noseCount}/1]`;
        root.querySelector('#body-count').textContent = `[${stats.bodyCount}/5]`;
        root.querySelector('#engine-count').textContent = `[${stats.engineCount}/1]`;

        // Render Stack SVG UI
        preview.innerHTML = '';
        if (rocketParts.length === 0) {
            preview.innerHTML = `<div class="launch-placeholder">Build your rocket to proceed 🚀</div>`;
        } else {
            rocketParts.forEach(part => {
                const wrapper = document.createElement('div');
                if (part === 'nose') wrapper.innerHTML = noseSVG();
                if (part === 'body') wrapper.innerHTML = bodySVG();
                if (part === 'engine') wrapper.innerHTML = engineSVG();
                if (wrapper.firstElementChild) {
                    preview.prepend(wrapper.firstElementChild);
                }
            });
        }

        // Live Stats Update
        root.querySelector('#stat-stages').textContent = `${stats.stages} / 5`;
        root.querySelector('#stat-height').textContent = `${stats.height} m`;
        root.querySelector('#stat-weight').textContent = `${stats.weight} kg`;
        root.querySelector('#stat-thrust').textContent = `${stats.thrust} kN`;

        // System Launch Validation State
        if (stats.noseCount === 0) {
            launchBtn.disabled = true;
            launchBtn.style.background = '#475569';
            launchBtn.textContent = '⚠️ Add Nose Cone for Aerodynamics';
        } else if (stats.bodyCount === 0) {
            launchBtn.disabled = true;
            launchBtn.style.background = '#475569';
            launchBtn.textContent = '⚠️ Add at least 1 Fuel Stage';
        } else if (stats.engineCount === 0) {
            launchBtn.disabled = true;
            launchBtn.style.background = '#475569';
            launchBtn.textContent = '⚠️ Add Engine to Launch';
        } else {
            launchBtn.disabled = false;
            launchBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            launchBtn.textContent = '✅ Proceed to Launch Pad';
        }
    }

    // Interactive Part Add Handling + Hard Limits
    root.querySelectorAll('.part-btn[data-part]').forEach(btn => {
        btn.addEventListener('click', () => {
            const part = btn.dataset.part;
            const stats = getRocketStats();

            // Budget Checks
            if (stats.remainingBudget < COSTS[part]) {
                alert('❌ Insufficient Budget!');
                return;
            }

            // Assembly Part Limits
            if (part === 'nose' && stats.noseCount >= 1) {
                alert('⚠️ Only 1 Nose Cone allowed!');
                return;
            }
            if (part === 'body' && stats.bodyCount >= 5) {
                alert('⚠️ Maximum 5 Fuel Stages allowed!');
                return;
            }
            if (part === 'engine' && stats.engineCount >= 1) {
                alert('⚠️ Only 1 Engine allowed!');
                return;
            }

            rocketParts.push(part);
            renderRocket();
        });
    });

    root.querySelector('#clear-rocket').addEventListener('click', () => {
        rocketParts.length = 0;
        renderRocket();
    });

    launchBtn.addEventListener('click', () => {
        const stats = getRocketStats();
        if (stats.engineCount > 0 && stats.noseCount > 0 && stats.bodyCount > 0) {
            onLaunchReady?.(stats);
        }
    });

    renderRocket();
}
