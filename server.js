import express from "express";
import { Liquid } from "liquidjs";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const engine = new Liquid();
app.engine("liquid", engine.express());
app.set("views", "./views");

app.get("/", async function (req, res) {
  const params = {};

  const cityResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?fields=city&groupBy=city",
  );
  const cityResponseJSON = await cityResponse.json();
  const cityData = cityResponseJSON.data;

  const cityAmountResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?fields=city&groupBy=city&aggregate[count]=*",
  );
  const cityAmountJSON = await cityAmountResponse.json();
  const cityAmount = cityAmountJSON.data.length;

  const quickscanAmountResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?aggregate[count]=*",
  );
  const quickscanAmountJSON = await quickscanAmountResponse.json();
  const quickscanAmount = quickscanAmountJSON.data[0];

  const vrijResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?fields=status&filter[status][_eq]=vrij",
  );
  const vrijResponseJSON = await vrijResponse.json();
  const vrijPercentage =
    (vrijResponseJSON.data.length / quickscanAmount.count) * 100;

  const smartzoneGeschiktResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?fields=smartzone_suitability&filter[smartzone_suitability][_eq]=geschikt",
  );
  const smartzoneGeschiktResponseJSON = await smartzoneGeschiktResponse.json();
  const smartzoneGeschiktPercentage =
    (smartzoneGeschiktResponseJSON.data.length / quickscanAmount.count) * 100;

  res.render("index.liquid", {
    smartzoneGeschiktPercentage: smartzoneGeschiktPercentage,
    vrijPercentage: vrijPercentage,
    cityAmount: cityAmount,
    quickscanAmount: quickscanAmount,
    cities: cityData,
  });
});

app.get("/quickscan", async function (req, res) {
  const params = {};

  res.render("form.liquid");
});

app.post("/quickscan-post", upload.single("picture"), async function (req, res) {
  let pictureId = null;

  // Als er een foto is meegestuurd, voer dit dan uit
  if (req.file) {
    // Haal de data van de file/foto op uit het formulier in de HTML
    const file = req.file;

    // Maak een nieuwe FormData object om de file data te versturen in een multipart/form-data request
    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    formData.append("picture", blob, file.originalname);

    // Verstuur een POST request naar de Directus API om de file te uploaden
    const uploadResponse = await fetch(
      "https://fdnd-agency.directus.app/files",
      {
        method: "POST",
        body: formData,
      },
    );

    // Parse de JSON response van Directus
    const uploadResponseData = await uploadResponse.json();

    // Zet de geparsde JSON repsonse om in een variabele
    pictureId = uploadResponseData.data.id;
  }

  await fetch("https://fdnd-agency.directus.app/items/ctc_smartzone", {
    method: "POST",
    body: JSON.stringify({
      comment: req.body.comment,
      address: req.body.address,
      picture: pictureId,
      city: req.body.city,
      length: req.body.length,
      time: req.body.time,
      monitoring_suitability: req.body.monitoring_suitability,
      status: req.body.status,
      long: req.body.long,
      lat: req.body.lat,
      smartzone_suitability: req.body.smartzone_suitability,
      traffic_sign: req.body.traffic_sign,
    }),

    headers: {
      "Content-Type": "application/json;charset=UTF-8",
    },
  });

  res.redirect(303, "/");
});

app.post("/:city/quickscan-delete", async function (req, res) {
  const id = req.body.id;
  const city = req.params.city;

  await fetch("https://fdnd-agency.directus.app/items/ctc_smartzone/" + id, {
    method: "DELETE",
  });

  res.redirect(303, "/" + city);
});

app.get("/:city", async function (req, res) {
  const params = {
    "filter[city][_eq]": req.params.city,
  };

  const pathTitle = req.path.replace(/^\//, "");

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

  res.render("city.liquid", {
    cities: cityData,
    pathTitle: pathTitle,
    quickscans: quickscanData,
  });
});

app.get("/:city/:address", async function (req, res) {
  const params = {
    "filter[address][_eq]": req.params.address,
  };

  const quickscanDetailResponse = await fetch(
    "https://fdnd-agency.directus.app/items/ctc_smartzone?" +
      new URLSearchParams(params),
  );

  const quickscanDetailResponseJSON = await quickscanDetailResponse.json();
  const quickscanDetailData = quickscanDetailResponseJSON.data;

  res.render("detail.liquid", {
    quickscanDetails: quickscanDetailData,
  });
});

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function () {
  console.log(`http://localhost:${app.get("port")}`);
});
