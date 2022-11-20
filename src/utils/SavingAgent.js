export default class SavingAgent
{
  static agent = null;

  static save({ agents, index, width, height }) {
    if (this.agent) {{
      this.agent.save({ agents, index, width, height });
    }}
  }
}