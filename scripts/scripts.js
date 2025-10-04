let donaciones = {};
const PRECIOS = {
  ADDA: 1,
  IO: 2,
  AT: 3,
  MU: 4,
  CAR: 5,
  GP: 6,
  PACMA: 7,
  PAYASOS: 8,
  UNI: 9,
  JUGUETE: 10
};

function sumarDonacion(nombre) {
  if (!donaciones[nombre]) {
    donaciones[nombre] = 0;
  }

  donaciones[nombre]++;
  console.log(donaciones); // revisión en consola
}

function mostrarDonaciones() {
  let resumen = document.getElementById("resumen");
  resumen.innerHTML = "";

  let totalEuros = 0;
  let totalClicks = 0;

  for (let nombre in donaciones) {
    let veces = donaciones[nombre];
    let precio = PRECIOS[nombre];

    if (typeof precio === "number") {
      let subtotal = precio * veces;
      totalEuros += subtotal;
      totalClicks += veces;

      resumen.innerHTML += `<p>${nombre} --- ${veces} clic(s) --- ${subtotal} €</p>`;
    } else {
      resumen.innerHTML += `<p>${nombre} --- ${veces} clic(s) --- (sin precio)</p>`;
    }
  }

  resumen.innerHTML += `<hr>`;
  resumen.innerHTML += `<p><strong>Total donado:</strong> ${totalEuros} €</p>`;
  if (totalClicks > 0) {
    resumen.innerHTML += `<p><strong>Donación media:</strong> ${(totalEuros / totalClicks).toFixed(2)} €/aportación</p>`;
  }

  resumen.classList.remove("oculto");
}
