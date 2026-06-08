const menuButton = document.querySelector(".menu");
const menuNav = document.querySelector(".menu-nav");


menuButton.addEventListener("click", function () {
  menuNav.classList.toggle("clicked");
  menuButton.classList.toggle("clicked");
});
