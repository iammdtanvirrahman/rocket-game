// js/simulation.js

export function createSimulation(root, rocketStats = { parts: [], fuel: 100 }) {

    root.innerHTML = `
        <h2>🌌 Mission Control</h2>

        <div id="launch-area" style="
            position: relative;
            width: 100%;
            height: 560px;
            background: linear-gradient(to bottom, #0f172a, #020617);
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid rgba(0,255,255,0.2);
            box-shadow: inset 0 0 40px rgba(0,0,0,0.8);
        ">

            <!-- Stars Background -->
            <div id="stars" style="
                position: absolute;
                inset: 0;
                background-image:
                    radial-gradient(white 1px, transparent 1px),
                    radial-gradient(white 1px, transparent 1px);
                background-size: 60px 60px, 120px 120px;
                background-position: 0 0, 30px 30px;
                opacity: 0.25;
            "></div>

            <!-- HUD Display -->
            <div id="hud" style="
                position: absolute;
                top: 15px;
                left: 15px;
                z-index: 30;
                background: rgba(10, 15, 30, 0.85);
                padding: 12px 18px;
                border-radius: 12px;
                font-family: monospace;
                line-height: 1.8;
                min-width: 220px;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(0, 255, 255, 0.3);
                color: #fff;
            ">
                ALTITUDE: <span id="alt" style="color:#6cf0ff; font-weight:bold;">0</span> m<br>
                VELOCITY: <span id="vel" style="color:#4ade80; font-weight:bold;">0</span> m/s<br>
                FUEL REM : <span id="fuel" style="color:#facc15; font-weight:bold;">100</span>%<br>
                PHASE    : <span id="phase" style="color:#ff7878; font-weight:bold;">Ready</span>
            </div>

            <!-- Countdown Text -->
            <div id="countdown" style="
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 110px;
                font-weight: bold;
                color: #6cf0ff;
                text-shadow: 0 0 30px #00e5ff;
                opacity: 0;
                z-index: 40;
                pointer-events: none;
            "></div>

            <!-- World Stage Container -->
            <div id="world-stage" style="
                position: absolute;
                width: 100%;
                height: 100%;
                bottom: 0;
                left: 0;
                transition: transform 0.05s linear;
            ">
                <!-- Smoke Particle Layer -->
                <div id="smoke-layer" style="
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    z-index: 5;
                "></div>

                <!-- Launch Pad Structure -->
                <div id="launch-pad-structure" style="z-index: 8;">
                    <div style="
                        position: absolute;
                        left: 50%;
                        bottom: 90px;
                        transform: translateX(-50%);
                        width: 200px;
                        height: 16px;
                        background: #334155;
                        border-radius: 8px;
                        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                    "></div>
                    <div style="
                        position: absolute;
                        left: calc(50% + 50px);
                        bottom: 106px;
                        width: 10px;
                        height: 120px;
                        background: #475569;
                        border-radius: 4px;
                    "></div>
                </div>

                <!-- Ground Base -->
                <div id="ground" style="
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    height: 90px;
                    background: #064e3b;
                    border-top: 4px solid #10b981;
                    z-index: 6;
                "></div>

                <!-- Rocket Wrapper -->
                <div id="rocket-wrapper" style="
                    position: absolute;
                    left: 50%;
                    bottom: 106px;
                    transform: translateX(-50%);
                    z-index: 10;
                ">
                    <div id="rocket" style="
                        width: 100px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        position: relative;
                    ">
                        <!-- Rocket Parts Container -->
                        <div id="rocket-svg-container" style="display: flex; flex-direction: column; align-items: center;"></div>

                        <!-- Engine Flame -->
                        <div id="flame" style="
                            position: absolute;
                            left: 50%;
                            bottom: -55px;
                            transform: translateX(-50%);
                            width: 34px;
                            height: 70px;
                            background: linear-gradient(to bottom, #ffffff 0%, #ffd166 35%, #ff7a18 70%, #dc2626 100%);
                            clip-path: polygon(50% 0%, 15% 100%, 85% 100%);
                            filter: drop-shadow(0 0 16px #fb923c);
                            animation: rocketFlame 0.08s infinite alternate;
                            display: none;
                        "></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Control Buttons -->
        <div style="
            margin-top: 18px;
            display: flex;
            gap: 12px;
            justify-content: center;
        ">
            <button id="launchBtn" class="part-btn" style="background: linear-gradient(135deg, #059669, #10b981);">
                🚀 Launch Rocket
            </button>
            <button id="resetBtn" class="part-btn" style="background: linear-gradient(135deg, #dc2626, #ef4444);">
                🔄 Reset
            </button>
        </div>
    `;

    // Elements
    const launchArea = root.querySelector('#launch-area');
    const worldStage = root.querySelector('#world-stage');
    const rocketWrapper = root.querySelector('#rocket-wrapper');
    const rocketSvgContainer = root.querySelector('#rocket-svg-container');
    const flame = root.querySelector('#flame');
    const smokeLayer = root.querySelector('#smoke-layer');
    const countdown = root.querySelector('#countdown');

    const altEl = root.querySelector('#alt');
    const velEl = root.querySelector('#vel');
    const fuelEl = root.querySelector('#fuel');
    const phaseEl = root.querySelector('#phase');

    const launchBtn = root.querySelector('#launchBtn');
    const resetBtn = root.querySelector('#resetBtn');

    // Strict Correct Order Array Sorting Function
    function getOrderedParts(partsArray) {
        const order = { 'nose': 1, 'body': 2, 'engine': 3 };
        return [...partsArray].sort((a, b) => order[a] - order[b]);
    }

    // Build SVG Render Logic (Fixed Top-to-Bottom Render)
    if (rocketStats.parts && rocketStats.parts.length > 0) {
        rocketSvgContainer.innerHTML = '';
        
        const sortedParts = getOrderedParts(rocketStats.parts);

        const svgs = {
            nose: `<svg viewBox="0 0 120 100" style="width:100px; height:80px; display:block;"><path d="M60 6 L108 100 L12 100 Z" fill="#ff3b3b"/></svg>`,
            body: `<svg viewBox="0 0 120 140" style="width:100px; height:100px; display:block; margin-top:-2px;"><rect x="18" y="0" width="84" height="140" rx="15" fill="#bfc7d5"/><circle cx="60" cy="50" r="14" fill="#38bdf8"/></svg>`,
            engine: `<svg viewBox="0 0 120 80" style="width:100px; height:60px; display:block; margin-top:-2px;"><path d="M24 0 H96 L82 60 L38 60 Z" fill="#334155"/></svg>`
        };

        sortedParts.forEach(p => {
            rocketSvgContainer.innerHTML += svgs[p] || '';
        });
    } else {
        rocketSvgContainer.innerHTML = `<svg viewBox="0 0 120 200" width="100"><rect x="30" y="40" width="60" height="120" fill="#cbd5e1"/><polygon points="60,0 30,40 90,40" fill="#ef4444"/><polygon points="30,160 10,190 30,180" fill="#475569"/><polygon points="90,160 110,190 90,180" fill="#475569"/></svg>`;
    }

    // Flight Dynamics
    let altitude = 0;
    let velocity = 0;
    let fuel = rocketStats.fuel || 100;
    let launched = false;
    let rocketY = 0;

    function updateHUD(phase) {
        altEl.textContent = Math.floor(altitude);
        velEl.textContent = Math.floor(velocity);
        fuelEl.textContent = Math.max(0, Math.floor(fuel));
        phaseEl.textContent = phase;
    }

    // Smoke Generation
    function createSmoke() {
        const smoke = document.createElement('div');
        smoke.style.position = 'absolute';
        smoke.style.left = '50%';
        
        const spawnY = 106 + rocketY - 10;
        smoke.style.bottom = spawnY + 'px';

        const size = 20 + Math.random() * 25;
        smoke.style.width = size + 'px';
        smoke.style.height = size + 'px';
        smoke.style.borderRadius = '50%';
        smoke.style.background = 'rgba(230, 230, 230, 0.65)';
        smoke.style.filter = 'blur(4px)';
        smoke.style.pointerEvents = 'none';
        smoke.style.transform = 'translateX(-50%)';
        smoke.style.transition = 'transform 1.2s ease-out, opacity 1.2s ease-out';

        smokeLayer.appendChild(smoke);

        requestAnimationFrame(() => {
            const dx = (Math.random() - 0.5) * 80;
            const dy = 80 + Math.random() * 60;
            smoke.style.transform = `translate(calc(-50% + ${dx}px), ${dy}px) scale(3)`;
            smoke.style.opacity = '0';
        });

        setTimeout(() => smoke.remove(), 1300);
    }

    async function startCountdown() {
        countdown.style.opacity = '1';
        for (let i = 3; i >= 1; i--) {
            countdown.textContent = i;
            await new Promise(r => setTimeout(r, 900));
        }
        countdown.textContent = '🚀';
        await new Promise(r => setTimeout(r, 500));
        countdown.style.opacity = '0';
        launch();
    }

    function launch() {
        launched = true;
        flame.style.display = 'block';
        updateHUD('Ignition 🔥');
        requestAnimationFrame(simulationLoop);
    }

    function simulationLoop() {
        if (!launched) return;

        if (fuel > 0) {
            fuel -= 0.15;
            velocity += (rocketStats.thrust || 1200) / (rocketStats.weight || 1000) * 0.35;
            altitude += velocity * 0.8;
            rocketY += velocity * 0.4;

            rocketWrapper.style.transform = `translateX(-50%) translateY(-${rocketY}px)`;

            if (rocketY > 200) {
                const cameraY = rocketY - 200;
                worldStage.style.transform = `translateY(${cameraY}px)`;
            }

            createSmoke();

            if (altitude < 1500) {
                updateHUD('Ascending 🚀');
            } else if (altitude < 5000) {
                updateHUD('Upper Atmosphere 🌤️');
                launchArea.style.background = 'linear-gradient(to bottom, #030712, #0f172a)';
            } else {
                updateHUD('Space Flight 🌌');
                launchArea.style.background = 'linear-gradient(to bottom, #000000, #030712)';
            }

            requestAnimationFrame(simulationLoop);
        } else {
            flame.style.display = 'none';
            updateHUD('Fuel Empty ⛽');
        }
    }

    launchBtn.addEventListener('click', () => {
        if (!rocketStats.parts || rocketStats.parts.length === 0) {
            alert('⚠️ Build a rocket first in the Hangar!');
            return;
        }
        launchBtn.disabled = true;
        startCountdown();
    });

    resetBtn.addEventListener('click', () => {
        createSimulation(root, rocketStats);
    });

    updateHUD('Ready');
}
