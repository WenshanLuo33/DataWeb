mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm72arjk5001701qqdxwcg5rn", // 你的 Mapbox 样式
    center: [0, 20], // 🌍 调整地图中心点至全球视角
    zoom: 2, // 🌍 设置合适的缩放级别以显示整个世界
    minZoom: 1,  // ✅ 设置最小缩放级别（避免过远）
    maxZoom: 6  // ✅ 限制最大缩放级别，避免过度放大
});

// ✅ 添加地图控件
map.addControl(new mapboxgl.NavigationControl());

// 📌 加载 `Women_in_Parliament.geojson`
map.on("load", function () {
    console.log("✅ Map Loaded Successfully");

    map.addSource("women-parliament-data", {
        type: "geojson",
        data: "../Map01/data/Women_in_Parliament.geojson"
    });

    // ✅ Jenks Natural Breaks（你的 Colab 计算出的分级）
    const breaks = [0.0, 8.6, 21.6, 31.0, 41.0, 61.2];  
    const colors = ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"];

    // ✅ 添加女性议员比例数据图层
    map.addLayer({
        id: "women-parliament-layer",
        type: "fill",
        source: "women-parliament-data",
        filter: [">", ["to-number", ["get", "Lower chamber female legislators (aggregate: average)"]], 0],  // 🚀 只显示数值大于 0 的国家
        paint: {
            "fill-color": [
                "interpolate",
                ["linear"],
                ["to-number", ["get", "Lower chamber female legislators (aggregate: average)"]],
                0.0, "#fee5d9",
                8.6, "#fcae91",
                21.6, "#fb6a4a",
                31.0, "#de2d26",
                41.0, "#a50f15"
            ],
            "fill-opacity": 0.75,
            "fill-outline-color": "#ffffff"
        }
    });

    console.log("✅ Women in Parliament Layer Added");

    // 📌 点击时显示女性议员比例信息
    map.on("click", "women-parliament-layer", function (e) {
        let props = e.features[0].properties;
        let coordinates = e.lngLat;

        console.log("🟢 Country clicked:", props);

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`
                <h4>Women in Parliament</h4>
                <p><b>Country:</b> ${props["Entity"] || 'Unknown'}</p>
                <p><b>Percentage:</b> ${props["Lower chamber female legislators (aggregate: average)"] || 'No Data'}%</p>
            `)
            .addTo(map);
    });

    // 📌 鼠标悬停时改变指针样式
    map.on("mouseenter", "women-parliament-layer", function () {
        map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "women-parliament-layer", function () {
        map.getCanvas().style.cursor = "";
    });

    // ✅ 添加图例
    addLegend(breaks, colors);
});