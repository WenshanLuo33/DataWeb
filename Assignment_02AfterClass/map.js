mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm6q2kgh700xi01qq9nlq2i76",
    zoom: 12,
    center: [-73.85, 40.75], // Flushing Bay
    maxZoom: 15,
    minZoom: 8,
    maxBounds: [[-74.45, 40.45], [-73.55, 41]]
});

map.on('load', function () {
    console.log("✅ Map Loaded Successfully");

    // ✅ 加载洪水易损性数据
    map.addSource('flood-vulnerability', {
        type: 'geojson',
        data: 'data/New York City\'s Flood Vulnerability Index_20250210.geojson'
    });

    map.addLayer({
        id: 'flood-vulnerability-layer',
        type: 'fill',
        source: 'flood-vulnerability',
        paint: {
            'fill-color': [
                'interpolate', ['linear'], ['to-number', ['get', 'fshri']],
                0, '#d4f0ff',  
                2, '#a2d2ff',  
                4, '#6699ff',  
                6, '#6a4cff',  
                8, '#4a1cff',  
                10, '#2a007f'  
            ],
            'fill-opacity': 0.7,
            'fill-outline-color': '#222'
        }
    });

    console.log("✅ Flood Vulnerability Layer Added");

    // ✅ 加载 Green Infrastructure 数据
    map.addSource('green-infrastructure', {
        type: 'geojson',
        data: 'data/DEP_Green_Infrastructure.geojson'
    });

    // ✅ 确保 Green Infrastructure 在 Flood 图层上方
    map.addLayer({
        id: 'green-infrastructure-layer',
        type: 'circle',
        source: 'green-infrastructure',
        paint: {
            'circle-color': '#505050', // ✅ 统一为绿色
            'circle-radius': 3.5,
            'circle-opacity': 0.95,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });
    

    console.log("✅ Green Infrastructure Layer Added");

    // ✅ 交互：点击洪水多边形，弹出详细信息
    map.on('click', 'flood-vulnerability-layer', function(e) {
        let props = e.features[0].properties;
        let coordinates = e.features[0].geometry.coordinates[0][0];

        console.log("🟢 Feature clicked:", props);

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h4>Flood Vulnerability</h4>
                <p><b>Index:</b> ${props["fshri"] || 'Unknown'}</p>
                <p><b>Area:</b> ${props["geoid"] || 'N/A'}</p>
                <p><b>Storm Surge Present:</b> ${props["ss_cur"] || 'N/A'}</p>
                <p><b>Storm Surge 2050s:</b> ${props["ss_50s"] || 'N/A'}</p>
                <p><b>Storm Surge 2080s:</b> ${props["ss_80s"] || 'N/A'}</p>
            `)
            .addTo(map);
    });

    // ✅ 交互：点击 Green Infrastructure 点，弹出详细信息
    map.on('click', 'green-infrastructure-layer', function(e) {
        let props = e.features[0].properties;
        let coordinates = e.features[0].geometry.coordinates.slice();

        console.log("🟢 Green Infrastructure Feature clicked:", props);

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h4>Green Infrastructure</h4>
                <p><b>Type:</b> ${props["Type"] || 'Unknown'}</p>
                <p><b>Location:</b> ${props["Location"] || 'N/A'}</p>
                <p><b>Status:</b> ${props["Status"] || 'Unknown'}</p>
            `)
            .addTo(map);
    });

    // ✅ 鼠标悬停时显示指针
    map.on('mouseenter', 'flood-vulnerability-layer', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'flood-vulnerability-layer', function() {
        map.getCanvas().style.cursor = '';
    });

    // ✅ 鼠标悬停时显示指针
    map.on('mouseenter', 'green-infrastructure-layer', function() {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'green-infrastructure-layer', function() {
        map.getCanvas().style.cursor = '';
    });

    // ✅ 添加 Legend
    addLegend();
});

// ✅ 添加 Legend（图例）
function addLegend() {
    let legend = document.createElement("div");
    legend.id = "legend";
    legend.innerHTML = `
        <h2 class="legend-title">Where Does NYC Need More Green Infrastructure for Flood Resilience?</h2>
        <p class="legend-description">
            New York City faces increasing flood risks. This study combines <strong>Flood Vulnerability Index (FVI)</strong> and 
            <strong>Green Infrastructure (GI)</strong> data to explore their relationship. FVI assesses flood-prone areas, while GI—such as 
            rain gardens and green roofs—helps mitigate flooding impacts. The study examines whether GI is effectively deployed in high-risk 
            zones and proposes optimization strategies to enhance urban resilience and water management.
        </p>
        <hr>
        <h4>Flood Vulnerability Index</h4>
        <div><span style="background:#d4f0ff"></span> Very Low (0-2)</div>
        <div><span style="background:#a2d2ff"></span> Low (2-4)</div>
        <div><span style="background:#6699ff"></span> Moderate (4-6)</div>
        <div><span style="background:#6a4cff"></span> High (6-8)</div>
        <div><span style="background:#4a1cff"></span> Very High (8-10)</div>
        <div><span style="background:#2a007f"></span> Extreme (>10)</div>
        <hr>
        <h4>Green Infrastructure</h4>
        <div><span style="background:#505050; border-radius: 50%; width: 10px; height: 10px;"></span> Green Infrastructure</div>
    `;
    document.body.appendChild(legend);
}

