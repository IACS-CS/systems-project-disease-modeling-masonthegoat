import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, you should model a *real world disease* based on some real information about it.
*
* Options are:
* - Mononucleosis, which has an extremely long incubation period.
*
* - The flu: an ideal model for modeling vaccination. The flu evolves each season, so you can model
    a new "season" of the flu by modeling what percentage of the population gets vaccinated and how
    effective the vaccine is.
* 
* - An emerging pandemic: you can model a new disease (like COVID-19) which has a high infection rate.
*    Try to model the effects of an intervention like social distancing on the spread of the disease.
*    You can model the effects of subclinical infections (people who are infected but don't show symptoms)
*    by having a percentage of the population be asymptomatic carriers on the spread of the disease.
*
* - Malaria: a disease spread by a vector (mosquitoes). You can model the effects of the mosquito population
    (perhaps having it vary seasonally) on the spread of the disease, or attempt to model the effects of
    interventions like bed nets or insecticides.
*
* For whatever illness you choose, you should include at least one citation showing what you are simulating
* is based on real world data about a disease or a real-world intervention.
*/

/**
 * Authors: Mason Cayer
 * 
 * What we are simulating: incubation period, quartine period, immunity, quaratine groups
 * 
 * What we are attempting to model from the real world: the flu 
 * 
 * What we are leaving out of our model:
 * 
 * What elements we have to add: incubation period, quartine period, immunity, quaratine groups
 * 
 * What parameters we will allow users to "tweak" to adjust the model: incubation rounds, quartine rounds, immunity chance, quartine chance
 * 
 * In plain language, what our model does: The model simulates the spread of the flu with a 50 percent chance of getting infected when paired up with a sick person. The game lets you select the number of people starting and only one is sick (Patient 0). different emojis represent different stages of the disease. The game also has an incubation period, quartine period, immunity, and quartine groups.
 * 
 */


// Default parameters -- any properties you add here
// will be passed to your disease model when it runs.

export const defaultSimulationParameters = {
  infectionChance: 50,
  incubationPeriodRange: [1, 2], // The range for incubation period
  quarantinePeriod: 3, // Quarantine period in rounds
  immunityChance: 20, // Chance of becoming immune after infection
  quarantineChance: 30, // Chance of being quarantined if infected
}; 
  // Add any parameters you want here with their initial values
  //  -- you will also have to add inputs into your jsx file if you want
  // your user to be able to change these parameters.


/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */
export const createPopulation = (size = 1600) => {
  const population = [];
  const sideSize = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    population.push({
      id: i,
      x: (100 * (i % sideSize)) / sideSize, // X-coordinate within 100 units
      y: (100 * Math.floor(i / sideSize)) / sideSize, // Y-coordinate scaled similarly
      infected: false,
      daysInfected: 0, // Track how many rounds they've been infected
      incubationPeriod: 0, // The incubation period (random value between 1 and 2)
      quarantinePeriod: 0, // The quarantine period
      immune: false, // Whether the person is immune
      quarantined: false, // Whether the person is quarantined
      canInfect: false, // Whether the person can infect others
    });
  }
  // Infect patient zero...
  let patientZero = population[Math.floor(Math.random() * size)];
  patientZero.infected = true;
  patientZero.incubationPeriod = Math.floor(Math.random() * (defaultSimulationParameters.incubationPeriodRange[1] - defaultSimulationParameters.incubationPeriodRange[0] + 1)) + defaultSimulationParameters.incubationPeriodRange[0];
  console.log("Initial population created:", population);
  console.log("Patient zero:", patientZero);
  return population;
};



const maybeInfectPerson = (person, params) => {
  if (Math.random() * 100 < params.infectionChance) {
    if (!person.infected) {
      person.infected = true;
      person.newlyInfected = true;
    }
  }
}

export const updatePopulation = (population, params) => {
  // First, no one is newly infected any more...
  for (let p of population) {
    p.newlyInfected = false;
  }
  const shuffledPopulation = shufflePopulation(population).filter(p => !p.quarantined);
  // Now that we've shuffled, let's move through the population by two's
  for (let i = 0; i < shuffledPopulation.length - 1; i += 2) {
    let personA = shuffledPopulation[i];
    let personB = shuffledPopulation[i + 1];

    // let's have them meet at person A's spot...        
    // Check if we're at the edge...
    if (personA.x < 1) {
      personA.x += Math.ceil(Math.random() * 5)
    }
    if (personA.x > 99) {
      personA.x -= Math.ceil(Math.random() * 5)
    }
    // Now move personA over slightly to make room
    personA.x -= 1; // person A moves over...
    // personB stands next to them :-)
    personB.x = personA.x + 2; // person B moves over...
    personB.y = personA.y;
    // Keep track of partners for nudging...
    personA.partner = personB;
    personB.partner = personA;

    // Now let's see if they infect each other
    if (personA.canInfect && !personB.infected && !personB.immune) {
      maybeInfectPerson(personB, params);
    }
    if (personB.canInfect && !personA.infected && !personA.immune) {
      maybeInfectPerson(personA, params);
    }
  }

  // Update infection status and quarantine/immune status
  for (let p of population) {
    if (p.infected) {
      p.daysInfected++;
      if (p.daysInfected >= p.incubationPeriod) {
        p.canInfect = true;
      }
      if (p.daysInfected >= p.incubationPeriod + params.quarantinePeriod) {
        if (Math.random() * 100 < params.quarantineChance) {
          p.quarantined = true;
        }
      }
      if (Math.random() * 100 < params.immunityChance) {
        p.immune = true;
        p.infected = false;
        p.canInfect = false;
        p.quarantined = false;
        p.daysInfected = 0;
      }
    }
  }

  // We return the original population (order unchanged)
  return population;
};

export const trackedStats = [
  { label: "Total Infected", value: "infected" },
  { label: "New Infections", value: "newlyInfected" },
  { label: "Total Immune", value: "immune" },
  { label: "Total Quarantined", value: "quarantined" },
];

export const computeStatistics = (population, round) => {
  let infected = 0;
  let newlyInfected = 0;
  let immune = 0;
  let quarantined = 0;

  for (let p of population) {
    if (p.infected) {
      infected++;
    }
    if (p.newlyInfected) {
      newlyInfected++;
    }
    if (p.immune) {
      immune++;
    }
    if (p.quarantined) {
      quarantined++;
    }
  }

  return {
    round,
    infected,
    newlyInfected,
    immune,
    quarantined,
  };
};

const runSimulation = (rounds = 10) => {
  let population = createPopulation();
  let params = defaultSimulationParameters;

  for (let round = 1; round <= rounds; round++) {
    population = updatePopulation(population, params);
    const stats = computeStatistics(population, round);
    console.log(`Round ${round}:`, stats);
  }
};

runSimulation();


