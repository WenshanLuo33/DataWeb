mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm7chdf7x002z01qo51indd1p", // 你的 Mapbox 样式
    center: [0, 20], // 🌍 调整地图中心点至全球视角
    zoom: 2, // 🌍 设置合适的缩放级别以显示整个世界
    minZoom: 2,  // ✅ 设置最小缩放级别（避免过远）
    maxZoom: 4  // ✅ 限制最大缩放级别，避免过度放大
});

// ✅ 添加地图控件
map.addControl(new mapboxgl.NavigationControl());

// ✅ 使用绝对路径加载 GeoJSON 文件
    fetch('https://wenshanluo33.github.io/DataWeb/Assignment_03Adjustment/Map01/data/women_in_parliament.geojson')
      .then(response => response.json())
      .then(data => {
          console.log("✅ GeoJSON 数据加载成功:", data);

    map.addSource("women-parliament-data", {
        type: "geojson",
        data: "../Map01/data/women_in_parliament.geojson"
    });


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
                10.34, "#fcae91",
                19.78, "#fb6a4a",
                27.7, "#de2d26",
                36.09, "#a50f15"
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
