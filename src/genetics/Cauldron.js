import Agent from "./Agent.js";
import entities from "../entities/index.js";
import {rand, normalize} from "../functions/mathFunctions.js";
import {replaceStringFromIndex} from "../functions/stringFunctions.js";
import {getRandomColor} from "../utils/colors.js";
import logger from "../utils/logger.js";
import {CROSS_OVER_POINTS, ALLELE_LENGTH} from "./config.js";

const { BezierCurve } = entities;
const { debug, loading } = logger;
/**
 * @property {array<Agent>} agents - the array of Agents
 * @property {boolean} negative - controls if the evaluation should be a negative
 * @property {PopulationConfig} populationConfig - a config object for the population
 * @property {number} crossOverChance - a chance factor for cross over
 * @property {number} mutationChance - a chance factor for mutationChance
 */
export default class Cauldron {
  /**
   * @param {PopulationConfig}[populationConfig]
   * @param {boolean}[negative]
   * @param {number}[crossOverChance]
   * @param {number}[mutationChance]
   */
  constructor(
    populationConfig,
    negative = false,
    crossOverChance = 0,
    mutationChance = 0
  ) {
    this.populationConfig = populationConfig;
    this.agents = Cauldron.generateAgentsPopulation(this.populationConfig);
    this.negative = negative;
    this.crossOverChance = crossOverChance;
    this.mutationChance = mutationChance;
  }

  /**
   * Start mixing algorithm for given number of mixes or mixing time.
   * @param {JimpImage} edgeMatrix
   * @param {[{func: Function, weight: number}]} fitnessFuncs
   * @param {int} nofMixes
   * @param {int} maxMixingTime - In milliseconds
   */
  doMixing({ edgeMatrix, fitnessFuncs, nofMixes = 1000, maxMixingTime = 0 }) {
    let fitnessFunction = this.#createFitnessFunction(fitnessFuncs);
    let counter = 0;
    if (maxMixingTime !== 0) {
      let elapsedTime = 0;
      let start = Date.now();
      while (elapsedTime < maxMixingTime) {
        ++counter;
        this.mix({ edgeMatrix, fitnessFunction });
        elapsedTime = Date.now() - start;
        loading((elapsedTime / maxMixingTime) * 100);
      }
    } else {
      for (let i = 0; i < nofMixes; i++, ++counter) {
        this.mix({ edgeMatrix, fitnessFunction });
        loading(((i + 1) / nofMixes) * 100);
      }
    }

    debug("Number of mixes: " + counter);
  }

  /**
   * @param {JimpImage}[edgeMatrix]
   * @param {BaseFitnessFunction}[fitnessFunction]
   */
  mix({ edgeMatrix, fitnessFunction }) {
    // Evaluate agents.
    this.agents.forEach((agent) => {
      agent.fitnessScore = fitnessFunction.evaluate({ agent, edgeMatrix });
    });

    this.#sortAgents();
    this.#normalizeAgents();

    // Crossover
    let usedIndexes = [];
    while (usedIndexes.length < this.agents.length) {
      let [agent1, agent1Index] = this.#drawAgent();
      usedIndexes.push(agent1Index);
      let [agent2, agent2Index] = this.#drawAgent();
      usedIndexes.push(agent2Index);

      // do crossover
      if (agent1 && agent2) {
        this.crossover(agent1, agent2);
      }
    }

    // Mutations
    for (let i = 0; i < this.agents.length; i++) {
      this.agents[i] = this.mutateByBits(this.agents[i]);
    }
  }

  /**
   * @param {Agent} agent
   */
  mutateByBits(agent) {
    let gr = agent.geneticRepresentation.split("");
    gr = gr.map((bit, index) => {
      let factor;
      if (agent.fitnessScore === 0) {
        factor = this.mutationChance;
      } else {
        factor = agent.fitnessScore * this.mutationChance
      }

      let rn = rand(1);
      let doMutation = factor >= rn;
      if (4 >= (index % (ALLELE_LENGTH - 1))) {
        if (doMutation) {
          return bit === "0" ? "1" : "0";
        }
      }

      return bit;
    });

    gr = gr.join("");
    agent.geneticRepresentation = gr;

    return agent;
  }

