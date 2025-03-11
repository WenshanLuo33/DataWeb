mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm7chskzi001a01qs14y68nb7", // 你的 Mapbox 样式
    center: [0, 20], // 🌍 调整地图中心点至全球视角
    zoom: 2, // 🌍 设置合适的缩放级别以显示整个世界
    minZoom: 1.2,  // ✅ 设置最小缩放级别（避免过远）
    maxZoom: 3.5  // ✅ 限制最大缩放级别，避免过度放大
});


// ✅ 添加地图控件
map.addControl(new mapboxgl.NavigationControl());
// 📌 加载 `Women_in_Parliament.geojson`
map.on("load", function () {
    console.log("✅ Map Loaded Successfully");

    map.addSource("women-parliament-data", {
        type: "geojson",
        data: "../Map01/data/women_in_parliament.geojson"
    });

    // ✅ 线性渐变颜色映射（从 Colab Altair 代码转换）
    const minValue = 0;  // ✅ 你的数据最小值
    const maxValue = 100; // ✅ 你的数据最大值
    
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
                minValue,"#f2f0f7",  // 低值（浅紫色）
                maxValue * 0.2, "#fee5d9",
                maxValue * 0.4, "#fcae91",
                maxValue * 0.6, "#fb6a4a",
                maxValue * 0.8, "#de2d26",
                maxValue, "#a50f15"  // 高值（深紫色）
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

    // ✅ 添加线性渐变图例
    addGradientLegend(minValue, maxValue);
});

    
