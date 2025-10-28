// Pruebas de carga json
const RUTA_JSON = "./scripts/donaciones.json";
let datosJson = null;
let organizaciones = [];
let tramites = [];

function cargarDatosDesdeJson() {

    fetch(RUTA_JSON)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Error al cargar JSON: " + response.status + " " + response.statusText);
            }
            return response.json();
        })
        .then(function(data) {
            datosJson = data;

            organizaciones = Array.isArray(data.organizaciones) ? data.organizaciones : [];
            tramites = Array.isArray(data.tramiteDonacion) ? data.tramiteDonacion : [];

            console.log("JSON cargado correctamente:", datosJson);
            console.log("Organizaciones:", organizaciones);
            console.log("Trámites:", tramites);

            const nombresDesdeJson = organizaciones.map(function(o) { return o.nombre; });
            console.log("Nombres extraídos:", nombresDesdeJson);
        })
        .catch(function(err) {
            console.error("No se pudo leer donaciones.json:", err);

        });
}

document.addEventListener("DOMContentLoaded", function() {
    cargarDatosDesdeJson();
});





const NOMBRES = [
    "ADDA", "IntermonOxfam", "AmigosDeLaTierra", "ManosUnidas", "Caritas", "Greenpeace", "PACMA", "PayasosSinFronteras", "Unicef", "UnJugueteUnaIlusion"
];

const PRECIOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

let donaciones = new Array(NOMBRES.length).fill(0);
let resumenVisible = false;

function sumarDonacion(nombre) {
    const resumen = document.getElementById("resumen");

    if (resumenVisible) {
        resumen.classList.add("oculto");
        resumen.innerHTML = "";
        resumenVisible = false;
        for (let i = 0; i < donaciones.length; i++) {
            donaciones[i] = 0;
        }
    }

    const indice = NOMBRES.indexOf(nombre);

    if (indice !== -1) {
        donaciones[indice]++;
    } else {
        console.warn("ONG no encontrada: " + nombre);
    }
}

function mostrarDonaciones() {
    const resumen = document.getElementById("resumen");
    resumen.innerHTML = "";
    let totalEuros = 0;
    let totalClicks = 0;
    const resumenArray = [];

    for (let i = 0; i < NOMBRES.length; i++) {
        if (donaciones[i] > 0) {
            const nombre = NOMBRES[i];
            const veces = donaciones[i];
            const precio = PRECIOS[i];
            totalEuros += precio * veces;
            totalClicks += veces;
            resumenArray.push({ nombre: nombre, veces: veces });
        }
    }

    resumenArray.sort(function(a, b) {
        return b.nombre.localeCompare(a.nombre);
    });

    for (let j = 0; j < resumenArray.length; j++) {
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

    resumen.classList.remove("oculto");
    resumenVisible = true;
}