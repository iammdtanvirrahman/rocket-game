import { createBuilder } from './builder.js';
import { createSimulation } from './simulation.js';

const builderRoot = document.getElementById('builder-root');
const simulationRoot = document.getElementById('simulation-root');

// Load builder
createBuilder(builderRoot, (stats) => {
    createSimulation(simulationRoot, stats);
});

// Load initial simulation screen
createSimulation(simulationRoot, {
    parts: [],
    fuel: 100
});
