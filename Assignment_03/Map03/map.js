mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm7chskzi001a01qs14y68nb7", // 你的 Mapbox 样式
    center: [-73.9784, 40.707], // 地图中心点（纽约）
    zoom: 10, // 初始缩放级别
    minZoom: 1,  // ✅ 设置最小缩放级别（避免过远）
    maxZoom: 30, // ✅ 设置最大缩放级别（避免过近）
    maxBounds: [
        [-76.5, 40.0],  // ✅ 限制地图的西南边界
        [-71.5, 45.0]   // ✅ 限制地图的东北边界
    ]
});


// ✅ 添加地图控件
map.addControl(new mapboxgl.NavigationControl());

// 📌 加载 `Commuting_time_census_data.geojson`
map.on("load", function () {
    console.log("✅ Map Loaded Successfully");

    map.addSource("commuting-data", {
        type: "geojson",
        data: "../Map01/data/Commuting_time_census_data.geojson"
    });

    // ✅ 线性渐变颜色映射（从 Colab Altair 代码转换）
    const minValue = 0;  // ✅ 你的数据最小值
    const maxValue = 250000; // ✅ 你的数据最大值

    // ✅ Purple-Blue 线性渐变
    map.addLayer({
        id: "commuting-layer",
        type: "fill",
        source: "commuting-data",
        filter: [">", ["to-number", ["get", "B08013_001E"]], 0],  // 🚀 只显示数值大于 0 的区域
        paint: {
            "fill-color": [
                "interpolate",
                ["linear"],
                ["to-number", ["get", "B08013_001E"]],
                minValue, "#f2f0f7",  // 低值（浅紫色）
                maxValue * 0.2, "#cbc9e2",
                maxValue * 0.4, "#9e9ac8",
                maxValue * 0.6, "#756bb1",
                maxValue * 0.8, "#54278f",
                maxValue, "#3f007d"  // 高值（深紫色）
            ],
            "fill-opacity": 0.75,
            "fill-outline-color": "#ffffff"
        }
    });

    console.log("✅ Commuting Time Layer Added");

    // 📌 点击时显示通勤时间信息
    map.on("click", "commuting-layer", function (e) {
        let props = e.features[0].properties;
        let coordinates = e.lngLat;

        console.log("🟢 Block clicked:", props);

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h4>Commute Time Data</h4>
                <p><b>GEOID:</b> ${props["GEOID"] || 'Unknown'}</p>
                <p><b>Commute Time:</b> ${props["B08013_001E"] ? parseFloat(props["B08013_001E"]).toFixed(0) + " mins" : 'No Data'}</p>
            `)
            .addTo(map);
    });

    // 📌 鼠标悬停时改变指针样式
    map.on("mouseenter", "commuting-layer", function () {
        map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "commuting-layer", function () {
        map.getCanvas().style.cursor = "";
    });

    // ✅ 添加线性渐变图例
    addGradientLegend(minValue, maxValue);
});
