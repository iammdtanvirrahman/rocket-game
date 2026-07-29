```javascript
export function createSimulation(root, rocketStats = { parts: [], fuel: 100 }) {

    root.innerHTML = `
        <h2>Mission Control</h2>

        <div style="
            display:flex;
            flex-direction:column;
            align-items:center;
            justify-content:center;
            height:100%;
            gap:20px;
            text-align:center;
        ">

            <div id="rocket-display" style="
                font-size:100px;
                transition: transform 0.1s linear;
            ">🚀</div>

            <div class="rocket-info" style="min-width:260px;">
                <div>Altitude: <span id="alt">0</span> m</div>
                <div>Speed: <span id="spd">0</span> m/s</div>
                <div>Fuel: <span id="fuel">100</span>%</div>
                <div>Phase: <span id="phase">Ready</span></div>
            </div>

            <button id="launchBtn" class="part-btn">
                🚀 Launch Rocket
            </button>
        </div>
    `;

    const rocket = root.querySelector('#rocket-display');
    const altEl = root.querySelector('#alt');
    const spdEl = root.querySelector('#spd');
    const fuelEl = root.querySelector('#fuel');
    const phaseEl = root.querySelector('#phase');
    const launchBtn = root.querySelector('#launchBtn');

    let altitude = 0;
    let speed = 0;
    let fuel = 100;
    let offset = 0;

    function launchLoop() {

        if (fuel <= 0) {
            phaseEl.textContent = 'Fuel Empty';
            return;
        }

        fuel -= 1;
        speed += 2;
        altitude += speed;
        offset += 2;

        rocket.style.transform = 'translateY(-' + offset + 'px)';

        altEl.textContent = altitude;
        spdEl.textContent = speed;
        fuelEl.textContent = fuel;

        if (altitude > 2000) {
            phaseEl.textContent = 'Space Flight';
        } else {
            phaseEl.textContent = 'Ascending';
        }

        requestAnimationFrame(launchLoop);
    }

    launchBtn.addEventListener('click', function () {

        if (!rocketStats.parts || !rocketStats.parts.includes('engine')) {
            alert('Build a rocket with an engine first!');
            return;
        }

        phaseEl.textContent = 'Ignition';
        launchBtn.disabled = true;

        launchLoop();
    });
}
```
