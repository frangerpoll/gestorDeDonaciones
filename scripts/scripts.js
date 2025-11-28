const URL_ORGANIZACIONES = "http://localhost:3000/organizaciones";
const URL_TRAMITES = "http://localhost:3000/tramiteDonacion";

let organizaciones = [];
let donaciones = [];
let ultimaOng = null;

function cargarOrganizaciones() {
    fetch(URL_ORGANIZACIONES)
        .then(r => r.json())
        .then(data => {
            organizaciones = data.organizaciones || data;
            mostrarOrganizaciones();
        });
}

function mostrarOrganizaciones() {
    const contenedor = document.getElementById("zona-ongs");
    contenedor.innerHTML = "";

    organizaciones.forEach(org => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("cajaong");

        const img = document.createElement("img");
        img.src = org.logo;
        img.alt = org.nombre;
        img.addEventListener("click", () => sumarDonacion(org.nombre));

        const texto = document.createElement("p");
        texto.textContent = org.nombre;

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.max = "100";
        input.placeholder = "€ a donar";
        input.id = "don_" + org.nombre;

        tarjeta.append(img, texto, input);
        contenedor.appendChild(tarjeta);
    });
}

function sumarDonacion(nombre) {
    const input = document.getElementById("don_" + nombre);
    const cantidad = parseFloat(input.value);

    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Introduce una cantidad válida.");
        return;
    }

    donaciones.push({ nombre, cantidad });
    ultimaOng = nombre;
    actualizarResumen();
    input.value = "";
}

function actualizarResumen() {
    const contenedor = document.getElementById("resumen");
    contenedor.innerHTML = "";

    const mapa = new Map();

    donaciones.forEach(d => {
        if (!mapa.has(d.nombre)) {
            mapa.set(d.nombre, { importeTotal: 0, numDonaciones: 0 });
        }
        const actual = mapa.get(d.nombre);
        actual.importeTotal += d.cantidad;
        actual.numDonaciones += 1;
    });

    const entradas = Array.from(mapa.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    entradas.forEach(([nombre, datos]) => {
        const linea = document.createElement("div");
        linea.classList.add("linea-resumen");
        const aporteMedio = datos.importeTotal / datos.numDonaciones;
        linea.textContent = `${nombre} — ${datos.numDonaciones} donaciones — ${aporteMedio.toFixed(2)} € — ${datos.importeTotal.toFixed(2)} €`;
        if (nombre === ultimaOng) linea.classList.add("destacado");
        contenedor.appendChild(linea);
    });
}

function finalizarTramite() {
    if (donaciones.length === 0) {
        alert("No hay donaciones registradas.");
        return;
    }

    const resumenFinal = document.getElementById("resumen-final");
    resumenFinal.innerHTML = "";

    const fecha = new Date().toLocaleString("es-ES");
    const pFecha = document.createElement("p");
    pFecha.textContent = "Fecha del trámite: " + fecha;
    resumenFinal.appendChild(pFecha);

    const agrupadas = agruparDonaciones();
    let total = 0;
    let cantidadDonaciones = 0;

    agrupadas.forEach(d => {
        total += d.importeTotal;
        cantidadDonaciones += d.numDonaciones;

        const linea = document.createElement("p");
        linea.textContent =
            `${d.nombre} — ${d.numDonaciones} donaciones — ${d.aporteMedio.toFixed(2)} € — ${d.importeTotal.toFixed(2)} €`;
        resumenFinal.appendChild(linea);
    });

    const totalP = document.createElement("p");
    totalP.textContent = "Aporte total: " + total.toFixed(2) + " €";
    resumenFinal.appendChild(totalP);

    const mediaP = document.createElement("p");
    mediaP.textContent = "Aporte medio: " + (total / cantidadDonaciones).toFixed(2) + " €/donación";
    mediaP.classList.add("resumen-centro");
    resumenFinal.appendChild(mediaP);

    guardarTramiteEnServidor(agrupadas, fecha);
    mostrarVentanaEmergente(agrupadas);

    setTimeout(() => {
        donaciones = [];
        ultimaOng = null;
        document.getElementById("resumen").innerHTML = "";
    }, 500);
}

function agruparDonaciones() {
    const resultado = [];

    const mapa = new Map();
    donaciones.forEach(d => {
        if (!mapa.has(d.nombre)) {
            mapa.set(d.nombre, { importeTotal: 0, numDonaciones: 0 });
        }
        const actual = mapa.get(d.nombre);
        actual.importeTotal += d.cantidad;
        actual.numDonaciones++;
    });

    mapa.forEach((val, key) => {
        resultado.push({
            nombre: key,
            importeTotal: val.importeTotal,
            numDonaciones: val.numDonaciones,
            aporteMedio: val.importeTotal / val.numDonaciones
        });
    });

    resultado.sort((a, b) => b.nombre.localeCompare(a.nombre));
    return resultado;
}

function guardarTramiteEnServidor(lista, fecha) {
    const tramite = {
        id: crypto.randomUUID(),
        fecha: fecha,
        donaciones: lista.map(d => ({
            nombre: d.nombre,
            importeTotal: d.importeTotal,
            numDonaciones: d.numDonaciones
        }))
    };

    fetch(URL_TRAMITES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tramite)
    });
}

function mostrarVentanaEmergente(lista) {
    const ventana = window.open("./resumen.html", "", "width=450,height=350");

    const descripciones = lista.map(d => {
        const org = organizaciones.find(o => o.nombre === d.nombre);
        return { descripcion: org ? org.descripcion : d.nombre };
    });

    ventana.onload = () => ventana.postMessage(descripciones, "*");

    setTimeout(() => ventana.close(), 10000);
}

if (window.location.pathname.endsWith("resumen.html")) {
    window.addEventListener("message", (event) => {
        const lista = event.data;
        const cont = document.getElementById("contenedor-texto");

        lista.forEach(item => {
            const p = document.createElement("p");
            p.textContent = item.descripcion;
            cont.appendChild(p);
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (!window.location.pathname.endsWith("resumen.html")) {
        cargarOrganizaciones();
        const btn = document.getElementById("btn-finalizar");
        if (btn) btn.addEventListener("click", finalizarTramite);
    }
});
