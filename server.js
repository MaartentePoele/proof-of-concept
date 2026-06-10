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

const baseURL = "https://fdnd-agency.directus.app/items/ctc_smartzone";

app.get("/", async function (req, res) {
  const cityResponse = await fetch(baseURL + "?fields=city&groupBy=city");
  const cityResponseJSON = await cityResponse.json();
  const cityData = cityResponseJSON.data;

  const cityAmountResponse = await fetch(
    baseURL + "?fields=city&groupBy=city&aggregate[count]=*",
  );
  const cityAmountJSON = await cityAmountResponse.json();
  const cityAmount = cityAmountJSON.data.length;

  const quickscanAmountResponse = await fetch(baseURL + "?aggregate[count]=*");
  const quickscanAmountJSON = await quickscanAmountResponse.json();
  const quickscanAmount = quickscanAmountJSON.data[0];

  const overtredingResponse = await fetch(
    baseURL + "?fields=status&filter[status][_eq]=overtreding",
  );
  const overtredingResponseJSON = await overtredingResponse.json();
  const overtredingPercentage =
    (overtredingResponseJSON.data.length / quickscanAmount.count) * 100;

  const smartzoneGeschiktResponse = await fetch(
    baseURL +
      "?fields=smartzone_suitability&filter[smartzone_suitability][_eq]=geschikt",
  );
  const smartzoneGeschiktResponseJSON = await smartzoneGeschiktResponse.json();
  const smartzoneGeschiktPercentage =
    (smartzoneGeschiktResponseJSON.data.length / quickscanAmount.count) * 100;

  res.render("index.liquid", {
    smartzoneGeschiktPercentage: smartzoneGeschiktPercentage,
    overtredingPercentage: overtredingPercentage,
    cityAmount: cityAmount,
    quickscanAmount: quickscanAmount,
    cities: cityData,
  });
});

app.get("/quickscan", async function (req, res) {
  const cityResponse = await fetch(baseURL + "?fields=city&groupBy=city");
  const cityResponseJSON = await cityResponse.json();
  const cityData = cityResponseJSON.data;

  res.render("form.liquid", {
    cities: cityData,
  });
});

app.post(
  "/quickscan-post",
  upload.single("picture"),
  async function (req, res) {
    // om foto te uploaden
    let pictureId = null;

    if (req.file) {
      const file = req.file;
      const formData = new FormData();
      const blob = new Blob([file.buffer], { type: file.mimetype });
      formData.append("picture", blob, file.originalname);
      const uploadResponse = await fetch(
        "https://fdnd-agency.directus.app/files",
        {
          method: "POST",
          body: formData,
        },
      );

      const uploadResponseData = await uploadResponse.json();
      pictureId = uploadResponseData.data.id;
    }

    await fetch(baseURL, {
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
  },
);

app.get("/:city/:address", async function (req, res) {
  const params = {
    "filter[address][_eq]": req.params.address,
  };

  const quickscanDetailResponse = await fetch(
    baseURL + "?" + new URLSearchParams(params),
  );

  const quickscanDetailResponseJSON = await quickscanDetailResponse.json();
  const quickscanDetailData = quickscanDetailResponseJSON.data;

  const cityResponse = await fetch(baseURL + "?fields=city&groupBy=city");
  const cityResponseJSON = await cityResponse.json();
  const cityData = cityResponseJSON.data;

  res.render("detail.liquid", {
    quickscanDetails: quickscanDetailData,
    cities: cityData,
  });
});

app.post("/:city/quickscan-delete", async function (req, res) {
  const id = req.body.id;
  const city = req.params.city;

  await fetch(baseURL + "/" + id, {
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
    baseURL + "?" + new URLSearchParams(params),
  );
  const quickscanResponseJSON = await quickscanResponse.json();
  const quickscanData = quickscanResponseJSON.data;

  const quickscanAmountResponse = await fetch(
    baseURL + "?" + new URLSearchParams(params) + "&aggregate[count]=*",
  );
  const quickscanAmountJSON = await quickscanAmountResponse.json();
  const quickscanAmount = quickscanAmountJSON.data[0];

  const cityResponse = await fetch(baseURL + "?fields=city&groupBy=city");
  const cityResponseJSON = await cityResponse.json();
  const cityData = cityResponseJSON.data;

  const overtredingResponse = await fetch(
    baseURL +
      "?" +
      new URLSearchParams(params) +
      "&fields=status&filter[status][_eq]=overtreding",
  );
  const overtredingResponseJSON = await overtredingResponse.json();
  const overtredingPercentage =
    (overtredingResponseJSON.data.length / quickscanAmount.count) * 100;

  const smartzoneGeschiktResponse = await fetch(
    baseURL +
      "?" +
      new URLSearchParams(params) +
      "&fields=smartzone_suitability&filter[smartzone_suitability][_eq]=geschikt",
  );
  const smartzoneGeschiktResponseJSON = await smartzoneGeschiktResponse.json();
  const smartzoneGeschiktPercentage =
    (smartzoneGeschiktResponseJSON.data.length / quickscanAmount.count) * 100;

  const lengthResponse = await fetch(
    baseURL + "?" + new URLSearchParams(params) + "&fields=length",
  );
  const lengthResponseJSON = await lengthResponse.json();

  let totalLength = 0;
  let itemAmount = 0;
  lengthResponseJSON.data.forEach(function (item) {
    totalLength = totalLength + item.length;
    itemAmount = itemAmount + 1;
  });
  const averageLength = totalLength / itemAmount / 100;

  res.render("city.liquid", {
    averageLength: averageLength,
    smartzoneGeschiktPercentage: smartzoneGeschiktPercentage,
    overtredingPercentage: overtredingPercentage,
    quickscanAmount: quickscanAmount,
    pathTitle: pathTitle,
    quickscans: quickscanData,
    cities: cityData,
  });
});

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function () {
  console.log(`http://localhost:${app.get("port")}`);
});
