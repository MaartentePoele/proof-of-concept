const menuButton = document.querySelector(".menu");
const menuNav = document.querySelector(".menu-nav");

menuButton.addEventListener("click", function () {
  menuNav.classList.toggle("clicked");
  menuButton.classList.toggle("clicked");
});

const submitButton = document.querySelector(".submit-button");
const quickscanForm = document.querySelector(".quickscan-form");

quickscanForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  submitButton.classList.add("loading");
  submitButton.textContent = "loading...";

  let formData = new FormData(quickscanForm);

  await fetch(quickscanForm.action, {
    method: quickscanForm.method,
    body: new URLSearchParams(formData),
  });

  submitButton.classList.remove("loading");
  submitButton.classList.add("success");
  submitButton.textContent = "Added!";

  setTimeout(() => {
    submitButton.classList.remove("success");
    submitButton.textContent = "Submit";
  }, 3000);
});
