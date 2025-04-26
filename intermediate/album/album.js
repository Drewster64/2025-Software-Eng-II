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

// Obtener el nombre del álbum desde la URL
const urlParams = new URLSearchParams(window.location.search);
const nombreAlbum = urlParams.get("nombre");

// Función para mostrar la información del álbum
async function mostrarAlbum() {
  if (!nombreAlbum) {
    document.getElementById("titulo-album").innerHTML = "No se proporcionó un nombre de álbum.";
    return;
  }

  const albumesRef = collection(db, "album");
  const q = query(albumesRef, where("name", "==", nombreAlbum));

  try {
    const albumesSnap = await getDocs(q);

    if (albumesSnap.empty) {
      document.getElementById("titulo-album").innerHTML = "Álbum no encontrado.";
      document.getElementById("cover-album").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
      return;
    }

    let albumEncontrado = null;

    albumesSnap.forEach((doc) => {
      const data = doc.data();
      if (data.name.toLowerCase() === nombreAlbum.toLowerCase()) {
        albumEncontrado = { id: doc.id, ...data };
      }
    });

    if (albumEncontrado) {
      let coverFinal = albumEncontrado.cover;

      if (!coverFinal || coverFinal.trim() === "") {
        coverFinal = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
      }

      document.getElementById("titulo-album").innerHTML = albumEncontrado.name;
      document.getElementById("cover-album").src = coverFinal;
      document.getElementById("info-album").innerHTML = albumEncontrado.info || "Información no disponible.";
    } else {
      document.getElementById("titulo-album").innerHTML = "Álbum no encontrado.";
      document.getElementById("cover-album").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
    }
  } catch (error) {
    console.error("❌ Error al consultar Firestore:", error);
    document.getElementById("titulo-album").innerHTML = "Error al cargar el álbum.";
    document.getElementById("cover-album").src = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
  }
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", mostrarAlbum);
