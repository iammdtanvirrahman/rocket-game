export function createSimulation(root) {
    root.innerHTML = `
        <h2>🌌 Mission Control</h2>

        <div style="
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            gap: 20px;
            color: rgba(255,255,255,0.75);
        ">
            <div style="font-size: 72px;">🚀</div>
            <h3>Launch System Locked</h3>
            <p>
                Build a rocket in the hangar first.<br>
                Next update: <b>Launch Button + Fire Animation + Smoke Particles</b>
            </p>
        </div>
    `;
}
