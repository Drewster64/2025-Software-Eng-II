import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC8OziYZn9iiiIH19SfXf1tw6UOoYA1apA",
    authDomain: "try1-8c82b.firebaseapp.com",
    projectId: "try1-8c82b",
    storageBucket: "try1-8c82b.appspot.com",
    messagingSenderId: "722840528217",
    appId: "1:722840528217:web:85547781c2230e8b1d5848"
};

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app); // Inicializar Firestore

// 📌 Función para cargar artistas en el carrusel desde Firestore
async function cargarArtistas() {
    console.log("🔄 Cargando artistas desde Firestore...");
  
    const artistasRef = collection(db, "artistas"); // Obtiene colección de artistas de Firebase
    const snapshot = await getDocs(artistasRef); // Ve los artistas uno por uno
    const carouselInner = document.querySelector(".carousel-inner"); // Busca el carrusel en el index
  
    if (!carouselInner) {
        console.error("⚠️ No se encontró el elemento .carousel-inner en el HTML.");
        return;
    }
  
    let first = true;
    carouselInner.innerHTML = ""; 
  
    snapshot.forEach((doc) => {
        const artista = doc.data();
        console.log("✅ Artista encontrado:", artista);

        // Esta sección marca el artista como activo y obtiene todos sus datos desde Firebase
        if (!artista.image || !artista.name) {
            console.warn("⚠️ Documento inválido en artistas:", doc.id, artista);
            return;
        }
  
        const item = document.createElement("div");
        item.classList.add("carousel-item");
        if (first) {
            item.classList.add("active");
            first = false;
        }
  
        item.innerHTML = `
            <div class="d-flex flex-column align-items-center">
                <img src="${artista.image}" alt="${artista.name}" class="d-block mx-auto img-fluid rounded" style="width: 500px; height: 500px; object-fit: cover;">
                <div class="mt-2">
                    <span class="btn fw-bold" style="color: black; font-size: 185%">${artista.name}</span>
                </div>
            </div>
        `;
  
        carouselInner.appendChild(item); // Agrega el artista al carrusel
    });
  
    console.log("🎉 Carrusel actualizado con los artistas.");
}
  
// Ejecutar la función al cargar la página
document.addEventListener("DOMContentLoaded", cargarArtistas);
