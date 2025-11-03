const RUTA_JSON = "http://localhost:3000/organizaciones";
let organizaciones = [];
let donaciones = [];
let ultimaOng = null;

function cargarDatosDesdeJson() {
    fetch(RUTA_JSON)
        .then(respuesta => respuesta.json())
        .then(data => {
            organizaciones = data;
            mostrarOrganizaciones();
        })
        .catch(error => console.error("Error al cargar JSON:", error));
}

function mostrarOrganizaciones() {
    const contenedor = document.querySelector(".cajacontenedora");
    contenedor.innerHTML = "";

    for (let i = 0; i < organizaciones.length; i++) {
        const org = organizaciones[i];

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("cajaong");

        const imagen = document.createElement("img");
        imagen.src = org.logo;
        imagen.alt = org.nombre;
        imagen.onclick = function() {
            sumarDonacion(org.nombre);
        };

        const nombre = document.createElement("p");
        nombre.textContent = org.nombre;

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "100";
        input.placeholder = "€ a donar";
        input.id = `don_${org.nombre}`;

        tarjeta.appendChild(imagen);
        tarjeta.appendChild(nombre);
        tarjeta.appendChild(input);
        contenedor.appendChild(tarjeta);
    }
}

function sumarDonacion(nombre) {
    const input = document.getElementById(`don_${nombre}`);
    const cantidad = parseFloat(input.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Introduce una cantidad válida para donar.");
        return;
    }

    const nuevaDonacion = { nombre: nombre, cantidad: cantidad };
    donaciones.push(nuevaDonacion);

    mostrarDonaciones(nombre);
    input.value = "";
}

function mostrarDonaciones(nombre) {
    const resumen = document.getElementById("resumen");
    resumen.innerHTML = "";

    for (let i = 0; i < donaciones.length; i++) {
        const don = donaciones[i];
        const linea = document.createElement("div");
        linea.textContent = don.nombre + " — " + don.cantidad.toFixed(2) + " €";

        if (don.nombre === nombre) {
            linea.classList.add("destacado");
        }

        resumen.appendChild(linea);
    }

    ultimaOng = nombre;
}

function finalizarTramite() {
    if (donaciones.length === 0) {
        alert("No hay donaciones registradas.");
        return;
    }

    const resumenFinal = document.createElement("div");
    resumenFinal.id = "resumen-final";

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, "0");
    const minutos = String(fecha.getMinutes()).padStart(2, "0");

    const fechaTexto = `Fecha de compra: ${dia}/${mes}/${anio} - ${hora}:${minutos}`;
    const titulo = document.createElement("p");
    titulo.textContent = fechaTexto;
    resumenFinal.appendChild(titulo);

    const agrupadas = agruparDonaciones();
    let totalFinal = 0;
    let totalDonaciones = 0;

    for (let i = 0; i < agrupadas.length; i++) {
        const d = agrupadas[i];
        totalFinal += d.importeTotal;
        totalDonaciones += d.numDonaciones;

        const linea = document.createElement("p");
        linea.textContent = `${d.nombre} ---- ${d.numDonaciones} donaciones --- ${d.aporteMedio.toFixed(2)}€ -- ${d.importeTotal.toFixed(2)}€`;
        resumenFinal.appendChild(linea);
    }

    const totalLinea = document.createElement("p");
    totalLinea.textContent = `Aporte total: ${Math.floor(totalFinal * 100) / 100} €`;
    resumenFinal.appendChild(totalLinea);

    const mediaLinea = document.createElement("p");
    const media = totalFinal / totalDonaciones;
    mediaLinea.textContent = `Aporte medio: ${media.toFixed(3)} €/donación`;
    mediaLinea.style.textAlign = "center";
    resumenFinal.appendChild(mediaLinea);

    document.getElementById("botonoculto").appendChild(resumenFinal);

    guardarTramiteEnJson(agrupadas, `${dia}/${mes}/${anio}, ${hora}:${minutos}`);
    mostrarVentanaEmergente(agrupadas);

    setTimeout(() => {
        document.getElementById("resumen").innerHTML = "";
        document.getElementById("botonoculto").innerHTML = `
            <h3>Finaliza tu trámite de donaciones</h3>
            <button onclick="finalizarTramite()">Finalizar Donaciones</button>
        `;
        donaciones = [];
        ultimaOng = null;
    }, 10000);
}

function mostrarVentanaEmergente(donacionesAgrupadas) {
    const ancho = 500;
    const alto = 400;
    const left = (screen.width / 2) - (ancho / 2);
    const top = (screen.height / 2) - (alto / 2);

    const ventana = window.open("", "ventanaDonaciones", 
        `width=${ancho},height=${alto},left=${left},top=${top},resizable=yes`);

    let contenido = `
        <html>
        <head>
            <title>Resumen de Donaciones</title>
            <style>
                body {
                    background-color: #ECEDB0;
                    color: #F68537;
                    font-family: Verdana, sans-serif;
                    padding: 20px;
                    text-align: left;
                }
                h2 {
                    text-align: center;
                    color: #F68537;
                }
                p {
                    font-size: 14pt;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <h2>Resumen de Causas Apoyadas</h2>
    `;

    for (let i = 0; i < donacionesAgrupadas.length; i++) {
        const nombre = donacionesAgrupadas[i].nombre;
        const org = organizaciones.find(o => o.nombre === nombre);
        if (org) {
            contenido += `<p>${org.descripcion}</p>`;
        }
    }

    contenido += `
            <p style="text-align:center; margin-top:20px;">
                (Esta ventana se cerrará automáticamente en 10 segundos)
            </p>
        </body>
        </html>
    `;

    ventana.document.write(contenido);
    ventana.document.close();

    setTimeout(() => ventana.close(), 10000);
}

function guardarTramiteEnJson(donacionesAgrupadas, fechaCompleta) {
    const idTramite = Math.random().toString(16).slice(2, 6);

    const donacionesFormateadas = [];
    for (let i = 0; i < donacionesAgrupadas.length; i++) {
        const d = donacionesAgrupadas[i];
        donacionesFormateadas.push({
            nombre: d.nombre,
            importeTotal: d.importeTotal,
            numDonaciones: d.numDonaciones
        });
    }

    const nuevoTramite = {
        id: idTramite,
        fecha: fechaCompleta,
        donaciones: donacionesFormateadas
    };

    fetch("http://localhost:3000/tramiteDonacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoTramite)
    })
    .then(respuesta => respuesta.json())
    .then(data => console.log("Trámite guardado correctamente:", data))
    .catch(error => console.error("Error al guardar el trámite:", error));
}

function agruparDonaciones() {
    const resultado = [];

    for (let i = 0; i < donaciones.length; i++) {
        const actual = donaciones[i];
        let encontrada = false;

        for (let j = 0; j < resultado.length; j++) {
            if (resultado[j].nombre === actual.nombre) {
                resultado[j].importeTotal += actual.cantidad;
                resultado[j].numDonaciones += 1;
                encontrada = true;
                break;
            }
        }

        if (!encontrada) {
            resultado.push({
                nombre: actual.nombre,
                importeTotal: actual.cantidad,
                numDonaciones: 1
            });
        }
    }

    for (let i = 0; i < resultado.length; i++) {
        resultado[i].aporteMedio = resultado[i].importeTotal / resultado[i].numDonaciones;
    }

    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));

    return resultado;
}

document.addEventListener("DOMContentLoaded", function() {
    cargarDatosDesdeJson();
});
