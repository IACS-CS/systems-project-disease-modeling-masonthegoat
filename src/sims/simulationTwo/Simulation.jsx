import React, { useEffect, useState } from "react";
import {
  createPopulation,
  updatePopulation,
  computeStatistics,
  trackedStats,
  defaultSimulationParameters,
} from "./diseaseModel";
import { renderChart } from "../../lib/renderChart";
import { renderTable } from "../../lib/renderTable";

let boxSize = 500; // World box size in pixels
let maxSize = 1000; // Max number of icons we render (we can simulate big populations, but don't render them all...)

/**
 * Renders a subset of the population as a list of patients with emojis indicating their infection status.
 */
const renderPatients = (population) => {
  let amRenderingSubset = population.length > maxSize;
  const popSize = population.length;
  if (popSize > maxSize) {
    population = population.slice(0, maxSize);
  }

  function renderEmoji(p) {
    if (p.quarantined) {
      return "🏠"; // House for quarantined
    }
    if (p.immune) {
      return "💉"; // Syringe for immune
    }
    if (p.newlyInfected) {
      return "🤧"; // Sneezing Face for new cases
    } else if (p.infected) {
      return "🤢"; // Vomiting Face for already sick
    } else if (p.roundsInfected > 4) {
      return "🤒"; // Sick face for long-term infected
    } else {
      return "😀"; // Healthy person
    }
  }
  function renderSubsetWarning() {
    if (amRenderingSubset) {
      return (
        <div className="subset-warning">
          Only showing {maxSize} ({((maxSize * 100) / popSize).toFixed(2)}%) of{" "}
          {popSize} patients...
        </div>
      );
    }
  }

  return (
    <>
      {renderSubsetWarning()}
      {population.map((p) => (
        <div
          key={p.id}
          data-patient-id={p.id}
          data-patient-x={p.x}
          data-patient-y={p.y}
          className="patient"
          style={{
            transform: `translate(${(p.x / 100) * boxSize}px, ${
              (p.y / 100) * boxSize
            }px)`,
            color: p.infected ? "green" : "black", // Change color to green if infected
          }}
        >
          {renderEmoji(p)}
        </div>
      ))}
    </>
  );
};

