mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm72arjk5001701qqdxwcg5rn",
    zoom: 12,
    center: [-73.86, 40.745], // Flushing Bay
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
                1, '#a2d2ff',  
                2, '#6699ff',  
                3, '#6a4cff',  
                4, '#4a1cff',  
                5, '#3300a1'  
            ],
            'fill-opacity': 0.25,
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
            'circle-color': [
                'match', ['get', 'Asset_Type'],
                'Rain Garden', '#96b43e',         // 绿松石色
                'ROWRG', '#96b43e',              // 绿松石色 (Rain Garden)
                'Green Roof', '#519752',         // 橙色
                'Combined Blue/Green Roof', '#519752', // 橙色 (Green Roof)
                'ROW Porous Concrete', '#cea3ea', // 蓝紫色
                'Permeable Pavers', '#cea3ea',   // 蓝紫色 (Permeable Pavement)
                'Porous Asphalt', '#cea3ea',     // 蓝紫色
                'Subsurface Storage', '#E78AC3', // 粉色
                'Subsurface Detention System', '#E78AC3', // 粉色
                'Synthetic Turf Field Storage Layer', '#E78AC3', // 粉色
                'ROWB', '#ffcb63',               // 亮绿色
                'ROWGS', '#ffcb63',              // 亮绿色
                'ROWSGS', '#ffcb63',             // 亮绿色
                'ROW Median', '#ffcb63',         // 亮绿色
                'ROW Infiltration Basin with Concrete Top', '#dd6c59', // 深蓝色
                'ROW Infiltration Basin with Grass Top', '#dd6c59', // 深蓝色
                'ROW Infiltration Basin with Combination of Concrete and Grass Top', '#dd6c59', // 深蓝色
                /* 其他情况 */
                '#929292' // 其他 (黄色)
            ],
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                8, 0.8,   
                12, 3.2,  
                15, 9  
            ],
            'circle-opacity': 0.9,
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

    new mapboxgl.Popup({ className: 'flood-popup' }) // ✅ 添加不同的 class
        .setLngLat(coordinates)
        .setHTML(`
            <h4>Flood Vulnerability</h4>
            <p><b>FSHRI:</b> ${props["fshri"] || 'Unknown'}</p>
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

    new mapboxgl.Popup({ className: 'green-popup' }) // ✅ 添加不同的 class
        .setLngLat(coordinates)
        .setHTML(`
            <h4>Green Infrastructure</h4>
            <p><b>Project:</b> ${props["Project_Na"] || 'Unknown'}</p>
            <p><b>Asset Type:</b> ${props["Asset_Type"] || 'Unknown'}</p>
            <p><b>NYC Waters:</b> ${props["NYC_Waters"] || 'Unknown'}</p>
            <p><b>Outfall:</b> ${props["Outfall"] || 'Unknown'}</p>
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

