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

// Obtener el nombre del álbum desde la URL
const params = new URLSearchParams(window.location.search);
const nombreAlbum = params.get("nombre")?.toLowerCase() || "";

// Función para cargar el álbum
async function cargarAlbum() {
  const albumesRef = collection(db, "album");
  const snapshot = await getDocs(albumesRef);

  const contenedor = document.getElementById("album-container");
  contenedor.innerHTML = "";

  let encontrado = false;

  snapshot.forEach((docSnap) => {
    const album = docSnap.data();

    // Convertir el título a minúsculas para hacer la comparación insensible a mayúsculas/minúsculas
    const albumTitleLower = album.title?.toLowerCase() || "";
    
    if (albumTitleLower === nombreAlbum) {
      encontrado = true;

      const coverUrl = album.cover && album.cover.trim() !== "" 
                      ? album.cover 
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      // Aquí también nos aseguramos de que la descripción sea insensible al caso
      const descripcion = album.info || album.description || album.descripcion || "Sin descripción disponible.";

      const card = document.createElement("div");
      card.className = "text-center m-3";

      card.innerHTML = `
        <div class="d-flex flex-column align-items-center">
          <img 
            src="${coverUrl}" 
            alt="${album.title}" 
            class="img-fluid rounded shadow mb-3" 
            style="max-width: 300px; cursor: pointer;"
            onclick="window.location.href='/intermediate/album/album.html?nombre=${encodeURIComponent(album.title)}'"
          >
          <h2 class="fw-bold text-white">${album.title}</h2>
          <p class="text-white mt-2 text-center">${descripcion}</p>
        </div>
      `;

      contenedor.appendChild(card);
    }
  });

  if (!encontrado) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white text-center";
    noEncontrado.textContent = "Álbum no encontrado.";
    contenedor.appendChild(noEncontrado);
  }
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", cargarAlbum);
