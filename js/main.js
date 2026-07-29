import { createBuilder, getRocketStats } from './builder.js';
import { createSimulation } from './simulation.js';

const builderRoot = document.getElementById('builder-root');
const simulationRoot = document.getElementById('simulation-root');

createBuilder(builderRoot, (stats) => {
    createSimulation(simulationRoot, stats);
});

createSimulation(simulationRoot, getRocketStats());
