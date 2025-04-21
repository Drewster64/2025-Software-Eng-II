import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {getFirestore, collection, doc, getDoc, query, where,getDocs} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase (usada para conectar tu app con Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyC8OziYZn9iiiIH19SfXf1tw6UOoYA1apA",
  authDomain: "try1-8c82b.firebaseapp.com",
  projectId: "try1-8c82b",
  storageBucket: "try1-8c82b.appspot.com",
  messagingSenderId: "722840528217",
  appId: "1:722840528217:web:85547781c2230e8b1d5848"
};

// Inicializar Firebase con la configuración anterior
const app = initializeApp(firebaseConfig);
// Obtener la referencia de la base de datos Firestore
const db = getFirestore(app);

// Obtener el nombre de la canción desde los parámetros de la URL
const urlParams = new URLSearchParams(window.location.search);
// La clave 'nombre' en la URL es el parámetro que esperamos
const nombreCancion = urlParams.get("nombre");
console.log("🔍 Nombre de la canción desde URL:", nombreCancion);

// Función para mostrar la información de la canción
async function mostrarCancion() {
  // Si no se proporciona un nombre de canción, mostramos un mensaje de error
  if (!nombreCancion) {
    document.getElementById("titulo-cancion").innerHTML =
      "No se proporciono un nombre de cancion.";
    return;
  }

  // Referencia a la colección "songs" en Firestore
  const cancionesRef = collection(db, "songs");
  // Realizamos una consulta para obtener las canciones que coincidan con el título
  const q = query(cancionesRef, where("title", "==", nombreCancion));

  try {
    // Ejecutamos la consulta a Firestore
    const cancionesSnap = await getDocs(q);
    // Si no encontramos ninguna canción, mostramos un mensaje de error
    if (cancionesSnap.empty) {
      document.getElementById("titulo-cancion").innerHTML = "Cancion no encontrada.";
      document.getElementById("cover-cancion").src =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
      return;
    }

    let cancionEncontrada = null;
    // Iteramos por los documentos encontrados y buscamos el que coincida con el nombre de la canción
    cancionesSnap.forEach((doc) => {
      const data = doc.data();
      // Si el título coincide con el nombre de la canción en la URL, lo guardamos en 'cancionEncontrada'
      if (data.title.toLowerCase() === nombreCancion.toLowerCase()) {
        cancionEncontrada = { id: doc.id, ...data };
      }
    });

    // Si encontramos la canción
    if (cancionEncontrada) {
      const titulo = cancionEncontrada.title;
      let coverFinal = cancionEncontrada.cover;

      // Si la canción no tiene cover, intentamos obtenerlo desde el álbum asociado
      if (!coverFinal || coverFinal.trim() === "") {
        const albumId = cancionEncontrada.albumId;
        if (albumId) {
          // Referencia al documento del álbum usando su ID
          const albumRef = doc(db, "album", albumId.trim());
          const albumSnap = await getDoc(albumRef);
          // Si el álbum existe, tomamos su cover
          if (albumSnap.exists()) {
            const albumData = albumSnap.data();
            coverFinal = albumData.cover;
          } else {
            console.log("🎶 No se encontro el album asociado.");
          }
        }
      }

      // Si aún no encontramos un cover, asignamos uno genérico
      if (!coverFinal || coverFinal.trim() === "") {
        coverFinal =
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
      }

      // Finalmente, mostramos el título y el cover de la canción en el HTML
      document.getElementById("titulo-cancion").innerHTML = titulo;
      document.getElementById("cover-cancion").src = coverFinal;
    } else {
      // Si no se encuentra la canción, mostramos un mensaje de error
      document.getElementById("titulo-cancion").innerHTML = "Cancion no encontrada.";
      document.getElementById("cover-cancion").src =
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
    }
  } catch (error) {
    // Si ocurre un error en la consulta a Firestore, mostramos un mensaje de error
    console.error("❌ Error al consultar Firestore:", error);
    document.getElementById("titulo-cancion").innerHTML = "Error al cargar la cancion.";
    document.getElementById("cover-cancion").src =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/480px-No_image_available.svg.png";
  }
}

// Ejecutar la función cuando se cargue la página
document.addEventListener("DOMContentLoaded", mostrarCancion);
