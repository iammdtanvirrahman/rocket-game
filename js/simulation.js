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
            border: 1px solid rgba(255,255,255,0.08);
        ">

            <!-- Stars Background -->
            <div id="stars" style="
                position:absolute;
                inset:0;
                background-image:
                    radial-gradient(white 1px, transparent 1px),
                    radial-gradient(white 1px, transparent 1px);
                background-size: 60px 60px, 120px 120px;
                background-position: 0 0, 30px 30px;
                opacity:0.18;
            "></div>

            <!-- HUD (Heads Up Display) -->
            <div id="hud" style="
                position:absolute;
                top:12px;
                left:12px;
                z-index:20;
                background:rgba(0,0,0,0.55);
                padding:12px 16px;
                border-radius:12px;
                font-family:monospace;
                line-height:1.7;
                min-width:200px;
                backdrop-filter: blur(6px);
                border:1px solid rgba(255,255,255,0.08);
                color: #fff;
            ">
                Altitude: <span id="alt">0</span> m<br>
                Velocity: <span id="vel">0</span> m/s<br>
                Fuel: <span id="fuel">100</span>%<br>
                Phase: <span id="phase">Ready</span>
            </div>

            <!-- Countdown Text -->
            <div id="countdown" style="
                position:absolute;
                inset:0;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:110px;
                font-weight:bold;
                color:#6cf0ff;
                text-shadow:0 0 20px #00e5ff;
                opacity:0;
                z-index:30;
                pointer-events:none;
            "></div>

            <!-- Rocket Container (Camera follows this) -->
            <div id="rocket-wrapper" style="
                position:absolute;
                left:50%;
                bottom:95px;
                transform:translateX(-50%);
                z-index:10;
            ">
                <div id="rocket" style="
                    width:96px;
                    height:180px;
                    position:relative;
                    transition:transform 0.05s linear;
                ">
                    <!-- Rocket SVG -->
                    <svg viewBox="0 0 120 220" width="100%" height="100%">
                        <defs>
                            <linearGradient id="bodyGrad" x1="0" x2="1">
                                <stop offset="0%" stop-color="#bfc7d5"/>
                                <stop offset="50%" stop-color="#f8fafc"/>
                                <stop offset="100%" stop-color="#8b97a8"/>
                            </linearGradient>
                        </defs>
                        <polygon points="60,0 18,52 102,52" fill="#ef4444"/>
                        <rect x="20" y="52" width="80" height="120" rx="24" fill="url(#bodyGrad)" stroke="#ffffff" stroke-opacity="0.35"/>
                        <circle cx="60" cy="86" r="14" fill="#38bdf8"/>
                        <circle cx="60" cy="86" r="6" fill="#dff4ff"/>
                        <polygon points="20,136 2,186 20,176" fill="#64748b"/>
                        <polygon points="100,136 118,186 100,176" fill="#64748b"/>
                        <rect x="42" y="172" width="36" height="18" rx="6" fill="#475569"/>
                    </svg>

                    <!-- Engine Flame -->
                    <div id="flame" style="
                        position:absolute;
                        left:50%;
                        bottom:-42px;
                        transform:translateX(-50%);
                        width:34px;
                        height:70px;
                        background:linear-gradient(to bottom, #fff7c2 0%, #ffd166 35%, #ff7a18 70%, #dc2626 100%);
                        clip-path:polygon(50% 0%, 10% 100%, 90% 100%);
                        filter:drop-shadow(0 0 14px #fb923c);
                        animation:rocketFlame 0.1s infinite alternate;
                        display:none;
                    "></div>
                </div>
            </div>

            <!-- Smoke Layer -->
            <div id="smoke-layer" style="
                position:absolute;
                inset:0;
                pointer-events:none;
                overflow:hidden;
            "></div>

            <!-- Ground Base -->
            <div style="
                position:absolute;
                left:0;
                right:0;
                bottom:0;
                height:95px;
                background:#064e3b;
                border-top:4px solid #10b981;
            "></div>

            <!-- Launch Pad Shadows & Structure -->
            <div style="
                position:absolute;
                left:50%;
                bottom:84px;
                transform:translateX(-50%);
                width:180px;
                height:18px;
                background:#334155;
                border-radius:999px;
                box-shadow:0 0 12px rgba(0,0,0,0.4);
            "></div>
            <div style="
                position:absolute;
                left:50%;
                bottom:102px;
                transform:translateX(-50%);
                width:12px;
                height:72px;
                background:#475569;
                border-radius:8px;
            "></div>
        </div>

        <!-- Controls -->
        <div style="
            margin-top:18px;
            display:flex;
            gap:12px;
            justify-content:center;
            flex-wrap:wrap;
        ">
            <button id="launchBtn" class="part-btn">
                🚀 Start Countdown
            </button>
            <button id="resetBtn" class="part-btn"
                style="background:linear-gradient(135deg,#dc2626,#ef4444)">
                🔄 Reset
            </button>
        </div>
    `;

    // DOM Elements Selection
    const launchArea = root.querySelector('#launch-area');
    const rocket = root.querySelector('#rocket');
    const flame = root.querySelector('#flame');
    const smokeLayer = root.querySelector('#smoke-layer');
    const countdown = root.querySelector('#countdown');

    const altEl = root.querySelector('#alt');
    const velEl = root.querySelector('#vel');
    const fuelEl = root.querySelector('#fuel');
    const phaseEl = root.querySelector('#phase');

    const launchBtn = root.querySelector('#launchBtn');
    const resetBtn = root.querySelector('#resetBtn');

    // Simulation Variables
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
        smoke.style.bottom = (110 + rocketOffset - cameraOffset) + 'px';

        const size = 18 + Math.random() * 22;
        smoke.style.width = size + 'px';
        smoke.style.height = size + 'px';
        smoke.style.borderRadius = '50%';
        smoke.style.background = 'rgba(220,220,220,0.55)';
        smoke.style.filter = 'blur(3px)';
        smoke.style.pointerEvents = 'none';
        smoke.style.transition = 'transform 1.5s linear, opacity 1.5s linear';

        smokeLayer.appendChild(smoke);

        requestAnimationFrame(function () {
            const dx = (Math.random() - 0.5) * 100;
            const dy = 120 + Math.random() * 140;
            // Using standard string concatenation to prevent Syntax Errors
            smoke.style.transform = 'translate(' + dx + 'px, -' + dy + 'px) scale(3)';
            smoke.style.opacity = '0';
        });

        setTimeout(function () {
            smoke.remove();
        }, 1600);
    }

    async function startCountdown() {
        countdown.style.opacity = '1';
        for (let i = 3; i >= 1; i--) {
            countdown.textContent = i;
            await new Promise(function (resolve) { setTimeout(resolve, 1000); });
        }
        countdown.textContent = '🚀';
        await new Promise(function (resolve) { setTimeout(resolve, 700); });
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
            fuel -= 0.12;
            velocity += 0.42;
            altitude += velocity * 0.82;
            rocketOffset += velocity * 0.38;

            // Camera follow logic
            if (rocketOffset > 140) {
                cameraOffset = rocketOffset - 140;
            }

            // Keeping rocket in view using simple string concatenation
            rocket.style.transform = 'translateY(-' + (rocketOffset - cameraOffset) + 'px)';
            launchArea.style.backgroundPositionY = (cameraOffset * 0.5) + 'px';

            createSmoke();

            // Phases
            if (altitude < 1000) {
                updateHUD('Ascending 🚀');
            } else if (altitude < 4000) {
                updateHUD('Upper Atmosphere 🛰️');
            } else if (altitude < 9000) {
                updateHUD('Near Space 🌠');
            } else {
                updateHUD('Space Flight 🌌');
            }

            // Darken sky in higher altitudes
            if (altitude > 3000) {
                launchArea.style.background = 'linear-gradient(to bottom, #020617, #000000)';
            }

            requestAnimationFrame(simulationLoop);
        } else {
            flame.style.display = 'none';
            updateHUD('Fuel Empty ⛽');
        }
    }

    launchBtn.addEventListener('click', function () {
        if (!rocketStats.parts || !rocketStats.parts.includes('engine')) {
            alert('⚠️ Build a rocket with an engine first!');
            return;
        }
        launchBtn.disabled = true;
        startCountdown();
    });

    resetBtn.addEventListener('click', function () {
        createSimulation(root, rocketStats);
    });

    updateHUD('Ready');

    // Safe injection of CSS animation to avoid template literal issues
    if (!document.getElementById('rocket-flame-style')) {
        const style = document.createElement('style');
        style.id = 'rocket-flame-style';
        style.textContent = 
            '@keyframes rocketFlame {' +
                'from { transform: translateX(-50%) scaleY(1); height: 56px; opacity:0.9; }' +
                'to { transform: translateX(-50%) scaleY(1.25); height: 74px; opacity:1; }' +
            '}';
        document.head.appendChild(style);
    }
}
