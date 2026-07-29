export function createSimulation(root, rocketStats) {
    root.innerHTML = `
        <h2>🌌 Mission Control & Launch Pad</h2>
        <div id="sim-view" style="position: relative; width: 100%; height: calc(100% - 60px); background: #020617; border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; align-items: center; justify-content: flex-end;">
            <canvas id="simCanvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"></canvas>
            
            <div id="telemetry" style="position: absolute; top: 15px; left: 15px; z-index: 10; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(0, 255, 255, 0.2); padding: 12px 18px; border-radius: 10px; font-family: monospace; font-size: 0.9rem; line-height: 1.6; backdrop-filter: blur(8px);">
                <div>Altitude: <span id="tel-alt" style="color: #6cf0ff;">0</span> m</div>
                <div>Velocity: <span id="tel-vel" style="color: #6cf0ff;">0</span> m/s</div>
                <div>Fuel: <span id="tel-fuel" style="color: #6cf0ff;">100</span>%</div>
                <div>Phase: <span id="tel-phase" style="color: #6cf0ff;">Ready on Pad</span></div>
            </div>

            <div style="position: relative; z-index: 10; width: 100%; padding: 20px; display: flex; justify-content: center; gap: 15px; background: linear-gradient(to top, rgba(2, 6, 23, 0.95), transparent);">
                <button id="start-launch-btn" class="part-btn" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 12px 25px;">🚀 Ignite & Launch</button>
                <button id="throttle-btn" class="part-btn" style="background: linear-gradient(135deg, #d97706, #b45309); padding: 12px 25px; display: none;">🔥 Cut Engines</button>
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

    let altitude = 0;
    let velocity = 0;
    let maxFuel = rocketStats ? rocketStats.fuel || 100 : 100;
    let fuel = maxFuel;
    let thrust = rocketStats ? rocketStats.thrust || 1200 : 1200;
    let mass = rocketStats ? rocketStats.weight || 1000 : 1000;

    let isLaunched = false;
    let throttleOn = true;
    let flightPhase = 'Ready on Pad';
    let particles = [];

    const startBtn = root.querySelector('#start-launch-btn');
    const throttleBtn = root.querySelector('#throttle-btn');

    startBtn.addEventListener('click', () => {
        if (!rocketStats || rocketStats.parts.length === 0 || !rocketStats.parts.includes('engine')) {
            alert("Build a valid rocket with an engine in the hangar first!");
            return;
        }
        isLaunched = true;
        flightPhase = 'Ascending';
        startBtn.style.display = 'none';
        throttleBtn.style.display = 'inline-block';
        requestAnimationFrame(updateSimulation);
    });

    throttleBtn.addEventListener('click', () => {
        throttleOn = !throttleOn;
        throttleBtn.innerText = throttleOn ? '🔥 Cut Engines' : '⚡ Ignite Engines';
        throttleBtn.style.background = throttleOn ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #059669, #10b981)';
    });

    function updateSimulation() {
        if (!isLaunched) return;

        let effectiveThrust = (throttleOn && fuel > 0) ? thrust : 0;
        if (effectiveThrust > 0) {
            fuel -= 0.3;
            if (fuel < 0) fuel = 0;
        }

        let gravity = 1.62;
        let acceleration = (effectiveThrust / (mass / 100)) - gravity;

        velocity += acceleration * 0.05;
        altitude += velocity * 0.05;

        if (altitude < 0) {
            altitude = 0;
            if (velocity < -12) {
                flightPhase = '💥 Crashed on Landing';
            } else {
                flightPhase = '✅ Landed Safely';
            }
            isLaunched = false;
            throttleBtn.style.display = 'none';
        } else if (altitude > 8000) {
            flightPhase = '🌌 Deep Space Travel / Orbit';
        } else if (altitude > 3000) {
            flightPhase = '🛰️ Upper Atmosphere';
        }

        document.getElementById('tel-alt').innerText = Math.max(0, Math.floor(altitude));
        document.getElementById('tel-vel').innerText = Math.floor(velocity);
        document.getElementById('tel-fuel').innerText = Math.max(0, Math.floor((fuel / maxFuel) * 100));
        document.getElementById('tel-phase').innerText = flightPhase;

        renderScene();

        if (isLaunched) {
            requestAnimationFrame(updateSimulation);
        }
    }

    function renderScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (altitude < 3000) {
            grad.addColorStop(0, '#0f172a');
            grad.addColorStop(1, '#1e293b');
        } else if (altitude < 8000) {
            grad.addColorStop(0, '#020617');
            grad.addColorStop(1, '#3b82f6');
        } else {
            grad.addColorStop(0, '#000000');
            grad.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (altitude < 1500) {
            ctx.fillStyle = '#10b981';
            let groundHeight = Math.max(20, 100 - (altitude * 0.05));
            ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight);
        }

        let rx = canvas.width / 2;
        let ry = canvas.height / 2;

        ctx.save();
        ctx.translate(rx, ry);

        // Rocket render
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-20, -50, 40, 100);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(0, -20, 12, 0, Math.PI * 2);
        ctx.fill();

        // Fire and smoke particle animation
        if (throttleOn && fuel > 0 && velocity >= -5) {
            for (let i = 0; i < 4; i++) {
                particles.push({
                    x: (Math.random() - 0.5) * 30,
                    y: 50,
                    vx: (Math.random() - 0.5) * 3,
                    vy: Math.random() * 8 + 6,
                    radius: Math.random() * 8 + 4,
                    color: Math.random() > 0.4 ? '#f97316' : '#ef4444',
                    alpha: 1
                });
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.04;

            if (p.alpha <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        ctx.restore();
    }

    renderScene();
}
