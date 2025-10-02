
let donaciones = {};

function sumarDonacion(nombre) {
  if (!donaciones[nombre]) {
    donaciones[nombre] = 0;
  }

  donaciones[nombre]++;

  console.log(donaciones);
}

function mostrarDonaciones() {
  let resumen = document.getElementById("resumen");

  resumen.innerHTML = "";

  for (let nombre in donaciones) {
    let veces = donaciones[nombre];
    resumen.innerHTML += `<p>${nombre} --- ${veces} clic(s)</p>`;
  }

  resumen.classList.remove("oculto");
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("mostrarDonaciones")
    .addEventListener("click", mostrarDonaciones);
});
