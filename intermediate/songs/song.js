import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, query, where, getDocs, addDoc, setDoc, updateDoc, orderBy, increment, arrayRemove, arrayUnion, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Obtener el nombre de la canción desde la URL y convertirlo a minúsculas
const urlParams = new URLSearchParams(window.location.search);
const nombreCancion = urlParams.get("nombre")?.toLowerCase();
console.log("nombreCancion obtenido:", nombreCancion);

// Variables globales
let songId = "";
let userId = "currentUser";

// Función para mostrar mensajes de error
function mostrarError(mensaje) {
  document.getElementById("titulo-cancion").innerHTML = mensaje;
  document.getElementById("cover-cancion").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
}

// Función para obtener el cover de la canción
async function obtenerCoverCancion(cancion) {
  // 1. Intentar con el cover directo de la canción
  if (cancion.cover && cancion.cover.trim() !== "") {
    console.log("Usando cover directo de la canción:", cancion.cover);
    return cancion.cover;
  }

  // 2. Intentar con el álbum
  if (cancion.albumId) {
    try {
      console.log("Buscando cover en álbum con ID:", cancion.albumId);
      const albumRef = doc(db, "album", cancion.albumId.trim());
      const albumSnap = await getDoc(albumRef);
      
      if (albumSnap.exists()) {
        const albumData = albumSnap.data();
        if (albumData.cover && albumData.cover.trim() !== "") {
          console.log("Usando cover del álbum:", albumData.cover);
          return albumData.cover;
        }
      }
    } catch (error) {
      console.error("Error al obtener cover del álbum:", error);
    }
  }

  // 3. Usar imagen por defecto
  console.log("Usando imagen por defecto para el cover");
  return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
}

// Muestra la canción y guarda el ID de la misma
async function mostrarCancion() {
  if (!nombreCancion) {
    mostrarError("No se proporcionó un nombre de canción.");
    return;
  }

  const cancionesRef = collection(db, "songs");
  const q = query(cancionesRef);

  try {
    const cancionesSnap = await getDocs(q);

    if (cancionesSnap.empty) {
      mostrarError("Canción no encontrada.");
      return;
    }

    let cancionEncontrada = null;
    cancionesSnap.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      if (data.title?.toLowerCase() === nombreCancion) {
        cancionEncontrada = { id: docSnapshot.id, ...data };
        songId = docSnapshot.id;
      }
    });

    if (!cancionEncontrada) {
      mostrarError("Canción no encontrada.");
      return;
    }

    // Obtener el cover
    const coverFinal = await obtenerCoverCancion(cancionEncontrada);

    // Mostrar la información
    document.getElementById("titulo-cancion").innerHTML = cancionEncontrada.title;
    const coverElement = document.getElementById("cover-cancion");
    coverElement.src = coverFinal;
    
    // Manejar errores de carga de imagen
    coverElement.onerror = () => {
      console.error("Error al cargar la imagen del cover, usando imagen por defecto");
      coverElement.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
    };

    // Cargar la calificación promedio
    cargarPromedioCalificacion();
  } catch (error) {
    console.error("❌ Error al consultar Firestore:", error);
    mostrarError("Error al cargar la canción.");
  }
}

