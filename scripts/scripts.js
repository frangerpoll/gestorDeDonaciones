const RUTA_JSON = "http://localhost:3000/organizaciones";
let organizaciones = [];
let donaciones = [];
let ultimaOng = null;

function cargarDatosDesdeJson() {
    fetch(RUTA_JSON)
        .then(res => res.json())
        .then(data => {
            organizaciones = data;
            mostrarOrganizaciones();
        })
        .catch(error => console.error("Error al cargar JSON:", error));
}

function mostrarOrganizaciones() {
    const contenedor = document.querySelector(".cajacontenedora");
    contenedor.innerHTML = "";

    organizaciones.forEach(org => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("cajaong");

        const imagen = document.createElement("img");
        imagen.src = org.logo;
        imagen.alt = org.nombre;
        imagen.onclick = () => sumarDonacion(org.nombre);

        const nombre = document.createElement("p");
        nombre.textContent = org.nombre;

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "100";
        input.placeholder = "€ a donar";
        input.id = `don_${org.nombre}`;

        tarjeta.append(imagen, nombre, input);
        contenedor.appendChild(tarjeta);
    });
}

function sumarDonacion(nombre) {
    const input = document.getElementById(`don_${nombre}`);
    const cantidad = parseFloat(input.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Introduce una cantidad válida para donar.");
        return;
    }

    const nuevaDonacion = { nombre, cantidad };
    donaciones.push(nuevaDonacion);
    mostrarDonaciones(nombre);
    input.value = "";
}

function mostrarDonaciones(nombre) {
    const resumen = document.getElementById("resumen");
    resumen.innerHTML = "";

    donaciones.forEach(don => {
        const linea = document.createElement("div");
        linea.textContent = `${don.nombre} — ${don.cantidad.toFixed(2)} €`;
        linea.style.padding = "8px 0";
        if (don.nombre === nombre) linea.classList.add("destacado");
        resumen.appendChild(linea);
    });

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

    agrupadas.forEach(d => {
        totalFinal += d.importeTotal;
        totalDonaciones += d.numDonaciones;
        const linea = document.createElement("p");
        linea.textContent = `${d.nombre} ---- ${d.numDonaciones} donaciones --- ${d.aporteMedio.toFixed(2)}€ -- ${d.importeTotal.toFixed(2)}€`;
        resumenFinal.appendChild(linea);
    });

    const totalLinea = document.createElement("p");
    totalLinea.textContent = `Aporte total: ${Math.floor(totalFinal * 100) / 100} €`;
    resumenFinal.appendChild(totalLinea);

    const mediaLinea = document.createElement("p");
    const media = totalFinal / totalDonaciones;
    mediaLinea.textContent = `Aporte medio: ${media.toFixed(3)} €/donación`;
    mediaLinea.style.textAlign = "center";
    resumenFinal.appendChild(mediaLinea);

    document.getElementById("botonoculto").appendChild(resumenFinal);
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
    const ancho = 450;
    const alto = 350;
    const left = screen.width - ancho - 40;
    const top = 40;

    const ventana = window.open("", "ventanaDonaciones",
        `width=${ancho},height=${alto},left=${left},top=${top},resizable=no`);

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
            <h2>Causas Apoyadas</h2>
    `;

    donacionesAgrupadas.forEach(d => {
        const org = organizaciones.find(o => o.nombre === d.nombre);
        if (org) contenido += `<p>${org.descripcion}</p>`;
    });

    contenido += `
            <p style="text-align:left; margin-top:20px;">
                (Esta ventana se cerrará automáticamente en 10 segundos)
            </p>
        </body>
        </html>
    `;

    ventana.document.write(contenido);
    ventana.document.close();

    setTimeout(() => {
        ventana.close();
        document.getElementById("resumen-final")?.remove();
    }, 10000);
}

function agruparDonaciones() {
    const resultado = [];
    donaciones.forEach(actual => {
        const existente = resultado.find(r => r.nombre === actual.nombre);
        if (existente) {
            existente.importeTotal += actual.cantidad;
            existente.numDonaciones += 1;
        } else {
            resultado.push({
                nombre: actual.nombre,
                importeTotal: actual.cantidad,
                numDonaciones: 1
            });
        }
    });
    resultado.forEach(r => r.aporteMedio = r.importeTotal / r.numDonaciones);
    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    return resultado;
}

document.addEventListener("DOMContentLoaded", cargarDatosDesdeJson);
