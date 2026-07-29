```javascript
export function createSimulation(root, rocketStats = { parts: [], fuel: 100 }) {

    root.innerHTML = `
        <h2>Mission Control</h2>

        <div id="launch-area" style="
            position: relative;
            width: 100%;
            height: 520px;
            background: linear-gradient(to bottom, #0f172a, #020617);
            border-radius: 16px;
            overflow: hidden;
        ">

            <div id="hud" style="
                position:absolute;
                top:10px;
                left:10px;
                z-index:10;
                background:rgba(0,0,0,0.5);
                padding:10px 14px;
                border-radius:10px;
                font-family:monospace;
                line-height:1.6;
            ">
                Altitude: <span id="alt">0</span> m<br>
                Speed: <span id="spd">0</span> m/s<br>
                Fuel: <span id="fuel">100</span>%<br>
                Phase: <span id="phase">Ready</span>
            </div>

            <div id="countdown" style="
                position:absolute;
                inset:0;
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:100px;
                font-weight:bold;
                color:#6cf0ff;
                opacity:0;
                z-index:20;
            "></div>

            <div id="rocket" style="
                position:absolute;
                left:50%;
                bottom:90px;
                transform:translateX(-50%);
                width:80px;
                height:150px;
                z-index:5;
            ">

                <svg viewBox="0 0 100 180" width="100%" height="100%">
                    <polygon points="50,0 15,45 85,45" fill="#ef4444"/>
                    <rect x="18" y="45" width="64" height="100" rx="18" fill="#e2e8f0"/>
                    <circle cx="50" cy="78" r="12" fill="#38bdf8"/>
                    <rect x="34" y="145" width="32" height="16" rx="6" fill="#475569"/>
                </svg>

                <div id="flame" style="
                    position:absolute;
                    left:50%;
                    bottom:-34px;
                    transform:translateX(-50%);
                    width:26px;
                    height:54px;
                    background:linear-gradient(to bottom, #fde68a, #f97316, #dc2626);
                    clip-path:polygon(50% 0%, 0% 100%, 100% 100%);
                    animation:flame 0.12s infinite alternate;
                    display:none;
                "></div>
            </div>

            <div id="smoke-layer" style="
                position:absolute;
                inset:0;
                pointer-events:none;
                overflow:hidden;
            "></div>

            <div style="
                position:absolute;
                left:0;
                right:0;
                bottom:0;
                height:90px;
                background:#064e3b;
            "></div>
        </div>

        <div style="margin-top:18px; display:flex; gap:12px; justify-content:center;">
            <button id="launchBtn" class="part-btn">Launch Rocket</button>
            <button id="resetBtn" class="part-btn"
                style="background:linear-gradient(135deg,#dc2626,#ef4444)">
                Reset
            </button>
        </div>
    `;

    const rocket = root.querySelector('#rocket');
    const flame = root.querySelector('#flame');
    const smokeLayer = root.querySelector('#smoke-layer');
    const countdown = root.querySelector('#countdown');

    const altEl = root.querySelector('#alt');
    const spdEl = root.querySelector('#spd');
    const fuelEl = root.querySelector('#fuel');
    const phaseEl = root.querySelector('#phase');

    const launchBtn = root.querySelector('#launchBtn');
    const resetBtn = root.querySelector('#resetBtn');

    let altitude = 0;
    let velocity = 0;
    let fuel = rocketStats.fuel || 100;
    let launched = false;
    let rocketOffset = 0;

    function updateHUD(phase) {
        altEl.textContent = Math.floor(altitude);
        spdEl.textContent = Math.floor(velocity);
        fuelEl.textContent = Math.max(0, Math.floor(fuel));
        phaseEl.textContent = phase;
    }

    function createSmoke() {
        const smoke = document.createElement('div');

        smoke.style.position = 'absolute';
        smoke.style.left = '50%';
        smoke.style.bottom = '100px';
        smoke.style.width = '20px';
        smoke.style.height = '20px';
        smoke.style.borderRadius = '50%';
        smoke.style.background = 'rgba(200,200,200,0.45)';
        smoke.style.transition = 'all 1.2s linear';

        smokeLayer.appendChild(smoke);

        requestAnimationFrame(() => {
            smoke.style.transform = 'translateY(-120px) scale(2.2)';
            smoke.style.opacity = '0';
        });

        setTimeout(() => smoke.remove(), 1300);
    }

    async function startCountdown() {
        countdown.style.opacity = '1';

        for (let i = 3; i >= 1; i--) {
            countdown.textContent = i;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        countdown.textContent = 'GO';
        await new Promise(resolve => setTimeout(resolve, 700));

        countdown.style.opacity = '0';

        launch();
    }

    function launch() {
        launched = true;
        flame.style.display = 'block';
        updateHUD('Ignition');

        requestAnimationFrame(simulationLoop);
    }

    function simulationLoop() {
        if (!launched) return;

        if (fuel > 0) {
            fuel -= 0.35;
            velocity += 0.55;
            altitude += velocity * 0.8;
            rocketOffset += velocity * 0.35;

            rocket.style.transform =
                'translateX(-50%) translateY(-' + rocketOffset + 'px)';

            createSmoke();

            if (altitude < 1000) {
                updateHUD('Ascending');
            } else if (altitude < 4000) {
                updateHUD('Upper Atmosphere');
            } else {
                updateHUD('Space Flight');
            }

            requestAnimationFrame(simulationLoop);
        } else {
            flame.style.display = 'none';
            updateHUD('Fuel Empty');
        }
    }

    launchBtn.addEventListener('click', () => {

        if (!rocketStats.parts || !rocketStats.parts.includes('engine')) {
            alert('Build a rocket with an engine first');
            return;
        }

        launchBtn.disabled = true;
        startCountdown();
    });

    resetBtn.addEventListener('click', () => {
        createSimulation(root, rocketStats);
    });

    updateHUD('Ready');

    if (!document.getElementById('rocket-flame-style')) {
        const style = document.createElement('style');

        style.id = 'rocket-flame-style';

        style.textContent = `
            @keyframes flame {
                from {
                    transform: translateX(-50%) scaleY(1);
                    height: 46px;
                }
                to {
                    transform: translateX(-50%) scaleY(1.18);
                    height: 60px;
                }
            }
        `;

        document.head.appendChild(style);
    }
}
```
