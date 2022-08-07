const express = require("express");
const app = express();
const fs = require("fs");
const FILE_PATH = "stats.json";
const process = require("process");
const os = require("os-utils");

const getRoute = (req) => {
  const route = req.route ? req.route.path : ""; // check if the handler exist
  const baseUrl = req.baseUrl ? req.baseUrl : ""; // adding the base url if the handler is child of other handler

  return route ? `${baseUrl === "/" ? "" : baseUrl}${route}` : "unknown route";
};

// read json object from file
const readStats = () => {
  let result = {};
  try {
    result = JSON.parse(fs.readFileSync(FILE_PATH));
  } catch (err) {
    console.error(err);
  }
  return result;
};

// dump json object to file
const dumpStats = (stats) => {
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(stats), { flag: "w+" });
  } catch (err) {
    console.error(err);
  }
};

app.use((req, res, next) => {
  res.on("finish", () => {
    const stats = readStats();
    const event = `${req.method} ${getRoute(req)} ${res.statusCode}`;
    stats[event] = stats[event] ? stats[event] + 1 : 1;
    dumpStats(stats);
  });
  next();
});

//Default Route
app.get("/api", (req, res) => {
  console.log("platform", os.platform());
  console.log("Nos of CPUs", os.cpuCount());
  console.log("Free Memory", os.freemem());
  os.cpuUsage(function (v) {
    console.log("CPU Usage (%): " + v);
  });

  console.log("Process running for", os.processUptime());
  res.sendStatus(200).json({ msg: "Working " });
});

app.get("/stats/", (req, res) => {
  res.json(readStats());
});

//Incase of Invalid route
app.get("/*", (req, res) => {
  return res.status(401).json({ message: "Route does not exist :(" });
});

const port = 80 || process.env.PORT;

app.listen(port, () => {
  os.cpuUsage(function (v) {
    console.log("CPU Usage (%): " + v);
  });
  console.log("platform", os.platform());
  console.log("Server started at port", port);
});
