// Importación de módulos de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase con las credenciales del proyecto
const firebaseConfig = {
  apiKey: "AIzaSyC8OziYZn9iiiIH19SfXf1tw6UOoYA1apA",
  authDomain: "try1-8c82b.firebaseapp.com",
  projectId: "try1-8c82b",
  storageBucket: "try1-8c82b.appspot.com",
  messagingSenderId: "722840528217",
  appId: "1:722840528217:web:85547781c2230e8b1d5848"
};

// Inicialización de Firebase y obtención de la referencia a la base de datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtención del parámetro 'nombre' de la URL y conversión a minúsculas
const params = new URLSearchParams(window.location.search);
const nombreBuscado = params.get("nombre")?.toLowerCase() || "";

/**
 * Función principal que muestra la información del artista
 * - Busca el artista en la colección 'artistas'
 * - Muestra su imagen, nombre, información y promedio de rating
 * - Maneja casos cuando el artista no es encontrado
 */
async function mostrarArtista() {
  try {
    // Referencia a la colección de artistas
    const artistasRef = collection(db, "artistas");
    // Consulta para obtener todos los artistas
    const q = query(artistasRef);
    const snapshot = await getDocs(q);

    const contenedor = document.getElementById("artista-container");
    contenedor.innerHTML = "";

    let encontrado = false;

    // Iteración sobre cada documento de artista
    for (const docSnap of snapshot.docs) {
      const artista = docSnap.data();

      // Comparación del nombre del artista (insensible a mayúsculas)
      if (artista.name.toLowerCase() === nombreBuscado) {
        encontrado = true;
        const artistaId = docSnap.id;
        
        // URL de la imagen del artista o imagen por defecto si no tiene
        const imageUrl = artista.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png';

        // Creación de la tarjeta del artista
        const card = document.createElement("div");
        card.className = "text-center m-3";
        card.innerHTML = `
          <img src="${imageUrl}" 
               alt="${artista.name}" 
               class="img-fluid rounded shadow" 
               style="max-width: 300px;">
          <h3 class="mt-2 fw-bold text-white">${artista.name}</h3>
          
          <!-- Contenedor para mostrar el rating promedio -->
          <div class="d-flex align-items-center justify-content-center gap-2 mb-2">
            <span class="artist-rating fs-4 text-white">Calculando...</span>
            <i class="bi bi-star-fill" style="color:gold;font-size:24px;"></i>
          </div>
          
          <p class="text-white">${artista.info || "Sin información adicional."}</p>
        `;
        contenedor.appendChild(card);

        // Cálculo del promedio del artista (sin mostrar los álbumes individualmente)
        await calcularPromedioArtista(artistaId, card);
        break;
      }
    }

    // Mensaje si no se encuentra el artista
    if (!encontrado) {
      contenedor.innerHTML = "<h3 class='text-white'>Artista no encontrado.</h3>";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("artista-container").innerHTML = "<p class='text-white'>Error al cargar el artista.</p>";
  }
}

/**
 * Calcula el promedio de rating de un artista basado en los promedios de sus álbumes
 * @param {string} artistaId - ID del artista en Firebase
 * @param {HTMLElement} card - Elemento DOM donde mostrar el resultado
 */
async function calcularPromedioArtista(artistaId, card) {
  try {
    // 1. Consulta para obtener todos los álbumes del artista
    const albumesQuery = query(
      collection(db, "album"),
      where("artistId", "==", artistaId)
    );
    const albumesSnap = await getDocs(albumesQuery);

    // Si no tiene álbumes, mostrar 0.0
    if (albumesSnap.empty) {
      card.querySelector(".artist-rating").textContent = "0.0";
      return;
    }

    let totalRating = 0;
    let albumesConRating = 0;

    // 2. Para cada álbum, calcular su promedio individual
    for (const albumDoc of albumesSnap.docs) {
      const albumId = albumDoc.id;
      const albumRating = await calcularPromedioAlbum(albumId);
      
      // Sumar solo si el álbum tiene rating
      if (albumRating !== null) {
        totalRating += albumRating;
        albumesConRating++;
      }
    }

    // 3. Calcular y mostrar el promedio final del artista
    if (albumesConRating > 0) {
      const promedioArtista = totalRating / albumesConRating;
      card.querySelector(".artist-rating").textContent = promedioArtista.toFixed(1);
    } else {
      card.querySelector(".artist-rating").textContent = "0.0";
    }
  } catch (error) {
    console.error("Error calculando promedio:", error);
    card.querySelector(".artist-rating").textContent = "Error";
  }
}

/**
 * Calcula el promedio de rating para un álbum específico
 * @param {string} albumId - ID del álbum en Firebase
 * @returns {Promise<number|null>} - Promedio del álbum o null si no hay datos
 */
async function calcularPromedioAlbum(albumId) {
  try {
    // Consulta para obtener todas las canciones del álbum
    const cancionesQuery = query(
      collection(db, "songs"),
      where("albumId", "==", albumId)
    );
    const cancionesSnap = await getDocs(cancionesQuery);

    if (cancionesSnap.empty) return null;

    let totalRating = 0;
    let cancionesConRating = 0;

    // Para cada canción, calcular su promedio individual
    for (const cancionDoc of cancionesSnap.docs) {
      const cancion = cancionDoc.data();
      const songRating = await calcularPromedioCancion(cancion.title.toLowerCase());
      
      // Sumar solo si la canción tiene rating
      if (songRating !== null) {
        totalRating += songRating;
        cancionesConRating++;
      }
    }

    // Retornar el promedio del álbum (promedio de los promedios de canciones)
    return cancionesConRating > 0 ? (totalRating / cancionesConRating) : null;
  } catch (error) {
    console.error("Error calculando promedio álbum:", error);
    return null;
  }
}

/**
 * Calcula el promedio de rating para una canción específica
 * @param {string} trackName - Nombre de la canción (en minúsculas)
 * @returns {Promise<number|null>} - Promedio de la canción o null si no hay reseñas
 */
async function calcularPromedioCancion(trackName) {
  try {
    // Consulta para obtener todas las reseñas de la canción
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("track", "==", trackName)
    );
    const reviewsSnap = await getDocs(reviewsQuery);

    if (reviewsSnap.empty) return null;

    let sumaRating = 0;
    
    // Sumar todos los ratings de las reseñas
    reviewsSnap.forEach(reviewDoc => {
      sumaRating += reviewDoc.data().rating;
    });

    // Retornar el promedio (suma de ratings / cantidad de reseñas)
    return sumaRating / reviewsSnap.size;
  } catch (error) {
    console.error("Error calculando promedio canción:", error);
    return null;
  }
}

// Evento que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", mostrarArtista);

/**
 * Función para manejar la búsqueda de canciones
 * - Redirige a intermediate.html con el término de búsqueda
 */
function buscarCancion() {
  const searchInput = document.getElementById("search-input");
  const query = searchInput.value.trim();

  if (query) {
    const currentPath = window.location.pathname;
    // Manejo de la ruta base para entornos de desarrollo/producción
    const basePath = currentPath.includes("/2025-Software-Eng-II")
      ? "/2025-Software-Eng-II"
      : "";

    // Redirección a la página intermedia con el término de búsqueda
    window.location.href = `${basePath}/intermediate/intermediate.html?nombre=${encodeURIComponent(query)}`;
  }
}

// Event listener para el formulario de búsqueda
document.getElementById("search-form").addEventListener("submit", function(e) {
  e.preventDefault(); // Evita el envío tradicional del formulario
  buscarCancion();
});