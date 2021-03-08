export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiemFjaGJhem92IiwiYSI6ImNrbG5wYzN2dzBiZHAyb3FtdHZtZDlsZncifQ.tQ2CswkwY8FX9rQV4rvcAg';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/zachbazov/cklnr71pf398217np8nxh0g24',
        scrollZoom: false
        // center: [-118.113497, 34.111745],
        // zoom: 10,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach(location => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        }).setLngLat(location.coordinates).addTo(map);

        // Add popup
        new mapboxgl
            .Popup({
                offset: 30
            })
            .setLngLat(location.coordinates)
            .setHTML(`<p>Day ${location.day}<br>${location.description}</p>`)
            .addTo(map);

        // Extends the map bounds, to include the current location
        bounds.extend(location.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}