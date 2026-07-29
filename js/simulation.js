// js/simulation.js

export function createSimulation(root, rocketStats = { parts: [], fuel: 100 }) {

    root.innerHTML = `
        <h2>🌌 Mission Control & Launch Pad</h2>

        <div id="launch-area" style="
            position: relative;
            width: 100%;
            height: 580px;
            background: linear-gradient(to bottom, #091026 0%, #132247 60%, #1d3557 100%);
            border-radius: 18px;
            overflow: hidden;
            border: 1px solid rgba(0, 255, 255, 0.2);
            box-shadow: inset 0 0 50px rgba(0,0,0,0.6);
        ">

            <!-- Stars Layer -->
            <div id="stars" style="
                position: absolute;
                inset: 0;
                background-image:
                    radial-gradient(white 1px, transparent 1px),
                    radial-gradient(white 1px, transparent 1px);
                background-size: 50px 50px, 100px 100px;
                background-position: 0 0, 25px 25px;
                opacity: 0.3;
            "></div>

            <!-- Parallax Cloud Layer 1 (Far Clouds) -->
            <div id="clouds-far" style="
                position: absolute;
                width: 200%;
                height: 100%;
                top: -100px;
                background: radial-gradient(circle, rgba(255,255,255,0.12) 20%, transparent 60%);
                background-size: 180px 100px;
                pointer-events: none;
            "></div>

            <!-- Parallax Cloud Layer 2 (Near Clouds) -->
            <div id="clouds-near" style="
                position: absolute;
                width: 200%;
                height: 100%;
                top: 50px;
                background: radial-gradient(circle, rgba(255,255,255,0.18) 30%, transparent 70%);
                background-size: 260px 140px;
                pointer-events: none;
            "></div>

            <!-- HUD Overlay -->
            <div id="hud" style="
                position: absolute;
                top: 15px;
                left: 15px;
                z-index: 25;
                background: rgba(10, 15, 30, 0.75);
                padding: 14px 18px;
                border-radius: 12px;
                font-family: 'Courier New', monospace;
                line-height: 1.8;
                min-width: 220px;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(0,255,255,0.3);
                color: #ffffff;
                box-shadow: 0 0 15px rgba(0,0,0,0.5);
            ">
                ALTITUDE: <span id="alt" style="color:#6cf0ff; font-weight:bold;">0</span> m<br>
                VELOCITY: <span id="vel" style="color:#4ade80; font-weight:bold;">0</span> m/s<br>
                FUEL REM : <span id="fuel" style="color:#facc15; font-weight:bold;">100</span>%<br>
                PHASE    : <span id="phase" style="color:#ff7878; font-weight:bold;">Ready</span>
            </div>

            <!-- Countdown Display -->
            <div id="countdown" style="
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 120px;
                font-weight: 900;
                color: #6cf0ff;
                text-shadow: 0 0 30px #00e5ff, 0 0 60px #00e5ff;
                opacity: 0;
                z-index: 35;
                pointer-events: none;
            "></div>

            <!-- Rocket Container -->
            <div id="rocket-wrapper" style="
                position: absolute;
                left: 50%;
                bottom: 110px;
                transform: translateX(-50%);
                z-index: 15;
            ">
                <div id="rocket" style="
                    width: 100px;
                    min-height: 180px;
                    position: relative;
                    transition: transform 0.05s linear;
                ">
                    <!-- Dynamic SVG Rocket Loader -->
                    <div id="rocket-svg-container"></div>

                    <!-- Animated Exhaust Flame -->
                    <div id="flame" style="
                        position: absolute;
                        left: 50%;
                        bottom: -55px;
                        transform: translateX(-50%);
                        width: 38px;
                        height: 80px;
                        background: linear-gradient(to bottom, #ffffff 0%, #ffeb3b 25%, #ff9800 60%, #f44336 100%);
                        clip-path: polygon(50% 0%, 15% 100%, 85% 100%);
                        filter: drop-shadow(0 0 20px #ff9800);
                        animation: rocketFlame 0.08s infinite alternate;
                        display: none;
                    "></div>
                </div>
            </div>

            <!-- Smoke Particles Container -->
            <div id="smoke-layer" style="
                position: absolute;
                inset: 0;
                pointer-events: none;
                z-index: 12;
            "></div>

            <!-- Launch Tower (Structure) -->
            <div id="launch-tower" style="
                position: absolute;
                left: calc(50% + 55px);
                bottom: 110px;
                width: 24px;
                height: 240px;
                background: repeating-linear-gradient(0deg, #475569, #475569 10px, #1e293b 10px, #1e293b 20px);
                border-left: 2px solid #64748b;
                z-index: 8;
            "></div>

            <!-- Ground Base Layer -->
            <div id="ground" style="
                position: absolute;
                left: 0;
                right: 0;
                bottom: 0;
                height: 110px;
                background: linear-gradient(to bottom, #15803d, #052e16);
                border-top: 5px solid #22c55e;
                z-index: 10;
            ">
                <!-- Concrete Launch Pad -->
                <div style="
                    position: absolute;
                    left: 50%;
                    top: 0;
                    transform: translateX(-50%);
                    width: 260px;
                    height: 18px;
                    background: #334155;
                    border-bottom: 3px solid #1e293b;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                "></div>
            </div>
        </div>

        <!-- Control Action Buttons -->
        <div style="
            margin-top: 20px;
            display: flex;
            gap: 15px;
            justify-content: center;
        ">
            <button id="launchBtn" class="part-btn" style="background: linear-gradient(135deg, #059669, #10b981); min-width: 180px;">
                🚀 Launch Rocket
            </button>
            <button id="resetBtn" class="part-btn" style="background: linear-gradient(135deg, #dc2626, #ef4444);">
                🔄 Reset Pad
            </button>
        </div>
    `;

    // DOM References
    const launchArea = root.querySelector('#launch-area');
    const rocket = root.querySelector('#rocket');
    const rocketSvgContainer = root.querySelector('#rocket-svg-container');
    const flame = root.querySelector('#flame');
    const smokeLayer = root.querySelector('#smoke-layer');
    const countdown = root.querySelector('#countdown');
    const ground = root.querySelector('#ground');
    const tower = root.querySelector('#launch-tower');
    const cloudsFar = root.querySelector('#clouds-far');
    const cloudsNear = root.querySelector('#clouds-near');

    const altEl = root.querySelector('#alt');
    const velEl = root.querySelector('#vel');
    const fuelEl = root.querySelector('#fuel');
    const phaseEl = root.querySelector('#phase');

    const launchBtn = root.querySelector('#launchBtn');
    const resetBtn = root.querySelector('#resetBtn');

    // Render Build SVG Structure inside Mission Control
    if (rocketStats.parts && rocketStats.parts.length > 0) {
        rocketSvgContainer.innerHTML = '';
        const svgs = {
            nose: `<svg viewBox="0 0 120 100" style="width:100px; display:block; margin:-4px 0;"><path d="M60 6 L108 100 L12 100 Z" fill="#ff3b3b"/></svg>`,
            body: `<svg viewBox="0 0 120 140" style="width:100px; display:block; margin:-4px 0;"><rect x="18" y="0" width="84" height="140" rx="15" fill="#bfc7d5"/><circle cx="60" cy="50" r="14" fill="#38bdf8"/></svg>`,
            engine: `<svg viewBox="0 0 120 80" style="width:100px; display:block; margin:-4px 0;"><path d="M24 0 H96 L82 60 L38 60 Z" fill="#334155"/></svg>`
        };
        rocketStats.parts.forEach(p => {
            rocketSvgContainer.innerHTML += svgs[p] || '';
        });
    } else {
        // Fallback Default Design
        rocketSvgContainer.innerHTML = `<svg viewBox="0 0 120 200" width="100"><rect x="30" y="40" width="60" height="120" fill="#cbd5e1"/><polygon points="60,0 30,40 90,40" fill="#ef4444"/><polygon points="30,160 10,190 30,180" fill="#475569"/><polygon points="90,160 110,190 90,180" fill="#475569"/></svg>`;
    }

    // Flight Dynamics State
    let altitude = 0;
    let velocity = 0;
    let fuel = rocketStats.fuel || 100;
    let launched = false;
    let rocketOffset = 0;
    let cameraOffset = 0;

    function updateHUD(phase) {
        altEl.textContent = Math.floor(altitude);
        velEl.textContent = Math.floor(velocity);
        fuelEl.textContent = Math.max(0, Math.floor(fuel));
        phaseEl.textContent = phase;
    }

    function createSmoke() {
        const smoke = document.createElement('div');
        smoke.style.position = 'absolute';
        smoke.style.left = '50%';
        smoke.style.bottom = (120 + rocketOffset - cameraOffset) + 'px';

        const size = 20 + Math.random() * 25;
        smoke.style.width = size + 'px';
        smoke.style.height = size + 'px';
        smoke.style.borderRadius = '50%';
        smoke.style.background = 'rgba(240,240,240,0.6)';
        smoke.style.filter = 'blur(4px)';
        smoke.style.transition = 'transform 1.4s linear, opacity 1.4s linear';

        smokeLayer.appendChild(smoke);

        requestAnimationFrame(() => {
            const dx = (Math.random() - 0.5) * 120;
            const dy = 100 + Math.random() * 100;
            smoke.style.transform = 'translate(' + dx + 'px, -' + dy + 'px) scale(3.5)';
            smoke.style.opacity = '0';
        });

        setTimeout(() => smoke.remove(), 1500);
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
            rocketOffset += velocity * 0.4;

            // Smooth Camera Track
            if (rocketOffset > 150) {
                cameraOffset = rocketOffset - 150;
            }

            // Apply Moves & Cloud Parallax Effects
            rocket.style.transform = 'translateY(-' + (rocketOffset - cameraOffset) + 'px)';
            ground.style.transform = 'translateY(' + cameraOffset + 'px)';
            tower.style.transform = 'translateY(' + cameraOffset + 'px)';
            
            // Parallax Speeds (Clouds move slower than the camera)
            cloudsFar.style.transform = 'translateY(' + (cameraOffset * 0.25) + 'px)';
            cloudsNear.style.transform = 'translateY(' + (cameraOffset * 0.55) + 'px)';

            createSmoke();

            // Atmosphere Shift
            if (altitude < 1500) {
                updateHUD('Atmospheric Ascent ☁️');
            } else if (altitude < 5000) {
                updateHUD('Stratosphere 🌤️');
                launchArea.style.background = 'linear-gradient(to bottom, #030712 0%, #0b1329 50%, #1d2d50 100%)';
            } else if (altitude < 10000) {
                updateHUD('Mesosphere 🌌');
                launchArea.style.background = 'linear-gradient(to bottom, #000000 0%, #030712 70%, #091026 100%)';
            } else {
                updateHUD('Orbit Transition 🛰️');
            }

            requestAnimationFrame(simulationLoop);
        } else {
            flame.style.display = 'none';
            updateHUD('Engine Cutoff (MECO) ⛽');
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
