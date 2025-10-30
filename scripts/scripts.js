const URL_BASE = "http://localhost:3000";
let organizaciones = [];
let donaciones = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarOrganizaciones();
});

async function cargarOrganizaciones() {
    try {
        const resp = await fetch(`${URL_BASE}/organizaciones`);
        if (!resp.ok) throw new Error("Error al cargar las organizaciones");
        organizaciones = await resp.json();
        generarCajasONG(organizaciones);
    } catch (err) {
        console.error("Error al obtener organizaciones:", err);
    }
}

function generarCajasONG(lista) {
    const contenedor = document.querySelector(".cajacontenedora");
    contenedor.innerHTML = "";
    lista.forEach(org => {
        const div = document.createElement("div");
        div.classList.add("cajaong");

        const img = document.createElement("img");
        img.src = org.logo;
        img.alt = org.nombre;
        img.onclick = () => sumarDonacion(org.id);

        const p = document.createElement("p");
        p.textContent = org.nombre;

        const input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.placeholder = "Euros a donar";
        input.id = `input_${org.id}`;

        div.appendChild(img);
        div.appendChild(p);
        div.appendChild(input);
        contenedor.appendChild(div);
    });
}

function sumarDonacion(id) {
    const org = organizaciones.find(o => o.id === id);
    const input = document.getElementById(`input_${id}`);
    const cantidad = parseFloat(input.value);

    if (!org || isNaN(cantidad) || cantidad <= 0) {
        alert("Introduce una cantidad válida");
        return;
    }

    donaciones.push({ idOrganizacion: id, nombre: org.nombre, cantidad });
    actualizarResumen(org.nombre, cantidad);
}

function actualizarResumen(nombre, cantidad) {
    const resumen = document.getElementById("resumen");

    const linea = document.createElement("p");
    linea.textContent = `${nombre} — ${cantidad.toFixed(2)} €`;
    resumen.appendChild(linea);

    const todas = resumen.querySelectorAll("p");
    todas.forEach(p => p.classList.remove("activo"));
    [...todas].filter(p => p.textContent.startsWith(nombre)).forEach(p => p.classList.add("activo"));
}

document.getElementById("finalizarBtn").addEventListener("click", async() => {
    if (donaciones.length === 0) {
        alert("No hay donaciones registradas");
        return;
    }

    const fecha = new Date().toLocaleString("es-ES");
    const tramite = {
        fecha,
        donaciones: donaciones.map(d => ({
            idOrganizacion: d.idOrganizacion,
            importeTotal: d.cantidad,
            numDonaciones: 1
        }))
    };

    try {
        const resp = await fetch(`${URL_BASE}/tramiteDonacion`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tramite)
        });
        if (!resp.ok) throw new Error("Error al guardar el trámite");

        const data = await resp.json();
        document.getElementById("detalleTramite").value = JSON.stringify(data, null, 2);
        donaciones = [];
        document.getElementById("resumen").innerHTML = "";
        alert("¡Donaciones registradas correctamente!");
    } catch (err) {
        console.error("Error al guardar en JSON Server:", err);
    }
});