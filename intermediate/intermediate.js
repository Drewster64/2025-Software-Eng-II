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

// Mostrar artistas
async function mostrarArtistas() {
  const artistasRef = collection(db, "artistas");
  const snapshot = await getDocs(artistasRef);

  const contenedor = document.getElementById("artistas-container");
  contenedor.innerHTML = "<h2 class='text-white'>Artistas</h2>";

  let artistasEncontrados = false;

  snapshot.forEach((doc) => {
    const artista = doc.data();
    const artistaName = artista.name?.toLowerCase() || '';

    if (artistaName.includes(nombreBuscado)) {
      artistasEncontrados = true;

      const card = document.createElement("div");
      card.className = "text-center m-3";

      const imageUrl = artista.image && artista.image.trim() !== "" 
                      ? artista.image 
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      card.innerHTML = `
        <img src="${imageUrl}" 
             alt="${artista.name}" 
             class="img-fluid rounded shadow" 
             style="max-width: 200px; cursor: pointer;">
        <h3 class="mt-2 fw-bold text-white">${artista.name}</h3>
      `;
      card.querySelector("img").addEventListener("click", () => {
        window.location.href = `artists/artists.html?nombre=${encodeURIComponent(artista.name)}`;
      });
      contenedor.appendChild(card);
    }
  });

  if (!artistasEncontrados) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white";
    noEncontrado.textContent = "No se encontraron artistas que coincidan con ese nombre.";
    contenedor.appendChild(noEncontrado);
  }
}

// Mostrar canciones
async function mostrarCanciones() {
  const cancionesRef = collection(db, "songs");
  const snapshot = await getDocs(cancionesRef);

  const contenedor = document.getElementById("canciones-container");
  contenedor.innerHTML = "<h2 class='text-white'>Canciones</h2>";

  let cancionesEncontradas = false;

  for (const docSnap of snapshot.docs) {
    const cancion = docSnap.data();
    if (cancion.title?.toLowerCase().includes(nombreBuscado)) {
      cancionesEncontradas = true;

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
      card.querySelector("img").addEventListener("click", () => {
        window.location.href = `songs/songs.html?nombre=${encodeURIComponent(cancion.title)}`;
      });
      contenedor.appendChild(card);
    }
  }

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

  let encontrado = false;

  snapshot.forEach((doc) => {
    const album = doc.data();
    const albumTitle = album.title?.toLowerCase() || '';

    if (albumTitle.includes(nombreBuscado)) {
      encontrado = true;

      const card = document.createElement("div");
      card.className = "text-center m-3";

      const coverUrl = album.cover && album.cover.trim() !== "" 
                      ? album.cover 
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      card.innerHTML = `
        <img src="${coverUrl}" 
             alt="${album.title}" 
             class="img-fluid rounded shadow" 
             style="max-width: 200px; cursor: pointer;">
        <h3 class="mt-2 fw-bold text-white">${album.title}</h3>
      `;
      card.querySelector("img").addEventListener("click", () => {
        window.location.href = `album/album.html?nombre=${encodeURIComponent(album.title)}`;
      });
      contenedor.appendChild(card);
    }
  });

  if (!encontrado) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white";
    noEncontrado.textContent = "No se encontraron álbumes que coincidan con ese título.";
    contenedor.appendChild(noEncontrado);
  }
}

// Ejecutar funciones al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarArtistas();
  mostrarCanciones();
  mostrarAlbumes();
});
// 🔍 Redirigir a intermediate.html con la búsqueda
function buscarCancion() {
    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim();

    if (query) {
        const currentPath = window.location.pathname;
        const basePath = currentPath.includes("/2025-Software-Eng-II")
            ? "/2025-Software-Eng-II"
            : "";

        // Redirige a intermediate.html en vez de songs.html
        window.location.href = `${basePath}/intermediate/intermediate.html?nombre=${encodeURIComponent(query)}`;
    }
}

// Escuchar evento del formulario de búsqueda
document.getElementById("search-form").addEventListener("submit", function(e) {
    e.preventDefault();
    buscarCancion();
});
