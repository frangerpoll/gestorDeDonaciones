const API_URL = "http://localhost:3000";
const contenedorONGs = document.querySelector(".cajacontenedora");
const resumen = document.getElementById("resumen");
let donaciones = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch(`${API_URL}/organizaciones`)
    .then(res => res.json())
    .then(data => mostrarONGs(data))
    .catch(err => console.error("Error al cargar las ONGs:", err));
});

function mostrarONGs(lista) {
  lista.forEach(org => {
    const card = document.createElement("div");
    card.classList.add("cajaong");
    card.innerHTML = `
      <img src="${org.logo}" alt="Logo ${org.nombre}" data-id="${org.id}">
      <p>${org.nombre}</p>
      <input type="number" id="donacion-${org.id}" min="1" max="100" placeholder="€ a donar">
    `;
    card.querySelector("img").addEventListener("click", () => {
      const cantidad = parseFloat(document.getElementById(`donacion-${org.id}`).value);
      if (!cantidad || cantidad <= 0) {
        alert("Por favor, introduce una cantidad mayor a 0€ antes de donar.");
        return;
      }
      registrarDonacion(org, cantidad);
    });
    contenedorONGs.appendChild(card);
  });
}

function registrarDonacion(organizacion, cantidad) {
  const donacionExistente = donaciones.find(d => d.idOrganizacion === organizacion.id);
  if (donacionExistente) {
    donacionExistente.importeTotal += cantidad;
    donacionExistente.numDonaciones += 1;
  } else {
    donaciones.push({
      idOrganizacion: organizacion.id,
      nombre: organizacion.nombre,
      importeTotal: cantidad,
      numDonaciones: 1
    });
  }
  actualizarResumen(organizacion.id);
}

function actualizarResumen(idResaltado) {
  resumen.innerHTML = "";
  donaciones.forEach(don => {
    const linea = document.createElement("div");
    linea.textContent = `${don.nombre}: ${don.importeTotal.toFixed(2)}€ (${don.numDonaciones} donación/es)`;
    linea.style.padding = "8px 10px";
    linea.style.borderRadius = "6px";
    linea.style.marginBottom = "5px";
    if (don.idOrganizacion === idResaltado) {
      linea.style.backgroundColor = "#F68537";
      linea.style.color = "#ECEDB0";
    } else {
      linea.style.backgroundColor = "#D6D85D";
      linea.style.color = "#F68537";
    }
    resumen.appendChild(linea);
  });
}

function finalizarTramite() {
  if (donaciones.length === 0) {
    alert("No has realizado ninguna donación.");
    return;
  }
  const tramite = {
    fecha: new Date().toLocaleDateString("es-ES", { month: "2-digit", year: "numeric" }),
    donaciones: donaciones.map(d => ({
      idOrganizacion: d.idOrganizacion,
      importeTotal: d.importeTotal,
      numDonaciones: d.numDonaciones
    }))
  };
  fetch(`${API_URL}/tramiteDonacion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tramite)
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al guardar el trámite");
      return res.json();
    })
    .then(() => {
      alert("✅ Trámite guardado correctamente en el servidor.");
      donaciones = [];
      resumen.innerHTML = "";
      document.querySelectorAll("input[type='number']").forEach(input => (input.value = ""));
    })
    .catch(err => console.error("Error:", err));
}
