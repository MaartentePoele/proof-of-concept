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

app.post("/quickscan-post", async function (req, res) {
  await fetch("https://fdnd-agency.directus.app/items/ctc_smartzone", {
    method: "POST",
    body: JSON.stringify({
      comment: req.body.comment,
      address: req.body.address,
      // picture: req.body.picture,
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

// app.post("/quickscan-delete", async function (req, res) {
//   const quicksanAddressResponse = await fetch(
//     "https://fdnd-agency.directus.app/items/ctc_smartzone?filter[address][_eq]" +
//       req.params.address,
//   );
//   const quicksanAddressjson = await quicksanAddressResponse.json();
//   const quickscanAddress = quicksanAddressjson.data[0].address;
//   const quickscanCity = quicksanAddressjson.data[0].city;

//   await fetch(
//     "https://fdnd-agency.directus.app/items/ctc_smartzone/" +
//       quickscanCity +
//       "/" +
//       quickscanAddress,
//     {
//       method: "DELETE",
//     },
//   );

//   response.redirect(303, request.header("Referer") || "/");
// });

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
