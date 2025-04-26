import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Obtener parámetro de búsqueda de la URL
const params = new URLSearchParams(window.location.search);
const nombreBuscado = params.get("nombre")?.toLowerCase() || "";

// Función para obtener el cover del álbum
async function obtenerCoverAlbum(albumId) {
  const albumRef = doc(db, "album", albumId);
  const albumSnap = await getDoc(albumRef);
  if (albumSnap.exists()) {
    return albumSnap.data().cover || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';
  }
  return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';
}

// Mostrar canciones
async function mostrarCanciones() {
  const cancionesRef = collection(db, "songs");
  const snapshot = await getDocs(cancionesRef);

  const contenedor = document.getElementById("canciones-container");
  contenedor.innerHTML = "<h2 class='text-white'>Canciones</h2>";

  let cancionesEncontradas = false; // Variable para verificar si se encontraron canciones

  // Iterar sobre todas las canciones
  for (const docSnap of snapshot.docs) {
    const cancion = docSnap.data();
    if (cancion.title?.toLowerCase().includes(nombreBuscado)) {
      cancionesEncontradas = true; // Se encontró al menos una canción que coincide

      // Obtener el cover del álbum relacionado
      const coverUrl = await obtenerCoverAlbum(cancion.albumId);

      const card = document.createElement("div");
      card.className = "text-center m-3";
      card.innerHTML = `
        <img src="${coverUrl}" 
             alt="${cancion.title}" 
             class="img-fluid rounded shadow" 
             style="max-width: 200px; cursor: pointer;">
        <h3 class="mt-2 fw-bold text-white">${cancion.title}</h3>
      `;
      // Al hacer click en el cover, redirige a songs.html
      card.querySelector("img").addEventListener("click", () => {
        window.location.href = `songs/songs.html?nombre=${encodeURIComponent(cancion.title)}`;
      });
      contenedor.appendChild(card);
    }
  }

  // Si no se encontraron canciones que coincidan
  if (!cancionesEncontradas) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white";
    noEncontrado.textContent = "No se encontraron canciones que coincidan con ese título.";
    contenedor.appendChild(noEncontrado);
  }
}

// Mostrar álbumes
async function mostrarAlbumes() {
  const albumesRef = collection(db, "album");
  const snapshot = await getDocs(albumesRef);

  const contenedor = document.getElementById("albumes-container");
  contenedor.innerHTML = "<h2 class='text-white'>Álbumes</h2>";

  let encontrado = false; // Variable para verificar si se encontraron álbumes

  snapshot.forEach((doc) => {
    const album = doc.data();
    if (album.name?.toLowerCase().includes(nombreBuscado)) {
      encontrado = true; // Se encontró al menos un álbum
      const card = document.createElement("div");
      card.className = "text-center m-3";

      // Verificar si el cover está disponible, de lo contrario asignar la imagen predeterminada
      const coverUrl = album.cover && album.cover.trim() !== "" 
                      ? album.cover 
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      card.innerHTML = `
        <img src="${coverUrl}" 
             alt="${album.name}" 
             class="img-fluid rounded shadow" 
             style="max-width: 200px;">
        <h3 class="mt-2 fw-bold text-white">${album.name}</h3>
      `;
      contenedor.appendChild(card);
    }
  });

  // Si no se encontró ningún álbum que coincida con la búsqueda
  if (!encontrado) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white";
    noEncontrado.textContent = "No se encontraron álbumes que coincidan con ese título.";
    contenedor.appendChild(noEncontrado);
  }
}

// Ejecutar funciones al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarCanciones();
  mostrarAlbumes();
});
