import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Obtener el parámetro de búsqueda desde la URL
const params = new URLSearchParams(window.location.search);
const nombreBuscado = params.get("nombre")?.toLowerCase() || "";

// Función para mostrar las canciones
async function mostrarCanciones() {
  const cancionesRef = collection(db, "songs"); // 🔥 Aquí cambiamos a "songs"
  const snapshot = await getDocs(cancionesRef);

  const contenedor = document.getElementById("canciones-container");
  contenedor.innerHTML = "<h2 class='text-dark'>Canciones</h2>";

  snapshot.forEach((doc) => {
    const cancion = doc.data();
    if (cancion.title?.toLowerCase().includes(nombreBuscado)) {
      const card = document.createElement("div");
      card.className = "col-md-3 text-center";

      card.innerHTML = `
        <img src="${cancion.cover}" alt="${cancion.title}" class="img-fluid rounded shadow" style="max-width: 200px; cursor: pointer;">
        <p class="mt-2 fw-bold text-dark">${cancion.title}</p>
      `;
      // Redirigir al hacer clic en la imagen
      card.querySelector("img").addEventListener("click", () => {
        window.location.href = `songs/songs.html?nombre=${encodeURIComponent(cancion.title)}`;
      });
      contenedor.appendChild(card);
    }
  });
}

// Función para mostrar los álbumes
async function mostrarAlbumes() {
  const albumesRef = collection(db, "album"); // 🔥 También corregido (no "álbumes", sino "album")
  const snapshot = await getDocs(albumesRef);

  const contenedor = document.getElementById("albumes-container");
  contenedor.innerHTML = "<h2 class='text-dark'>Álbumes</h2>";

  snapshot.forEach((doc) => {
    const album = doc.data();
    if (album.name?.toLowerCase().includes(nombreBuscado)) {
      const card = document.createElement("div");
      card.className = "col-md-3 text-center";

      card.innerHTML = `
        <img src="${album.cover}" alt="${album.name}" class="img-fluid rounded shadow" style="max-width: 200px;">
        <p class="mt-2 fw-bold text-dark">${album.name}</p>
      `;
      contenedor.appendChild(card);
    }
  });
}

// Ejecutar las funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  mostrarCanciones();
  mostrarAlbumes();
});
