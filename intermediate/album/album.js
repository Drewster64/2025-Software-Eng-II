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

    const albumTitleLower = album.title?.toLowerCase() || "";
    
    if (albumTitleLower === nombreAlbum) {
      encontrado = true;

      const albumId = docSnap.id;  // Obtener ID del documento (necesario para las canciones)

      const coverUrl = album.cover && album.cover.trim() !== "" 
                      ? album.cover 
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      const descripcion = album.info || album.description || album.descripcion || "Sin descripción disponible.";

      // Crear la card del álbum
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
          <div id="rating-container" class="d-flex justify-content-center align-items-center gap-2 mt-3">
            <span id="album-rating" class="text-white fs-5">Calculando...</span>
            <i class="bi bi-star-fill" style="color: gold;"></i>
          </div>
        </div>
      `;

      contenedor.appendChild(card);

      // Obtener las canciones del álbum
      obtenerCancionesDelAlbum(albumId);
    }
  });

  if (!encontrado) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white text-center";
    noEncontrado.textContent = "Álbum no encontrado.";
    contenedor.appendChild(noEncontrado);
  }
}

// Función para obtener las canciones del álbum y calcular el promedio de calificación
async function obtenerCancionesDelAlbum(albumId) {
  const cancionesRef = collection(db, "songs");
  const q = query(cancionesRef, where("albumId", "==", albumId));
  
  try {
    const cancionesSnap = await getDocs(q);
    let totalRating = 0;
    let totalCanciones = 0;

    for (const doc of cancionesSnap.docs) {
      const cancion = doc.data();
      const songId = doc.id;

      const starsRef = collection(db, "stars");
      const starQuery = query(starsRef, where("songId", "==", songId));
      const starSnap = await getDocs(starQuery);

      const ratings = starSnap.docs.map(doc => doc.data().rating);
      
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        const averageRating = sum / ratings.length;
        totalRating += averageRating;
        totalCanciones++;
      }
    }

    const promedioAlbum = totalCanciones > 0 ? totalRating / totalCanciones : 0;
    document.getElementById("album-rating").innerText = promedioAlbum.toFixed(1);
  } catch (error) {
    console.error("Error al calcular el promedio de calificación del álbum:", error);
    document.getElementById("album-rating").innerText = "Error";
  }
}

// Ejecutar al cargar
document.addEventListener("DOMContentLoaded", cargarAlbum);
