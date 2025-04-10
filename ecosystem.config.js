module.exports = {
    apps: [
      {
        name: "api",
        cwd: "/home/proyectos/servergame",
        script: "npm",
        args: "run dev",
        watch: true,
      },
      {
        name: "game",
        cwd: "/home/proyectos/TraintoConquer",
        script: "npm",
        args: "run dev",
        watch: true,
      },
    ],
  };
  