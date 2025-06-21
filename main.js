
const map = L.map('map').setView([3.45, -76.53], 15);

const googleHybrid = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
  subdomains:['mt0','mt1','mt2','mt3'],
  maxZoom: 20,
  attribution: '&copy; Google Maps',
  opacity: 0.5
}).addTo(map);

document.getElementById("opacitySlider").addEventListener("input", function() {
  const opacity = parseFloat(this.value);
  googleHybrid.setOpacity(opacity);
});

const baseMaps = {
  "Google Hybrid": googleHybrid
};

const controlCapas = L.control.layers(baseMaps, {}, { collapsed: false }).addTo(map);

// Capa Claudia (azul)
fetch("Visitas_Claudia_18jun.geojson")
  .then(res => res.json())
  .then(data => {
    const claudia = L.geoJSON(data, {
      style: {
        color: "blue",
        weight: 2,
        fillOpacity: 0.3
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const content = Object.keys(props)
          .map(k => `<b>${k}</b>: ${props[k]}`)
          .join("<br>");
        layer.bindPopup(content);
      }
    }).addTo(map);
    controlCapas.addOverlay(claudia, "Visitas Claudia (azul)");
  });

// Capa AFNGE (rojo/verde)
fetch("Seguimiento_AFNGE.geojson")
  .then(res => res.json())
  .then(data => {
    const afnge = L.geoJSON(data, {
      style: feature => {
        const visita = feature.properties.Visita_No;
        const estado = visita && visita > 0 ? "visitado" : "no_visitado";
        return {
          color: estado === "visitado" ? "green" : "red",
          weight: 2,
          fillOpacity: 0.5
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const content = Object.keys(props)
          .map(k => `<b>${k}</b>: ${props[k]}`)
          .join("<br>");
        layer.bindPopup(content);
      }
    }).addTo(map);
    controlCapas.addOverlay(afnge, "Seguimiento AFNGE (verde/rojo)");
  });

// Geolocalización
let geolocateCircle = null;

function localizarUsuario() {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (geolocateCircle) {
        geolocateCircle.setLatLng([lat, lng]);
      } else {
        geolocateCircle = L.circleMarker([lat, lng], {
          radius: 8,
          color: "#ffffff",
          fillColor: "#1E90FF",
          fillOpacity: 0.9,
          weight: 2
        }).addTo(map);
      }

      map.setView([lat, lng], 17);
    },
    error => {
      alert("No se pudo obtener tu ubicación.");
    },
    {
      enableHighAccuracy: true
    }
  );
}