// Carga las reseñas desde Firestore
async function loadReviews() {
  const reviewsContainer = document.getElementById("reviews-container");
  reviewsContainer.innerHTML = "";
  const header = document.createElement("h3");
  header.textContent = "Reseñas";
  reviewsContainer.appendChild(header);

  try {
    const reviewsRef = collection(db, "reviews");
    const reviewsQuery = query(
      reviewsRef,
      where("track", "==", nombreCancion),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(reviewsQuery);
    console.log("Cantidad de reseñas encontradas:", querySnapshot.size);

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const card = document.createElement("div");
      card.className = "card mt-2";

      let timeStr = "";
      if (data.timestamp) {
        if (data.timestamp.seconds) {
          timeStr = new Date(data.timestamp.seconds * 1000).toLocaleString();
        } else {
          timeStr = new Date(data.timestamp).toLocaleString();
        }
      }

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">${data.name} ${data.rating ? "⭐".repeat(data.rating) : ""}</h5>
          <p class="card-text">${data.review}</p>
          <small class="text-muted">${timeStr}</small>
        </div>
      `;
      reviewsContainer.appendChild(card);
    });
  } catch (error) {
    console.error("Error al cargar las reseñas:", error);
    reviewsContainer.insertAdjacentHTML("beforeend", "<p>Error al cargar las reseñas.</p>");
  }
}

// Envío de la reseña
document.getElementById("review-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reviewer-name").value.trim();
  const review = document.getElementById("review-text").value.trim();
  const rating = window.selectedRating;

  if (!name || !review || !rating) {
    alert("Por favor, completa la reseña y selecciona una calificación.");
    return;
  }

  try {
    await addDoc(collection(db, "reviews"), {
      track: nombreCancion,
      name,
      review,
      rating,
      timestamp: serverTimestamp()
    });

    document.getElementById("review-form").reset();
    window.selectedRating = undefined;
    const stars = document.querySelectorAll("#estrellas span");
    stars.forEach(star => star.classList.remove("bi-star-fill"));

    const user = localStorage.getItem("loggedInUser");
    if (user) {
      document.getElementById("reviewer-name").value = user;
    }

    loadReviews();
  } catch (error) {
    console.error("Error al enviar la reseña:", error);
  }
});

// Manejo de estrellas para calificación
document.getElementById("estrellas").addEventListener("click", (e) => {
  if (e.target.classList.contains("bi-star")) {
    const stars = Array.from(document.querySelectorAll("#estrellas span"));
    const index = parseInt(e.target.getAttribute("data-index"));

    stars.forEach((star, i) => {
      if (i <= index) {
        star.classList.add("bi-star-fill");
      } else {
        star.classList.remove("bi-star-fill");
      }
    });

    window.selectedRating = index + 1;
  }
});

// Envío de la calificación
document.getElementById("submit-rating").addEventListener("click", async () => {
  if (!window.selectedRating) {
    alert("Por favor, selecciona una calificación.");
    return;
  }

  try {
    const starsRef = collection(db, "stars");
    const q = query(starsRef, where("songId", "==", songId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docId = querySnapshot.docs[0].id;
      const docRef = doc(db, "stars", docId);
      const oldRating = querySnapshot.docs[0].data().rating;

      await updateDoc(docRef, {
        rating: window.selectedRating,
        timestamp: new Date()
      });

      await updateDoc(doc(db, "songs", songId), {
        averageRating: increment(window.selectedRating - oldRating)
      });

      alert("¡Gracias por actualizar tu calificación!");
    } else {
      const docRef = doc(db, "stars", `${songId}-${userId}`);
      await setDoc(docRef, {
        songId: songId,
        rating: window.selectedRating,
        userId: userId,
        timestamp: new Date(),
      });

      await updateDoc(doc(db, "songs", songId), {
        averageRating: increment(window.selectedRating)
      });

      alert("¡Gracias por tu calificación!");
    }

    cargarPromedioCalificacion();
  } catch (error) {
    console.error("❌ Error al guardar la calificación:", error);
    alert("Error al guardar la calificación. Intenta nuevamente.");
  }
});

// Carga el promedio de calificación
async function cargarPromedioCalificacion() {
  const starsRef = collection(db, "stars");
  const q = query(starsRef, where("songId", "==", songId));

  try {
    const starsSnap = await getDocs(q);
    const ratings = [];
    starsSnap.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      ratings.push(data.rating);
    });

    const averageRatingElement = document.getElementById("average-rating");
    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating, 0);
      const average = sum / ratings.length;
      averageRatingElement.innerText = average.toFixed(1);
    } else {
      averageRatingElement.innerText = "Sin calificaciones";
    }
  } catch (error) {
    console.error("❌ Error al cargar el promedio de calificación:", error);
    document.getElementById("average-rating").innerText = "Error al cargar promedio";
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  mostrarCancion();
  if (nombreCancion) {
    loadReviews();
  }

  // Cargar nombre de usuario si está logueado
  const user = localStorage.getItem("loggedInUser");
  if (user) {
    document.getElementById("reviewer-name").value = user;
  }
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



