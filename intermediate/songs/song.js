import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, query, getDocs, setDoc, updateDoc, where, increment, arrayRemove, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

// Obtener el nombre de la canción desde la URL
const urlParams = new URLSearchParams(window.location.search);
const nombreCancion = urlParams.get("nombre")?.toLowerCase(); // Convertimos a minúsculas

// Variables globales
let songId = ""; // Para almacenar el ID de la canción
let userId = "currentUser"; // Reemplaza esto con el sistema de autenticación que estés usando

// Función para mostrar la información de la canción
async function mostrarCancion() {
  if (!nombreCancion) {
    document.getElementById("titulo-cancion").innerHTML = "No se proporcionó un nombre de canción.";
    return;
  }

  const cancionesRef = collection(db, "songs");
  const q = query(cancionesRef);

  try {
    const cancionesSnap = await getDocs(q);

    if (cancionesSnap.empty) {
      document.getElementById("titulo-cancion").innerHTML = "Canción no encontrada.";
      document.getElementById("cover-cancion").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
      return;
    }

    let cancionEncontrada = null;

    cancionesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.title?.toLowerCase() === nombreCancion) {
        cancionEncontrada = { id: doc.id, ...data };
        songId = doc.id; // Guardamos el ID de la canción
      }
    });

    if (cancionEncontrada) {
      let coverFinal = cancionEncontrada.cover;

      if (!coverFinal || coverFinal.trim() === "") {
        const albumId = cancionEncontrada.albumId;
        if (albumId) {
          const albumRef = doc(db, "album", albumId.trim());
          const albumSnap = await getDoc(albumRef);
          if (albumSnap.exists()) {
            const albumData = albumSnap.data();
            coverFinal = albumData.cover;
          }
        }
      }

      if (!coverFinal || coverFinal.trim() === "") {
        coverFinal = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
      }

      document.getElementById("titulo-cancion").innerHTML = cancionEncontrada.title;
      document.getElementById("cover-cancion").src = coverFinal;
    } else {
      document.getElementById("titulo-cancion").innerHTML = "Canción no encontrada.";
      document.getElementById("cover-cancion").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
    }

    // Cargar la calificación promedio
    cargarPromedioCalificacion();
  } catch (error) {
    console.error("❌ Error al consultar Firestore:", error);
    document.getElementById("titulo-cancion").innerHTML = "Error al cargar la canción.";
    document.getElementById("cover-cancion").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
  }
}

// Función para cargar el promedio de calificación
async function cargarPromedioCalificacion() {
  const starsRef = collection(db, "stars");
  const q = query(starsRef, where("songId", "==", songId));

  try {
    const starsSnap = await getDocs(q);
    const ratings = [];

    starsSnap.forEach((doc) => {
      const data = doc.data();
      ratings.push(data.rating); // Almacenamos todas las calificaciones
    });

    if (ratings.length > 0) {
      const sum = ratings.reduce((acc, rating) => acc + rating, 0);
      const average = sum / ratings.length;
      document.getElementById("average-rating").innerText = average.toFixed(1); // Mostrar el promedio en 1 decimal
    } else {
      document.getElementById("average-rating").innerText = "Sin calificaciones";
    }
  } catch (error) {
    console.error("❌ Error al cargar el promedio de calificación:", error);
    document.getElementById("average-rating").innerText = "Error al cargar promedio";
  }
}

// Función para guardar la calificación de estrellas
document.getElementById("estrellas").addEventListener("click", (e) => {
  if (e.target.classList.contains("bi-star")) {
    const stars = Array.from(document.querySelectorAll(".bi-star"));
    const index = parseInt(e.target.getAttribute("data-index"));

    // Resaltar las estrellas hasta el índice seleccionado
    stars.forEach((star, i) => {
      if (i <= index) {
        star.classList.add("bi-star-fill"); // Cambiar a estrella llena
      } else {
        star.classList.remove("bi-star-fill"); // Quitar estrella llena
      }
    });

    // Guardar la calificación en una variable
    window.selectedRating = index + 1;  // Las estrellas son 1 a 5
  }
});

// Función para enviar la calificación al hacer clic en el botón
document.getElementById("submit-rating").addEventListener("click", async () => {
  if (!window.selectedRating) {
    alert("Por favor, selecciona una calificación.");
    return;
  }

  try {
    // Verificar si el usuario ya tiene una calificación para esta canción
    const starsRef = collection(db, "stars");
    const q = query(starsRef, where("songId", "==", songId), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Si el usuario ya tiene una calificación, actualizamos en lugar de añadir una nueva
      const docId = querySnapshot.docs[0].id; // Obtenemos el ID del documento

      const docRef = doc(db, "stars", docId);
      const oldRating = querySnapshot.docs[0].data().rating; // Obtenemos la calificación anterior

      // Actualizamos el documento con la nueva calificación
      await updateDoc(docRef, {
        rating: window.selectedRating,
        timestamp: new Date(),
      });

      // Actualizar la calificación promedio (restar la calificación anterior y sumar la nueva)
      await updateDoc(doc(db, "songs", songId), {
        averageRating: increment(window.selectedRating - oldRating), // Restar la calificación anterior y sumar la nueva
      });

      alert("¡Gracias por actualizar tu calificación!");
    } else {
      // Si el usuario no tiene una calificación previa, la creamos
      const docRef = doc(db, "stars", `${songId}-${userId}`);
      await setDoc(docRef, {
        songId: songId,
        rating: window.selectedRating,
        userId: userId,
        timestamp: new Date(),
      });

      // Actualizar la calificación promedio
      await updateDoc(doc(db, "songs", songId), {
        averageRating: increment(window.selectedRating),
      });

      alert("¡Gracias por tu calificación!");
    }

    // Actualizamos el promedio de calificación
    cargarPromedioCalificacion();
  } catch (error) {
    console.error("❌ Error al guardar la calificación:", error);
    alert("Error al guardar la calificación. Intenta nuevamente.");
  }
});

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", mostrarCancion);
