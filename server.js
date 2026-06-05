import express from "express";
import { Liquid } from "liquidjs";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const engine = new Liquid();
app.engine("liquid", engine.express());
app.set("views", "./views");

app.get("/", async function (req, res) {
  const params = {};

  const quickscanResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?" +
      new URLSearchParams(params),
  );
  const quickscanResponseJSON = await quickscanResponse.json();
  const quickscanData = quickscanResponseJSON.data;

  const cityResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?fields=city&groupBy=city",
  );
  const cityResponseJSON = await cityResponse.json();
  const cityData = cityResponseJSON.data;

  res.render("index.liquid", {
    quickscans: quickscanData,
    cities: cityData,
  });
});

app.get("/quickscan", async function (req, res) {
  const params = {};

  res.render("form.liquid");
});

app.post("/quickscan-post", async function (req, res) {
  await fetch("https://fdnd-agency.directus.app/items/ctc_smartzone", {
    method: "POST",
    body: JSON.stringify({
      comment: req.body.comment,
      adress: req.body.adress,
      // picture: req.body.picture,
      city: req.body.city,
      length: req.body.length,
      // time: req.body.time,
      monitoring_suitability: req.body.monitoring_suitability,
      status: req.body.status,
      // long: req.body.long,
      // lat: req.body.lat,
      smartzone_suitability: req.body.smartzone_suitability,
      traffic_sign: req.body.traffic_sign,
    }),

    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  });

  res.redirect(303, "/");
});

app.get("/:city", async function (req, res) {
  const params = {};

  const currentPath = req.path.replace(/^\//, "");

  res.render("city.liquid", {
    currentPath: currentPath,
  });
});

app.get("/:city/:adress", async function (req, res) {
  const params = {};

  res.render("detail.liquid");
});

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function () {
  console.log(`http://localhost:${app.get("port")}`);
});
