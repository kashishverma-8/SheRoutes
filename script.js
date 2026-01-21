// ================= MAP INITIALIZATION =================
const map = L.map("map").setView([28.6139, 77.2090], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// ================= DESTINATION (DEMO) =================
const destination = {
  lat: 28.6129,
  lng: 77.2295
};

// ================= OPENROUTESERVICE API =================
// ⚠️ For demo only – do NOT expose in production
const API_KEY = "YOUR_API_KEY_HERE";

// ================= USER LOCATION =================
navigator.geolocation.getCurrentPosition(
  (position) => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    L.marker([userLat, userLng])
      .addTo(map)
      .bindPopup("You are here")
      .openPopup();

    map.setView([userLat, userLng], 14);
    getSafeRoutes(userLat, userLng);
  },
  () => alert("Location access denied")
);

// ================= ROUTES =================
function getSafeRoutes(userLat, userLng) {
  const start = `${userLng},${userLat}`;
  const end = `${destination.lng},${destination.lat}`;

  const routes = [
    { name: "Safest Route", color: "green", score: 9 },
    { name: "Medium Route", color: "orange", score: 6 },
    { name: "Risky Route", color: "red", score: 3 }
  ];

  routes.forEach((route, index) => {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start}&end=${end}&alternative_routes.share_factor=${index * 0.4}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!data.features) return;

        const coords = data.features[0].geometry.coordinates;
        const path = coords.map(p => [p[1], p[0]]);

        const polyline = L.polyline(path, {
          color: route.color,
          weight: route.color === "green" ? 7 : route.color === "orange" ? 5 : 3,
          opacity: route.color === "red" ? 0.5 : 0.9,
          dashArray: route.color === "red" ? "6,10" : null
        }).addTo(map);

        polyline.bindPopup(`${route.name}<br>Safety Score: ${route.score}/10`);

        if (route.color === "green") polyline.openPopup();
      });
  });
}

// ================= SOS =================
function sendSOS() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const link = `https://maps.google.com/?q=${lat},${lng}`;

    const message = `🚨 SOS ALERT (SheRoutes)\nI need help!\nLocation: ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  });
}

// ================= SCROLL =================
function scrollToMap() {
  document.getElementById("map-section")
    .scrollIntoView({ behavior: "smooth" });
}
