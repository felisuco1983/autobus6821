const PARADAS_DIR = "paradas_json";

const paradaSelect = document.getElementById("parada");
const direccionSelect = document.getElementById("direccion");
const tablaBody = document.querySelector("#tabla tbody");
const mapsBtn = document.getElementById("mapsBtn");

let paradas = {};
let paradaActual = null;

async function listarParadas() {
  // 👇 IMPORTANTE: no se puede listar archivos desde JS puro en el navegador
  // Así que tendrás que generar un `index.json` con la lista de paradas disponibles
  let resp = await fetch(`${PARADAS_DIR}/index.json`);
  let data = await resp.json();
  return data.paradas;
}

async function cargarParada(nombre) {
  let resp = await fetch(`${PARADAS_DIR}/${encodeURIComponent(nombre)}.json`);
  let data = await resp.json();
  paradas[nombre] = data;
  return data;
}

async function inicializar() {
  let lista = await listarParadas();
  paradaSelect.innerHTML = "";
  lista.forEach(p => {
    let opt = document.createElement("option");
    opt.value = p;
    opt.textContent = p;
    paradaSelect.appendChild(opt);
  });
  paradaActual = lista[0];
  await mostrarHorarios();
}

async function mostrarHorarios() {
  let direccion = direccionSelect.value;
  let data = paradas[paradaActual] || await cargarParada(paradaActual);

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
}

paradaSelect.addEventListener("change", async e => {
  paradaActual = e.target.value;
  await mostrarHorarios();
});
direccionSelect.addEventListener("change", mostrarHorarios);

inicializar();
