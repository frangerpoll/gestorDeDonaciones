let donaciones = {};

const PRECIOS = {
  ADDA: 1,
  IntermonOxfam: 2,
  AmigosDeLaTierra: 3,
  ManosUnidas: 4,
  Caritas: 5,
  Greenpeace: 6,
  PACMA: 7,
  PayasosSinFronteras: 8,
  Unicef: 9,
  UnJugueteUnaIlusion: 10
};

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

  let totalEuros = 0;
  let totalClicks = 0;

  let nombresOrdenados = Object.keys(donaciones).sort().reverse();

  for (let nombre of nombresOrdenados) {
    let veces = donaciones[nombre];
    let precio = PRECIOS[nombre] || 0;

    totalEuros += precio * veces;
    totalClicks += veces;

    resumen.innerHTML += `<p>${nombre} --- ${veces} aportación/es</p>`;
  }

  resumen.innerHTML += `<hr>`;
  resumen.innerHTML += `<p><strong>Total donado:</strong> ${totalEuros} €</p>`;

  if (totalClicks > 0) {
    resumen.innerHTML += `<p><strong>Donación media:</strong> ${(totalEuros / totalClicks).toFixed(2)} €/aportación</p>`;
  }

  resumen.classList.remove("oculto");
}