const Simulation = () => {
  const [popSize, setPopSize] = useState(20);
  const [population, setPopulation] = useState(
    createPopulation(popSize * popSize)
  );
  const [diseaseData, setDiseaseData] = useState([]);
  const [lineToGraph, setLineToGraph] = useState("infected");
  const [autoMode, setAutoMode] = useState(false);
  const [simulationParameters, setSimulationParameters] = useState(
    defaultSimulationParameters
  );

    // Runs a single simulation step
    const runTurn = () => {
      let newPopulation = updatePopulation([...population], simulationParameters);
      setPopulation(newPopulation);
      let newStats = computeStatistics(newPopulation, diseaseData.length);
      setDiseaseData([...diseaseData, newStats]);
  
      // Reset newlyInfected state after each round
      newPopulation.forEach((p) => {
        p.newlyInfected = false;
      });
    };

  // Resets the simulation
  const resetSimulation = () => {
    setPopulation(createPopulation(popSize * popSize));
    setDiseaseData([]);
  };

  // Auto-run simulation effect
  useEffect(() => {
    if (autoMode) {
      setTimeout(runTurn, 500);
    }
  }, [autoMode, population]);

  return (
    <div>
      <section className="top">
        <h1>The Flu Project</h1>
        <p>
        Sure, here's a brief explanation of the key elements represented in your simulation:

1. **Infection Spread**: The simulation models the spread of the flu with a 50% chance of getting infected when paired up with a sick person. This is controlled by the `infectionChance` parameter.

2. **Incubation Period**: The simulation includes an incubation period, which is the time between exposure to the virus and the onset of symptoms. This period is randomly set between 1 and 2 rounds for each infected individual. During this period, the individual is infected but cannot infect others.

3. **Quarantine Period**: After the incubation period, there is a quarantine period where infected individuals are isolated to prevent further spread. This period is set to 3 rounds by default.

4. **Immunity**: There is a chance that an infected individual will become immune after recovering from the infection. This is controlled by the `immunityChance` parameter. Immune individuals are represented by a syringe emoji and cannot be infected again.

5. **Quarantine Groups**: Infected individuals have a chance of being quarantined, which is controlled by the `quarantineChance` parameter. Quarantined individuals are represented by a house emoji and are isolated from the rest of the population.

6. **Population Dynamics**: The simulation allows you to adjust the size of the population and observe how the disease spreads through different population sizes.

7. **Visualization**: The simulation uses emojis to represent the different states of individuals:
   - 😀: Healthy person
   - 🤧: Newly infected person
   - 🤢: Infected person
   - 💉: Immune person
   - 🏠: Quarantined person

8. **Statistics Tracking**: The simulation tracks and displays statistics such as the total number of infected, newly infected, immune, and quarantined individuals over time.

These elements together provide a comprehensive model of how the flu can spread through a population, the impact of quarantine and immunity, and how different parameters can affect the dynamics of the disease spread.
        </p>

        <p>
          Population: {population.length}. Infected:{" "}
          {population.filter((p) => p.infected).length}
        </p>

        <button onClick={runTurn}>Next Turn</button>
        <button onClick={() => setAutoMode(true)}>AutoRun</button>
        <button onClick={() => setAutoMode(false)}>Stop</button>
        <button onClick={resetSimulation}>Reset Simulation</button>

        <div>
        <label>
            Infection Chance:
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simulationParameters.infectionChance}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  infectionChance: parseFloat(e.target.value),
                })
              }
            />
            {simulationParameters.infectionChance}%
          </label>
          <label>
            Incubation Period Range:
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={simulationParameters.incubationPeriodRange[0]}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  incubationPeriodRange: [
                    parseInt(e.target.value),
                    simulationParameters.incubationPeriodRange[1],
                  ],
                })
              }
            />
            {simulationParameters.incubationPeriodRange[0]} -{" "}
            {simulationParameters.incubationPeriodRange[1]} rounds
          </label>
          <label>
            Quarantine Period:
            <input
              type="number"
              value={simulationParameters.quarantinePeriod}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  quarantinePeriod: parseInt(e.target.value),
                })
              }
            />
            {simulationParameters.quarantinePeriod} rounds
          </label>
          <label>
            Immunity Chance:
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simulationParameters.immunityChance}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  immunityChance: parseFloat(e.target.value),
                })
              }
            />
            {simulationParameters.immunityChance}%
          </label>
          <label>
            Quarantine Chance:
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={simulationParameters.quarantineChance}
              onChange={(e) =>
                setSimulationParameters({
                  ...simulationParameters,
                  quarantineChance: parseFloat(e.target.value),
                })
              }
            />
            {simulationParameters.quarantineChance}%
          </label>
        
          <label>
            Population:
            <div className="vertical-stack">
              {/* Population uses a "square" size to allow a UI that makes it easy to slide
          from a small population to a large one. */}
              <input
                type="range"
                min="3"
                max="1000"
                value={popSize}
                onChange={(e) => setPopSize(parseInt(e.target.value))}
              />
              <input
                type="number"
                value={Math.round(popSize * popSize)}
                step="10"
                onChange={(e) =>
                  setPopSize(Math.sqrt(parseInt(e.target.value)))
                }
              />
            </div>
          </label>
        </div>
      </section>

      <section className="side-by-side">
        {renderChart(diseaseData, lineToGraph, setLineToGraph, trackedStats)}

        <div className="world">
          <div
            className="population-box"
            style={{ width: boxSize, height: boxSize }}
          >
            {renderPatients(population)}
          </div>
        </div>

        {renderTable(diseaseData, trackedStats)}
      </section>
    </div>
  );
};

export default Simulation;
