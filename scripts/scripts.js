const URL_ORGANIZACIONES = "http://localhost:3000/organizaciones";
const URL_TRAMITES = "http://localhost:3000/tramiteDonacion";

let organizaciones = [];
let donaciones = [];
let ultimaOng = null;
let ongActiva = null;

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
    ongActiva = nombre;

    actualizarResumen();
    input.value = "";
}

function actualizarResumen() {
    const contenedor = document.getElementById("resumen");
    contenedor.innerHTML = "";

    for (let i = donaciones.length - 1; i >= 0; i--) {
        const d = donaciones[i];
        const linea = document.createElement("div");
        linea.classList.add("linea-resumen");
        linea.textContent = `${d.nombre} — ${d.cantidad.toFixed(2)} €`;

        if (d.nombre === ongActiva) {
            linea.style.backgroundColor = "#ECEDB0";
            linea.style.color = "#F68537";
        }

        contenedor.appendChild(linea);
    }

    if (contenedor.lastElementChild) {
        contenedor.scrollTop = 0;
    }
}

function finalizarTramite() {
    if (donaciones.length === 0) {
        alert("No hay donaciones registradas.");
        return;
    }

    const resumenFinal = document.getElementById("resumen-final");
    if (resumenFinal) resumenFinal.innerHTML = "";

    const fecha = new Date().toLocaleString("es-ES");
    const pFecha = document.createElement("p");
    pFecha.textContent = "Fecha del trámite: " + fecha;
    if (resumenFinal) resumenFinal.appendChild(pFecha);

    const agrupadas = agruparDonaciones();
    let total = 0;
    let cantidadDonaciones = 0;

    agrupadas.forEach(d => {
        total += d.importeTotal;
        cantidadDonaciones += d.numDonaciones;

        const linea = document.createElement("p");
        linea.textContent =
            `${d.nombre} — ${d.numDonaciones} donaciones — ${d.aporteMedio.toFixed(2)} € — ${d.importeTotal.toFixed(2)} €`;
        if (resumenFinal) resumenFinal.appendChild(linea);
    });

    const totalP = document.createElement("p");
    totalP.textContent = "Aporte total: " + total.toFixed(2) + " €";
    if (resumenFinal) resumenFinal.appendChild(totalP);

    const mediaP = document.createElement("p");
    mediaP.textContent = "Aporte medio: " + (total / cantidadDonaciones).toFixed(2) + " €/donación";
    mediaP.classList.add("resumen-centro");
    if (resumenFinal) resumenFinal.appendChild(mediaP);

    guardarTramiteEnServidor(agrupadas, fecha);
    mostrarVentanaEmergente(agrupadas);

    setTimeout(() => {
        donaciones = [];
        ultimaOng = null;
        ongActiva = null;
        const resumenCont = document.getElementById("resumen");
        if (resumenCont) resumenCont.innerHTML = "";
    }, 1000000);
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

const form = document.getElementById("formulario-donante");
const btnLimpiar = document.getElementById("btn-limpiar");
const socioRadios = document.getElementsByName("socio");
const cajaCodigo = document.getElementById("caja-codigo");

socioRadios.forEach(r => {
    r.addEventListener("change", () => {
        if (r.value === "si") {
            cajaCodigo.style.display = "block";
            document.getElementById("codigo").setAttribute("required", "true");
        } else {
            cajaCodigo.style.display = "none";
            document.getElementById("codigo").removeAttribute("required");
            document.getElementById("codigo").value = "";
        }
    });
});

btnLimpiar.addEventListener("click", () => {
    form.reset();
    cajaCodigo.style.display = "none";
    limpiarErrores();
});

form.addEventListener("submit", (e) => {
    limpiarErrores();
    let errores = [];

    const nombre = document.getElementById("nombre");
    if (nombre.value.length < 4 || nombre.value.length > 15) {
        marcarError("label-nombre");
        errores.push("El nombre debe tener entre 4 y 15 caracteres.");
    }

    const apellidos = document.getElementById("apellidos");
    if (apellidos.value.trim() === "") {
        marcarError("label-apellidos");
        errores.push("El campo Apellidos no puede estar vacío.");
    }

    const direccion = document.getElementById("direccion");
    if (direccion.value.trim() === "") {
        marcarError("label-direccion");
        errores.push("El campo Dirección es obligatorio.");
    }

    const email = document.getElementById("email");
    if (!email.checkValidity()) {
        marcarError("label-email");
        errores.push("El correo electrónico no tiene un formato válido.");
    }

    const pago = document.querySelector("input[name='metodo']:checked");
    if (!pago) {
        marcarError("label-metodo");
        errores.push("Debe seleccionar un método de pago.");
    }

    const socio = document.querySelector("input[name='socio']:checked");
    if (!socio) {
        marcarError("label-socio");
        errores.push("Debe indicar si es socio.");
    }

    if (socio && socio.value === "si") {
        const codigo = document.getElementById("codigo");
        const patron = /^[A-Za-z]{3}[0-9]{4}[\/_.#&]$/;
        if (!patron.test(codigo.value)) {
            marcarError("label-codigo");
            errores.push("El código de socio debe tener 3 letras, 4 números y un símbolo final (/_.#&).");
        }
    }

    if (errores.length > 0) {
        e.preventDefault();
        alert(errores.join("\n"));
    }
});

function marcarError(labelId) {
    const label = document.getElementById(labelId);
    const input = document.querySelector(`#${label.getAttribute("for")}`);

    if (label) label.classList.add("error-label");
    if (input) input.classList.add("error");
}

function limpiarErrores() {
    document.querySelectorAll(".error-label").forEach(l => l.classList.remove("error-label"));
    document.querySelectorAll(".error").forEach(i => i.classList.remove("error"));
}