  /**
   * @param {Agent} agent1
   * @param {Agent} agent2
   */
  crossover(agent1, agent2) {
    let gr1 = agent1.geneticRepresentation;
    let gr2 = agent2.geneticRepresentation;

    let maxCuttingPoint = gr1.length > gr2.length ? gr1.length : gr2.length;
    let cuttingPoints = [];

    for (let i = 0; i < CROSS_OVER_POINTS; i++) {
      cuttingPoints.push(Math.floor(rand(maxCuttingPoint, 0)));
    }
    cuttingPoints.sort((a, b) => a - b);

    for (let k = 0; k < cuttingPoints.length; k++) {
      let cuttingPoint = cuttingPoints[k];
      let cut1 = gr1.slice(cuttingPoint);
      let cut2 = gr2.slice(cuttingPoint);

      gr1 = replaceStringFromIndex(gr1, cut2, cuttingPoint);
      gr2 = replaceStringFromIndex(gr2, cut1, cuttingPoint);
    }

    agent1.geneticRepresentation = gr1;
    agent2.geneticRepresentation = gr2;
  }

  /**
   * @returns {[Agent, int]}
   */
  #drawAgent() {
    let index,
      drawnAgent = null,
      agent;


    index = Number.parseInt(rand(this.agents.length - 1).toString());
    agent = this.agents[index];
    if (rand(1) <= agent.fitnessScore * this.crossOverChance) {
      drawnAgent = agent;
    }

    return [drawnAgent, index];
  }

  #normalizeAgents() {
    let min = this.agents[0].fitnessScore,
      max = this.agents[this.agents.length - 1].fitnessScore;
    this.agents.forEach((agent) => {
      agent.fitnessScore = normalize(agent.fitnessScore, max, min);
    });
  }

  #sortAgents() {
    let func = (a, b) => a.fitnessScore - b.fitnessScore;
    if (!this.negative) {
      func = (a, b) => b.fitnessScore - a.fitnessScore;
    }
    this.agents = this.agents.sort(func);
  }

  /**
   *
   * @param {JimpImage}[image]
   * @param {int}[scale]
   * @param {int|null}[color]
   * @param {boolean}[lerpColor]
   */
  spill({ image, scale = 1, color = null, lerpColor = true }) {
    let generateColor = color === null;
    this.agents.forEach((agent) => {
      if (generateColor) {
        color = getRandomColor();
      }
      image.drawBezier({
        bezierCurve: agent.getUpdatedBezierCurve(),
        color,
        lerpColor,
        scale,
      });
    });
  }

  /**
   * @param {[{func: Function, weight: number}]}[fitnessFuncs]
   * @return BaseFitnessFunction
   */
  #createFitnessFunction(fitnessFuncs) {
    let stack = null;
    fitnessFuncs.forEach((fitness) => {
      if (stack === null) {
        stack = new fitness.func(fitness.weight);
      } else {
        stack = new fitness.func(fitness.weight, stack);
      }
    });

    return stack;
  }

  /**
   * @param {array<BezierCurve>}[curves]
   * @return array<Agent>
   */
  static createAgentsFromCurves(curves) {
    let agents = [];
    curves.forEach((curve) => agents.push(new Agent(curve)));

    return agents;
  }

  /**
   * @param {PopulationConfig}[populationConfig]
   * @returns {Array<Agent>}
   */
  static generateAgentsPopulation(populationConfig) {
    let curves = [];
    for (let i = 0; i < populationConfig.size; i++) {
      curves.push(
        BezierCurve.getRandomCurve({
          xMax: populationConfig.xMax,
          yMax: populationConfig.yMax,
          nofPoints: rand(
            populationConfig.nofPointsMax,
            populationConfig.nofPointsMin
          ),
          thickness: rand(
            populationConfig.thicknessMax,
            populationConfig.thicknessMin
          ),
          bezierPoints: populationConfig.bezierPoints,
        })
      );
    }

    return this.createAgentsFromCurves(curves);
  }
}
