document.getElementById("search-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const query = document.getElementById("search-input").value.trim();
  if (query) {
    window.location.href = `/cancion.html?nombre=${encodeURIComponent(query)}`;
  }
});
