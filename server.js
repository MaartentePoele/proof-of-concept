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

app.get("/:city", async function (req, res) {
  const params = {};

  res.render("city.liquid");
});

app.get("/:city/:adress", async function (req, res) {
  const params = {};

  res.render("detail.liquid");
});

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function () {
  console.log(`http://localhost:${app.get("port")}`);
});
