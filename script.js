const PARADAS_DIR = "paradas_json";

const paradaSelect = document.getElementById("parada");
const direccionSelect = document.getElementById("direccion");
const tablaBody = document.querySelector("#tabla tbody");
const mapsBtn = document.getElementById("mapsBtn");

let paradas = {};
let paradaActual = null;

// --- Cargar lista de paradas desde index.json ---
async function listarParadas() {
  try {
    let resp = await fetch(`${PARADAS_DIR}/index.json`);
    if (!resp.ok) throw new Error(`Error ${resp.status}: no se pudo cargar index.json`);
    let data = await resp.json();
    console.log("Contenido de index.json:", data);
    return data.paradas;
  } catch (err) {
    console.error("❌ Error al cargar index.json:", err);
    alert("No se pudo cargar la lista de paradas. Revisa index.json.");
    return [];
  }
}

// --- Cargar datos de una parada ---
async function cargarParada(nombre) {
  try {
    let resp = await fetch(`${PARADAS_DIR}/${encodeURIComponent(nombre)}.json`);
    if (!resp.ok) throw new Error(`Archivo no encontrado: ${nombre}.json`);
    let data = await resp.json();
    console.log(`✅ Cargado ${nombre}.json`, data);
    paradas[nombre] = data;
    return data;
  } catch (err) {
    console.error(`❌ Error al cargar ${nombre}.json:`, err);
    alert(`No se encontró el archivo de la parada "${nombre}". 
Revisa que exista ${PARADAS_DIR}/${nombre}.json en GitHub.`);
    return null;
  }
}

// --- Mostrar horarios en la tabla ---
async function mostrarHorarios() {
  if (!paradaActual) return;
  let direccion = direccionSelect.value;

  let data = paradas[paradaActual] || await cargarParada(paradaActual);
  if (!data) {
    tablaBody.innerHTML = `<tr><td colspan="4">❌ No hay datos para esta parada</td></tr>`;
    return;
  }

  mapsBtn.onclick = () => window.open(data.maps, "_blank");

  let salidas = [];
  if (direccion === "Todas") {
    for (let d in data.direcciones) {
      salidas.push(...data.direcciones[d]);
    }
  } else {
    salidas = data.direcciones[direccion] || [];
  }

  salidas.sort((a, b) => a.hora.localeCompare(b.hora));

  tablaBody.innerHTML = "";
  let ahora = new Date();
  salidas.forEach(s => {
    let [hh, mm, ss] = s.hora.split(":").map(Number);
    let fecha = new Date(ahora);
    if (hh >= 24) {
      fecha.setDate(fecha.getDate() + 1);
      hh -= 24;
    }
    fecha.setHours(hh, mm, ss, 0);

    let diff = (fecha - ahora) / 60000;
    let cuenta = "";
    let clase = "";
    if (diff > 0) {
      cuenta = `en ${Math.round(diff)} min`;
      clase = "green";
    } else {
      cuenta = `hace ${Math.abs(Math.round(diff))} min`;
      clase = "red";
    }

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${s.hora}</td>
      <td>${s.dias}</td>
      <td>${s.destino}</td>
      <td class="${clase}">${cuenta}</td>
    `;
    tablaBody.appendChild(tr);
  });

  if (salidas.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="4">⚠️ No hay horarios disponibles para esta dirección</td></tr>`;
  }
}

// --- Inicializar página ---
async function inicializar() {
  let lista = await listarParadas();
  paradaSelect.innerHTML = "";

  if (lista.length === 0) {
    tablaBody.innerHTML = `<tr><td colspan="4">❌ No se encontraron paradas en index.json</td></tr>`;
    return;
  }

  lista.forEach(p => {
    let opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    paradaSelect.appendChild(opt);
  });

  paradaActual = lista[0];
  console.log("Parada seleccionada por defecto:", paradaActual);
  await mostrarHorarios();
}

paradaSelect.addEventListener("change", async e => {
  paradaActual = e.target.value;
  await mostrarHorarios();
});
direccionSelect.addEventListener("change", mostrarHorarios);

inicializar();
