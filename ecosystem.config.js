module.exports = {
  apps: [
    {
      name: "api",
      cwd: "/root/game/TraintoConquer/servergame",
      script: "npm",
      args: "run dev",
      // interpreter: "bash", // Esto asegura que se corra como comando de shell
      watch: false,
    },
    {
      name: "game",
      cwd: "/root/game/TraintoConquer/TraintoConquer",
      script: "npm",
      args: "run dev",
      // interpreter: "bash",
      watch: false,
    },
  ],
};
