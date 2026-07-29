export function createSimulation(root, rocketStats = { parts: [], fuel: 100, thrust: 1200, weight: 1000 }) {
    root.innerHTML = `
        <h2>🌌 Mission Control & Launch Pad</h2>

        <div class="launch-screen">
            <div class="rocket-icon">🚀</div>

            <div id="telemetry" class="rocket-info" style="min-width: 260px;">
                <div>Altitude: <span id="tel-alt">0 m</span></div>
                <div>Velocity: <span id="tel-vel">0 m/s</span></div>
                <div>Fuel: <span id="tel-fuel">100%</span></div>
                <div>Phase: <span id="tel-phase">Ready on Pad</span></div>
            </div>

            <button id="start-launch-btn" class="part-btn"
                style="background: linear-gradient(135deg, #2563eb, #1d4ed8); width: 280px;">
                🚀 Ignite & Launch
            </button>
        </div>
    `;

    const startBtn = root.querySelector('#start-launch-btn');

    let altitude = 0;
    let velocity = 0;
    let fuel = rocketStats.fuel || 100;
    let launched = false;

    function updateTelemetry(phase = 'Ready on Pad') {
        root.querySelector('#tel-alt').textContent = `${Math.floor(altitude)} m`;
        root.querySelector('#tel-vel').textContent = `${Math.floor(velocity)} m/s`;
        root.querySelector('#tel-fuel').textContent = `${Math.max(0, Math.floor(fuel))}%`;
        root.querySelector('#tel-phase').textContent = phase;
    }

    function animateLaunch() {
        if (!launched) return;

        if (fuel > 0) {
            velocity += 2;
            altitude += velocity;
            fuel -= 1;
            updateTelemetry('Ascending 🚀');
            requestAnimationFrame(animateLaunch);
        } else {
            updateTelemetry('Orbit / Coasting 🛰️');
        }
    }

    startBtn.addEventListener('click', () => {
        if (!rocketStats.parts.includes('engine')) {
            alert('Build a rocket with an engine first!');
            return;
        }

        launched = true;
        startBtn.disabled = true;
        startBtn.textContent = '🚀 Launching...';
        animateLaunch();
    });

    updateTelemetry();
}
