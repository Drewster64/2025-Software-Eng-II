import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC8OziYZn9iiiIH19SfXf1tw6UOoYA1apA",
    authDomain: "try1-8c82b.firebaseapp.com",
    projectId: "try1-8c82b",
    storageBucket: "try1-8c82b.appspot.com",
    messagingSenderId: "722840528217",
    appId: "1:722840528217:web:85547781c2230e8b1d5848"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Obtener parámetro de búsqueda desde URL
const params = new URLSearchParams(window.location.search);
const title = params.get("nombre")?.trim();  // Limpiar espacios
console.log("Buscando canción con el título:", title);

async function buscarCancion(title) {
    const cancionesRef = collection(db, "canciones");
    const q = query(cancionesRef, where("title", "==", title));
    const querySnapshot = await getDocs(q);

    console.log("Resultados encontrados:", querySnapshot.size);

    if (querySnapshot.empty) {
        document.body.innerHTML = "<h2 class='text-center mt-5'>Canción no encontrada</h2>";
        return;
    }

    const cancion = querySnapshot.docs[0].data();
    console.log("Canción encontrada:", cancion);

    document.getElementById("titulo-cancion").textContent = cancion.title;
    document.getElementById("info-cancion").textContent = cancion.info || "";

    // Obtener imagen desde el álbum
    const albumID = cancion.albumID;
    const albumRef = doc(db, "albumes", albumID);
    const albumDoc = await getDoc(albumRef);

    if (albumDoc.exists()) {
        const albumData = albumDoc.data();
        document.getElementById("imagen-cancion").src = albumData.cover;
    } else {
        document.getElementById("imagen-cancion").src = "default.jpg";
    }
}

buscarCancion(title);
