mapboxgl.accessToken = 'pk.eyJ1IjoiZnVya2FuLWNpcmFjaSIsImEiOiJjbHYwcnNlcDQxa3R6MmtueTB2NDByNHBzIn0.3Ge2Hi18B7yrEXTdu-bhNA';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0.107929, 49.49437],
    zoom: 13
});

function loadMarkersFromGitHub() {
    var repoOwner = 'Azzzeuh';
    var repoName = 'docker-sae203';
    var directoryPath = 'marqueurs';

    var url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${directoryPath}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Impossible de récupérer la liste des fichiers.');
            }
            return response.json();
        })
        .then(data => {
            data.forEach(file => {
                if (file.name.endsWith('.geojson')) {
                    var fileUrl = file.download_url;
                    fetch(fileUrl)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error(`Erreur lors du chargement du fichier : ${file.name}`);
                            }
                            return response.json();
                        })
                        .then(geojson => {
                            // Ajouter les marqueurs à la carte
                            geojson.features.forEach(feature => {
                                var lngLat = feature.geometry.coordinates;
                                var title = feature.properties.title;
                                var description = feature.properties.description;

                                // Créer un marqueur et l'ajouter à la carte
                                new mapboxgl.Marker()
                                    .setLngLat(lngLat)
                                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${title}</h3><p>${description}</p>`))
                                    .addTo(map);
                            });
                        })
                        .catch(error => {
                            console.error(`Erreur lors du chargement du fichier GeoJSON : ${file.name}`, error);
                        });
                }
            });
        })
        .catch(error => {
            console.error('Une erreur s\'est produite lors du chargement des fichiers : ', error);
        });
}

// Charger les marqueurs depuis GitHub au chargement de la page
loadMarkersFromGitHub();


document.getElementById('add-marker-mode').addEventListener('click', function() {
    map.getCanvas().style.cursor = 'crosshair'; // Modifier le curseur pour indiquer l'ajout de marqueur

    map.once('click', function(e) {
        var lngLat = e.lngLat;

        var title = prompt("Entrez le titre du marqueur :");
        var description = prompt("Entrez la description du marqueur :");

        // Créer un marqueur et l'ajouter à la carte
        new mapboxgl.Marker()
            .setLngLat(lngLat)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${title}</h3><p>${description}</p>`))
            .addTo(map);

        // Enregistrer le nouveau marqueur dans un fichier GeoJSON sur GitHub
        saveMarkerToGitHub({ lngLat: [lngLat.lng, lngLat.lat], title: title, description: description });

        map.getCanvas().style.cursor = ''; // Restaurer le curseur par défaut
    });
});

// Fonction pour enregistrer un marqueur dans un fichier GeoJSON sur GitHub
function saveMarkerToGitHub(markerData) {
    var repoOwner = 'Azzzeuh';
    var repoName = 'docker-sae203';
    var directoryPath = 'marqueurs';

    var currentDate = new Date();
    var fileName = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}_${pad(currentDate.getHours())}-${pad(currentDate.getMinutes())}-${pad(currentDate.getSeconds())}.geojson`;
    var filePath = `${directoryPath}/${fileName}`;

    var newFeature = {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: markerData.lngLat
        },
        properties: {
            title: markerData.title,
            description: markerData.description,
            created_at: currentDate.toISOString()
        }
    };

    var url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    var content = JSON.stringify({ type: 'FeatureCollection', features: [newFeature] });
    var encodedContent = btoa(unescape(encodeURIComponent(content)));

    fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: 'Add new marker',
            content: encodedContent,
            branch: 'main'
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de l\'enregistrement du marqueur sur GitHub.');
        }
        console.log('Nouveau marqueur enregistré avec succès dans le fichier GeoJSON.');
    })
    .catch(error => {
        console.error('Une erreur s\'est produite lors de l\'enregistrement du marqueur : ', error);
    });
}

// Fonction utilitaire pour formater les chiffres sur deux caractères
function pad(number) {
    return (number < 10 ? '0' : '') + number;
}


