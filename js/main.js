import { createBuilder, getRocketStats } from './builder.js';
import { createSimulation } from './simulation.js';

const builderRoot = document.getElementById('builder-root');
const simulationRoot = document.getElementById('simulation-root');

function showSimulation(stats) {
    createSimulation(simulationRoot, stats);
}

// Create builder
createBuilder(builderRoot, showSimulation);

// Initial simulation screen
showSimulation(getRocketStats());
