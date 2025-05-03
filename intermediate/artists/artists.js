import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8OziYZn9iiiIH19SfXf1tw6UOoYA1apA",
  authDomain: "try1-8c82b.firebaseapp.com",
  projectId: "try1-8c82b",
  storageBucket: "try1-8c82b.appspot.com",
  messagingSenderId: "722840528217",
  appId: "1:722840528217:web:85547781c2230e8b1d5848"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener el nombre del artista desde la URL y convertirlo a minúsculas
const params = new URLSearchParams(window.location.search);
const nombreBuscado = params.get("nombre")?.toLowerCase() || "";

// Mostrar detalles del artista
async function mostrarArtista() {
  const artistasRef = collection(db, "artistas");

  // Buscar artistas que coincidan con el nombre
  const q = query(artistasRef);
  const snapshot = await getDocs(q);

  console.log("Búsqueda para el nombre:", nombreBuscado);  // Ver qué estamos buscando

  const contenedor = document.getElementById("artista-container");
  contenedor.innerHTML = "";  // Elimina cualquier contenido previo

  let encontrado = false; // Flag para verificar si se encuentra el artista

  snapshot.forEach((docSnap) => {
    const artista = docSnap.data();

    // Comparar el nombre del artista (en minúsculas) con el nombre buscado
    if (artista.name.toLowerCase() === nombreBuscado) {
      console.log("Datos del artista encontrado:", artista);  // Ver los datos que recibimos

      // Crear tarjeta para mostrar los detalles
      const card = document.createElement("div");
      card.className = "text-center m-3";

      // Si el campo image no está vacío, usarlo; si no, usar una imagen por defecto
      const imageUrl = artista.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      card.innerHTML = `
        <img src="${imageUrl}" 
             alt="${artista.name}" 
             class="img-fluid rounded shadow" 
             style="max-width: 300px;">
        <h3 class="mt-2 fw-bold text-white">${artista.name}</h3>
        <p class="text-white">${artista.info || "Sin información adicional."}</p>
      `;
      contenedor.appendChild(card);
      encontrado = true; // Se ha encontrado el artista
    }
  });//1

  // Si no se encuentra el artista
  if (!encontrado) {
    console.log("No se encontró ningún artista con ese nombre");
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white";
    noEncontrado.textContent = "Artista no encontrado.";
    contenedor.appendChild(noEncontrado);
  }
}

// Ejecutar cuando la página cargue
document.addEventListener("DOMContentLoaded", () => {
  mostrarArtista();
});
