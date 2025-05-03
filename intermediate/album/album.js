// Importamos los módulos necesarios de Firebase
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

// Inicializar Firebase con la configuración proporcionada
const app = initializeApp(firebaseConfig);
// Obtener una instancia de Firestore
const db = getFirestore(app);

// Obtener el nombre del álbum desde la URL, se usa para buscar el álbum específico
const params = new URLSearchParams(window.location.search);
const nombreAlbum = params.get("nombre")?.toLowerCase() || "";

// Función que carga la información del álbum desde Firestore
async function cargarAlbum() {
  // Referencia a la colección 'album' en Firestore
  const albumesRef = collection(db, "album");
  // Obtener todos los documentos de la colección
  const snapshot = await getDocs(albumesRef);

  // Referencia al contenedor donde se mostrará el álbum
  const contenedor = document.getElementById("album-container");
  contenedor.innerHTML = ""; // Limpiar el contenedor antes de agregar contenido

  let encontrado = false; // Variable para verificar si el álbum existe

  // Iterar sobre todos los documentos en la colección de álbumes
  snapshot.forEach((docSnap) => {
    const album = docSnap.data();

    // Convertir el título del álbum a minúsculas para la comparación
    const albumTitleLower = album.title?.toLowerCase() || "";
    
    // Verificar si el título del álbum coincide con el nombre pasado en la URL
    if (albumTitleLower === nombreAlbum) {
      encontrado = true; // Marcar como encontrado

      // Obtener el ID del álbum, necesario para obtener las canciones
      const albumId = docSnap.id;

      // Obtener la URL de la portada del álbum, si no tiene, usar una imagen por defecto
      const coverUrl = album.cover && album.cover.trim() !== "" 
                      ? album.cover 
                      : 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

      // Descripción del álbum
      const descripcion = album.info || album.description || album.descripcion || "Sin descripción disponible.";

      // Crear una card HTML para mostrar la información del álbum
      const card = document.createElement("div");
      card.className = "text-center m-3"; // Clase de estilo

      // Estructura HTML de la card que incluye la portada, el título, la calificación y la descripción
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
          <div id="rating-container" class="d-flex justify-content-center align-items-center gap-2 mt-3">
            <span id="album-rating" class="text-white fs-4">Calculando...</span>
            <i class="bi bi-star-fill" style="color: gold; font-size: 24px;"></i>
          </div>
          <p class="text-white mt-2 text-center">${descripcion}</p>
        </div>
      `;

      // Agregar la card al contenedor
      contenedor.appendChild(card);

      // Llamar a la función para obtener las canciones del álbum
      obtenerCancionesDelAlbum(albumId);
    }
  });

  // Si no se encuentra el álbum, mostrar un mensaje
  if (!encontrado) {
    const noEncontrado = document.createElement("h3");
    noEncontrado.className = "text-white text-center";
    noEncontrado.textContent = "Álbum no encontrado.";
    contenedor.appendChild(noEncontrado);
  }
}

// Función para obtener las canciones del álbum y calcular el promedio de calificación
async function obtenerCancionesDelAlbum(albumId) {
  // Referencia a la colección 'songs' en Firestore
  const cancionesRef = collection(db, "songs");
  // Realizar una consulta para obtener las canciones del álbum específico
  const q = query(cancionesRef, where("albumId", "==", albumId));
  
  try {
    // Obtener las canciones que coinciden con el álbum
    const cancionesSnap = await getDocs(q);
    let totalRating = 0; // Variable para acumular las calificaciones
    let totalCanciones = 0; // Variable para contar cuántas canciones tienen calificación

    // Iterar sobre todas las canciones del álbum
    for (const doc of cancionesSnap.docs) {
      const cancion = doc.data();
      const songId = doc.id;

      // Referencia a la colección 'stars' para obtener las calificaciones de cada canción
      const starsRef = collection(db, "stars");
      const starQuery = query(starsRef, where("songId", "==", songId));
      const starSnap = await getDocs(starQuery);

      // Obtener todas las calificaciones de la canción
      const ratings = starSnap.docs.map(doc => doc.data().rating);
      
      // Si la canción tiene calificaciones, calcular el promedio
      if (ratings.length > 0) {
        const sum = ratings.reduce((acc, rating) => acc + rating, 0);
        const averageRating = sum / ratings.length;
        totalRating += averageRating; // Acumular el promedio de calificación
        totalCanciones++; // Incrementar el contador de canciones calificadas
      }
    }

    // Calcular el promedio del álbum
    const promedioAlbum = totalCanciones > 0 ? totalRating / totalCanciones : 0;
    // Mostrar el promedio de calificación en la interfaz
    document.getElementById("album-rating").innerText = promedioAlbum.toFixed(1);
  } catch (error) {
    console.error("Error al calcular el promedio de calificación del álbum:", error);
    // Si ocurre un error, mostrar "Error" en lugar de la calificación
    document.getElementById("album-rating").innerText = "Error";
  }
}

// Ejecutar la función cuando se carga la página
document.addEventListener("DOMContentLoaded", cargarAlbum);
