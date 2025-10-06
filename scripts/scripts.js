var NOMBRES = [
  "ADDA", "IntermonOxfam", "AmigosDeLaTierra", "ManosUnidas", "Caritas", "Greenpeace", "PACMA", "PayasosSinFronteras", "Unicef", "UnJugueteUnaIlusion"
];

var PRECIOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var donaciones = new Array(NOMBRES.length).fill(0);
var resumenVisible = false;

function sumarDonacion(nombre) {
  var resumen = document.getElementById("resumen");

  if (resumenVisible) {
    resumen.classList.add("oculto");
    resumen.innerHTML = "";
    resumenVisible = false;
    for (var i = 0; i < donaciones.length; i++) {
      donaciones[i] = 0;
    }
  }

  var indice = NOMBRES.indexOf(nombre);

  if (indice !== -1) {
    donaciones[indice]++;
  } else {
    console.warn("ONG no encontrada: " + nombre);
  }
}

function mostrarDonaciones() {
  var resumen = document.getElementById("resumen");
  resumen.innerHTML = "";
  var totalEuros = 0;
  var totalClicks = 0;
  var resumenArray = [];

  for (var i = 0; i < NOMBRES.length; i++) {
    if (donaciones[i] > 0) {
      var nombre = NOMBRES[i];
      var veces = donaciones[i];
      var precio = PRECIOS[i];
      totalEuros += precio * veces;
      totalClicks += veces;
      resumenArray.push({ nombre: nombre, veces: veces });
    }
  }

  resumenArray.sort(function(a, b) {
    return b.nombre.localeCompare(a.nombre);
  });

  for (var j = 0; j < resumenArray.length; j++) {
    resumen.innerHTML +=
      "<p>" +
      resumenArray[j].nombre +
      " --- " +
      resumenArray[j].veces +
      " aportación/es</p>";
  }

  resumen.innerHTML += "<hr>";
  resumen.innerHTML += "<p><strong> Total donado:</strong> " + totalEuros + " €</p>";

  if (totalClicks > 0) {
    resumen.innerHTML +=
      "<p><strong>Donación media:</strong> " +
      (totalEuros / totalClicks).toFixed(2) +
      " €/aportación</p>";
  }

  resumen.innerHTML +=
    '<div id="botonoculto">' +
      '<button id="botonEnviar">Enviar donaciones</button>' +
    "</div>";

  var botonEnviar = document.getElementById("botonEnviar");
  botonEnviar.addEventListener("click", enviarDonaciones);

  resumen.classList.remove("oculto");
  resumenVisible = true;
}

function enviarDonaciones() {
  var totalClicks = 0;
  for (var i = 0; i < donaciones.length; i++) {
    totalClicks += donaciones[i];
  }

  if (totalClicks === 0) {
    alert("ERROR: No has realizado ninguna donación.");
    return;
  }

  alert("Donaciones enviadas con éxito. ¡Gracias por tu aportación!");

  for (var i = 0; i < donaciones.length; i++) {
    donaciones[i] = 0;
  }

  var resumen = document.getElementById("resumen");
  resumen.innerHTML = "";
  resumen.classList.add("oculto");
  resumenVisible = false;
}