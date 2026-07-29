
```javascript
export function createSimulation(root, rocketStats = { parts: [], fuel: 100, thrust: 1200, weight: 1000 }) {
    root.innerHTML = `
        <h2>🌌 Mission Control & Launch Pad</h2>

        <div id="sim-view" style="
            position: relative;
            width: 100%;
            height: calc(100% - 60px);
            background: linear-gradient(to bottom, #020617, #0f172a);
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        ">

            <canvas id="simCanvas" style="
                position: absolute;
                inset: 0;
                width: 100%;
                height: 100%;
            "></canvas>

            <div id="telemetry" class="rocket-info" style="
                position: absolute;
                top: 15px;
                left: 15px;
                z-index: 10;
                min-width: 240px;
            ">
                <div>Altitude: <span id="tel-alt">0 m</span></div>
                <div>Velocity: <span id="tel-vel">0 m/s</span></div>
                <div>Fuel: <span id="tel-fuel">100%</span></div>
                <div>Phase: <span id="tel-phase">Ready on Pad</span></div>
            </div>

            <div id="countdown" style="
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 120px;
                font-weight: bold;
                color: #6cf0ff;
                text-shadow: 0 0 20px #00e5ff;
                z-index: 20;
                opacity: 0;
                pointer-events: none;
            ">3</div>

            <div style="
                position: relative;
                z-index: 10;
                margin-top: auto;
                padding: 20px;
                display: flex;
                justify-content: center;
                gap: 15px;
                background: linear-gradient(to top, rgba(2,6,23,0.95), transparent);
            ">
                <button id="start-launch-btn" class="part-btn"
                    style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 12px 24px;">
                    🚀 Start Countdown
                </button>

                <button id="reset-btn" class="part-btn"
                    style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 12px 24px;">
                    🔄 Reset
                </button>
            </div>
        </div>
    `;

    const canvas = root.querySelector('#simCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ===== Telemetry =====

    const telAlt = root.querySelector('#tel-alt');
    const telVel = root.querySelector('#tel-vel');
    const telFuel = root.querySelector('#tel-fuel');
    const telPhase = root.querySelector('#tel-phase');

    // ===== State =====

    let altitude = 0;
    let velocity = 0;
    let fuel = rocketStats.fuel || 100;
    let launched = false;
    let particles = [];
    let rocketY = 0;

    const startBtn = root.querySelector('#start-launch-btn');
    const resetBtn = root.querySelector('#reset-btn');
    const countdownEl = root.querySelector('#countdown');

    function updateTelemetry(phase) {
        telAlt.textContent = `${Math.floor(altitude)} m`;
        telVel.textContent = `${Math.floor(velocity)} m/s`;
        telFuel.textContent = `${Math.max(0, Math.floor(fuel))}%`;
        telPhase.textContent = phase;
    }

    // ===== Countdown =====

    async function startCountdown() {
        countdownEl.style.opacity = '1';

        for (let i = 3; i >= 1; i--) {
            countdownEl.textContent = i;
            await new Promise(r => setTimeout(r, 1000));
        }

        countdownEl.textContent = '🚀';
        await new Promise(r => setTimeout(r, 800));

        countdownEl.style.opacity = '0';

        launch();
    }

    // ===== Launch =====

    function launch() {
        launched = true;
        updateTelemetry('Ignition 🔥');
        requestAnimationFrame(updateSimulation);
    }

    // ===== Physics =====

    function updateSimulation() {
        if (!launched) return;

        if (fuel > 0) {
            fuel -= 0.4;
            velocity += 0.6;
            altitude += velocity;
            rocketY += velocity * 0.3;

            if (altitude < 1000) {
                updateTelemetry('Ascending 🚀');
            } else if (altitude < 5000) {
                updateTelemetry('Upper Atmosphere 🛰️');
            } else {
                updateTelemetry('Space Flight 🌌');
            }

            createParticles();
        } else {
            velocity *= 0.98;
            altitude += velocity;

            updateTelemetry('Coasting 🛰️');

            if (velocity < 0.1) {
                launched = false;
                updateTelemetry('Orbit Achieved 🌌');
            }
        }

        renderScene();

        if (launched) {
            requestAnimationFrame(updateSimulation);
        }
    }

    // ===== Particles =====

    function createParticles() {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 20,
                y: canvas.height - 120,
                size: Math.random() * 10 + 4,
                alpha: 1,
                speed: Math.random() * 4 + 2
            });
        }
    }

    // ===== Render =====

    function renderScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky
        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);

        if (altitude < 3000) {
            sky.addColorStop(0, '#0f172a');
            sky.addColorStop(1, '#1e293b');
        } else {
            sky.addColorStop(0, '#000000');
            sky.addColorStop(1, '#0f172a');
        }

        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ground
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

        // Launch pad
        ctx.fillStyle = '#334155';
        ctx.fillRect(canvas.width / 2 - 60, canvas.height - 100, 120, 20);

        // Rocket
        const x = canvas.width / 2;
        const y = canvas.height - 150 - rocketY;

        ctx.save();
        ctx.translate(x, y);

        // Body
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-18, -50, 36, 90);

        // Nose
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, -80);
        ctx.lineTo(-18, -50);
        ctx.lineTo(18, -50);
        ctx.closePath();
        ctx.fill();

        // Window
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -20, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Fire particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.y += p.speed;
            p.alpha -= 0.03;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = '#f97316';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ===== Buttons =====

    startBtn.addEventListener('click', () => {
        if (!rocketStats.parts || !rocketStats.parts.includes('engine')) {
            alert('⚠️ Build a rocket with an engine first!');
            return;
        }

        startBtn.disabled = true;
        startCountdown();
    });

    resetBtn.addEventListener('click', () => {
        createSimulation(root, rocketStats);
    });

    updateTelemetry('Ready on Pad');
    renderScene();
}
```
