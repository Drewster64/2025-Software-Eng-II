/* Versión con utilidades Bootstrap para scroll compacto */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8OziYZn9iiiIH19SfXf1tw6UOoYA1apA",
  authDomain: "try1-8c82b.firebaseapp.com",
  projectId: "try1-8c82b",
  storageBucket: "try1-8c82b.appspot.com",
  messagingSenderId: "722840528217",
  appId: "1:722840528217:web:85547781c2230e8b1d5848",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. Parámetro de la URL: nombre del álbum
const params = new URLSearchParams(window.location.search);
const nombreAlbum = params.get("nombre")?.toLowerCase() || "";

// 3. Carga de información del álbum
async function cargarAlbum() {
  const albumesRef = collection(db, "album");
  const snapshot = await getDocs(albumesRef);
  const contenedor = document.getElementById("album-container");
  contenedor.innerHTML = "";

  let albumEncontrado = false;

  snapshot.forEach((docSnap) => {
    const album = docSnap.data();
    const albumTitleLower = album.title?.toLowerCase() || "";

    if (albumTitleLower === nombreAlbum) {
      albumEncontrado = true;
      const albumId = docSnap.id;

      const coverUrl =
        album.cover?.trim() ||
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";

      const descripcion =
        album.info || album.description || "Sin descripción disponible.";

      // Tarjeta del álbum
      const card = document.createElement("div");
      card.className = "text-center m-3";
      card.innerHTML = `
        <div class="d-flex flex-column align-items-center">
          <img src="${coverUrl}" alt="${album.title}"
               class="img-fluid rounded shadow mb-3" style="max-width: 300px;">
          <h2 class="fw-bold text-white">${album.title}</h2>

          <!-- Promedio de estrellas -->
          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="album-rating fs-4 text-white">Calculando...</span>
            <i class="bi bi-star-fill" style="color:gold;font-size:24px;"></i>
          </div>

          <p class="text-white mt-2 text-center">${descripcion}</p>
        </div>
      `;
      contenedor.appendChild(card);

      // Cargar reseñas y promedio
      cargarReseñasAlbum(albumId);
      calcularPromedioAlbum(albumId, card);
    }
  });

  if (!albumEncontrado) {
    contenedor.innerHTML =
      `<h3 class="text-dark text-center">Álbum no encontrado.</h3>`;
  }
}

// 4. Carga y mostrado de reseñas por canción
async function cargarReseñasAlbum(albumId) {
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML =
    "<h3 class='text-center text-dark'>Reseñas del álbum</h3>";

  try {
    // Canciones del álbum
    const cancionesQuery = query(
      collection(db, "songs"),
      where("albumId", "==", albumId)
    );
    const cancionesSnap = await getDocs(cancionesQuery);

    if (cancionesSnap.empty) {
      reviewsContainer.innerHTML +=
        "<p class='text-center text-dark'>No hay canciones asociadas a este álbum.</p>";
      return;
    }

    // Para cada canción, obtener reseñas
    for (const doc of cancionesSnap.docs) {
      const cancion = doc.data();

      const reviewsQuery = query(
        collection(db, "reviews"),
        where("track", "==", cancion.title.toLowerCase()),
        orderBy("timestamp", "desc")
      );
      const reviewsSnap = await getDocs(reviewsQuery);

      if (!reviewsSnap.empty) {
        // Sección por canción
        const songSection = document.createElement("div");
        songSection.className = "card bg-light text-dark mt-3 p-2";

        // Cabecera con el título de la canción
        songSection.innerHTML = `
          <h4 class="card-header bg-light text-dark mb-2">${cancion.title}</h4>
          <div class="overflow-auto p-2" style="max-height: 200px;"></div>
        `;
        const cardBody = songSection.querySelector(".overflow-auto");

        // Rellenar reseñas
        reviewsSnap.forEach((reviewDoc) => {
          const review = reviewDoc.data();
          cardBody.insertAdjacentHTML(
            "beforeend",
            `
              <div class="card bg-light text-dark p-1 mb-2">
                <h6 class="mb-1">${review.name} ${"⭐".repeat(review.rating)}</h6>
                <p class="mb-1 small">${review.review}</p>
                <small class="text-muted">${new Date(
                  review.timestamp.seconds * 1000
                ).toLocaleString()}</small>
              </div>
            `
          );
        });

        reviewsContainer.appendChild(songSection);
      }
    }
  } catch (error) {
    console.error("Error al cargar las reseñas:", error);
    reviewsContainer.innerHTML +=
      "<p class='text-dark'>Error al cargar las reseñas del álbum.</p>";
  }
}

// 4-bis. Promedio de estrellas del álbum (VERSIÓN CORREGIDA)
async function calcularPromedioAlbum(albumId, card) {
  try {
    // 1. Obtener todas las canciones del álbum
    const cancionesQuery = query(
      collection(db, "songs"),
      where("albumId", "==", albumId)
    );
    const cancionesSnap = await getDocs(cancionesQuery);

    if (cancionesSnap.empty) {
      card.querySelector(".album-rating").textContent = "0.0";
      return;
    }

    let totalRating = 0;
    let cancionesConRating = 0;

    // 2. Para cada canción, calcular su promedio de reseñas
    for (const cancionDoc of cancionesSnap.docs) {
      const cancion = cancionDoc.data();
      
      // Obtener todas las reseñas de esta canción
      const reviewsQuery = query(
        collection(db, "reviews"),
        where("track", "==", cancion.title.toLowerCase())
      );
      const reviewsSnap = await getDocs(reviewsQuery);

      if (!reviewsSnap.empty) {
        // Calcular promedio de esta canción
        let sumaRating = 0;
        reviewsSnap.forEach(reviewDoc => {
          sumaRating += reviewDoc.data().rating;
        });
        
        const promedioCancion = sumaRating / reviewsSnap.size;
        totalRating += promedioCancion;
        cancionesConRating++;
      }
    }

    // 3. Calcular promedio del álbum
    if (cancionesConRating > 0) {
      const promedioAlbum = totalRating / cancionesConRating;
      card.querySelector(".album-rating").textContent = promedioAlbum.toFixed(1);
    } else {
      card.querySelector(".album-rating").textContent = "0.0";
    }
  } catch (error) {
    console.error("Error al calcular promedio del álbum:", error);
    card.querySelector(".album-rating").textContent = "Error";
  }
}

// 5. Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", cargarAlbum);

// 🔍 Redirigir a intermediate.html con la búsqueda
function buscarCancion() {
  const searchInput = document.getElementById("search-input");
  const queryTxt = searchInput.value.trim();

  if (queryTxt) {
    const currentPath = window.location.pathname;
    const basePath =
      currentPath.includes("/2025-Software-Eng-II") ? "/2025-Software-Eng-II" : "";

    window.location.href =
      `${basePath}/intermediate/intermediate.html?nombre=${encodeURIComponent(
        queryTxt
      )}`;
  }
}

document
  .getElementById("search-form")
  .addEventListener("submit", (e) => (e.preventDefault(), buscarCancion()));