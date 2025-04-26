import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, doc, getDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const nombreCancion = urlParams.get("nombre");

// Función para mostrar la información de la canción
async function mostrarCancion() {
  if (!nombreCancion) {
    document.getElementById("titulo-cancion").innerHTML = "No se proporcionó un nombre de canción.";
    return;
  }

  const cancionesRef = collection(db, "songs");
  const q = query(cancionesRef, where("title", "==", nombreCancion));

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
      if (data.title.toLowerCase() === nombreCancion.toLowerCase()) {
        cancionEncontrada = { id: doc.id, ...data };
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
  } catch (error) {
    console.error("❌ Error al consultar Firestore:", error);
    document.getElementById("titulo-cancion").innerHTML = "Error al cargar la canción.";
    document.getElementById("cover-cancion").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", mostrarCancion);
