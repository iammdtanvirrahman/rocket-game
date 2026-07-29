const rocketParts = [];

export function createBuilder(root) {
    root.innerHTML = `
        <h2>🔧 Rocket Builder</h2>

        <div class="part-list">
            <button class="part-btn" data-part="nose">Add Nose Cone</button>
            <button class="part-btn" data-part="body">Add Body Stage</button>
            <button class="part-btn" data-part="engine">Add Engine</button>
            <button class="part-btn" id="clear-rocket">Clear Rocket</button>
        </div>

        <div class="rocket-preview" id="rocket-preview"></div>
    `;

    const preview = root.querySelector("#rocket-preview");

    function renderRocket() {
        preview.innerHTML = "";

        rocketParts.forEach(part => {
            const div = document.createElement("div");
            div.classList.add("rocket-part", part);

            if (part === "body") div.textContent = "🛰️";
            if (part === "engine") div.textContent = "⚙️";

            preview.prepend(div);
        });
    }

    root.querySelectorAll(".part-btn[data-part]").forEach(btn => {
        btn.addEventListener("click", () => {
            rocketParts.push(btn.dataset.part);
            renderRocket();
        });
    });

    root.querySelector("#clear-rocket").addEventListener("click", () => {
        rocketParts.length = 0;
        renderRocket();
    });
}
