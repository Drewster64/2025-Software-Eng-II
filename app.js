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

// carrusel
async function cargarArtistas() {
    console.log("🔄 Cargando artistas desde Firestore...");
  
    const artistasRef = collection(db, "artistas"); //obtiene coleccion de artistas de firebase
    const snapshot = await getDocs(artistasRef);// ve los artistas uno por uno
    const carouselInner = document.querySelector(".carousel-inner");//busca el carrusel en el index
  
    if (!carouselInner) {
        console.error("⚠️ No se encontró el elemento .carousel-inner en el HTML.");
        return;
    }
  
    let first = true;
    carouselInner.innerHTML = ""; 
  
    snapshot.forEach((doc) => {
        const artista = doc.data();
        console.log("✅ Artista encontrado:", artista);

        //esta seccion marca el artista como activo y obtiene todos sus datos desde firebase
  
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
            <img src="${artista.image}" alt="${artista.name}" class="d-block mx-auto img-fluid rounded">
            <div class="carousel-caption">
                <h3 class="text-center fw-bolder text-white">${artista.name}</h3>
            </div>
        `;
  
        carouselInner.appendChild(item);//agrega el artista al carrusel
    });
  
    console.log("🎉 Carrusel actualizado con los artistas.");
}
  
// Ejecutar la funcion al cargar la página
document.addEventListener("DOMContentLoaded", cargarArtistas);
