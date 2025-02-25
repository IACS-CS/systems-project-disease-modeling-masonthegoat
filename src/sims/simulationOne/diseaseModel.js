import { shufflePopulation } from "../../lib/shufflePopulation";

/* Update this code to simulate a simple disease model! */

/* For this simulation, let's consider a simple disease that spreads through contact.
You can implement a simple model which does one of the following:

1. Model the different effects of different numbers of contacts: in my Handshake Model, two people are in 
   contact each round. What happens if you put three people in contact? Four? Five? Consider different options
   such as always putting people in contact with the people "next" to them (i.e. the people before or after them
   in line) or randomly selecting people to be in contact (just do one of these for your model).

2. Take the "handshake" simulation code as your model, but make it so you can recover from the disease. How does the
spread of the disease change when you set people to recover after a set number of days.

3. Add a "quarantine" percentage to the handshake model: if a person is infected, they have a chance of being quarantined
and not interacting with others in each round.

*/

/**
 * Authors: Mason Cayer the one and only 
 * 
 * What we are simulating: The base of this project is infection with a 50 percent chance of getting infected when paired up with a sick person. The game lets you select the number of people starting and only one is sick (Patient 0). each round the people are paired up with one other person at random and if you are paired with a sick person you have a 50 percent chance of being infected.
 * 
 * 
 * What elements we have to add: the element i will be added is an incubation period. This will be a number of rounds that a person is infected before they can infect others. This will be a number that is randomly selected between 1 and 5.
 * 
 * In plain language, what our model does:The base of this project is infection with a 50 percent chance of getting infected when paired up with a sick person. The game lets you select the number of people starting and only one is sick (Patient 0). each round the people are paired up with one other person at random and if you are paired with a sick person you have a 50 percent chance of being infected.the element i will be added is an incubation period. This will be a number of rounds that a person is infected before they can infect others. This will be a number that is randomly selected between 1 and 5.
 * 
 * 
 */



export const defaultSimulationParameters = {
  infectionChance: 50,
  incubationPeriodRange: [1, 5] // Corrected property name
};

/* Creates your initial population. By default, we *only* track whether people
are infected. Any other attributes you want to track would have to be added
as properties on your initial individual. 

For example, if you want to track a disease which lasts for a certain number
of rounds (e.g. an incubation period or an infectious period), you would need
to add a property such as daysInfected which tracks how long they've been infected.

Similarily, if you wanted to track immunity, you would need a property that shows
whether people are susceptible or immune (i.e. succeptibility or immunity) */
/* Creates your initial population. 
   We add the `daysInfected` and `incubationPeriod` properties to each person */
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
        incubationPeriod: 0, // The incubation period (random value between 1 and 5)
      });
    }
  
    // Infect patient zero
    let patientZero = population[Math.floor(Math.random() * size)];
    patientZero.infected = true;
    patientZero.incubationPeriod = Math.floor(Math.random() * (defaultSimulationParameters.incubationPeriodRange[1] - defaultSimulationParameters.incubationPeriodRange[0] + 1)) + defaultSimulationParameters.incubationPeriodRange[0];
  
    return population;
  };
  
  // Update an individual (checking for infection and incubation)
  const updateIndividual = (person, contact, params) => {
    // If the person is infected, increment their infection timer
    if (person.infected) {
      person.daysInfected++;
      // If their infection period has passed, they can now infect others
      if (person.daysInfected >= person.incubationPeriod) {
        person.canInfect = true; // Now they can infect others
      }
    }
  
    // If the person is not yet infected but is in contact with an infected individual who has passed their incubation period
    if (contact.infected && contact.daysInfected >= contact.incubationPeriod) {
      if (Math.random() * 100 < params.infectionChance) {
        if (!person.infected) {
          person.newlyInfected = true;
        }
        person.infected = true;
        person.incubationPeriod = Math.floor(Math.random() * (params.incubationPeriodRange[1] - params.incubationPeriodRange[0] + 1)) + params.incubationPeriodRange[0];
        person.daysInfected = 0; // Reset their infection timer
      }
    }
  };
  
  // Update the population (pairing random individuals and updating each round)
  export const updatePopulation = (population, params) => {
    // This logic pairs people with the next person in line
    for (let i = 0; i < population.length; i++) {
      let p = population[i];
      let contact = population[(i + 1) % population.length];
      updateIndividual(p, contact, params);
    }
    return population;
  };
  
  // Compute simulation statistics (including tracking people who can infect others)
  export const computeStatistics = (population, round) => {
    let infected = 0;
    let newlyInfected = 0;
    let canInfect = 0; // Count people who can infect others
  
    for (let p of population) {
      if (p.infected) {
        infected += 1;
        if (p.daysInfected >= p.incubationPeriod) {
          canInfect += 1; // Only those who have passed their incubation period can infect
        }
      }
      if (p.newlyInfected) {
        newlyInfected += 1;
      }
    }
  
    const stats = { round, infected, newlyInfected, canInfect };
    console.log("Statistics computed:", stats);
    return stats;
  
  };
// Main simulation loop
const runSimulation = (rounds = 10) => {
  let population = createPopulation();
  let params = defaultSimulationParameters;

  for (let round = 1; round <= rounds; round++) {
    population = updatePopulation(population, params);
    const stats = computeStatistics(population, round);
    console.log(`Round ${round}:`, stats);
  }
};

// Run the simulation for 10 rounds
runSimulation();