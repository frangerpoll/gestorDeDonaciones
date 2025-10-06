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

let resumenVisible = false;

function sumarDonacion(nombre) {
  const resumen = document.getElementById("resumen");
  if (resumenVisible) {
    resumen.classList.add("oculto");
    resumen.innerHTML = "";
    resumenVisible = false;
    donaciones = {};
  }

  if (!donaciones[nombre]) {
    donaciones[nombre] = 0;
  }

  donaciones[nombre]++;
}

function mostrarDonaciones() {
  const resumen = document.getElementById("resumen");
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
    resumen.innerHTML += `<p><strong>Donación media:</strong> ${(totalEuros / totalClicks).toFixed(2)} €/ aportación</p>`;
  }

  resumen.innerHTML += 
  ` <div id=botonoculto>
      <button id="botonEnviar">Enviar donaciones</button>
    </div>`;

  const botonEnviar = document.getElementById("botonEnviar");
  botonEnviar.addEventListener("click", enviarDonaciones);
  resumen.classList.remove("oculto");
  resumenVisible = true;
}

function enviarDonaciones() {
  let totalClicks = 0;
  for (let nombre in donaciones) {
    totalClicks += donaciones[nombre];
  }

  if (totalClicks === 0) {
    alert("ERROR: No has realizado ninguna donación.");
    return;
  }

  alert("Donaciones enviadas con éxito. ¡Gracias por tu aportación!");
  donaciones = {};
  const resumen = document.getElementById("resumen");
  resumen.innerHTML = "";
  resumen.classList.add("oculto");
  resumenVisible = false;
}