mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm72arjk5001701qqdxwcg5rn",
    center: [0, 20],
    zoom: 2,
    minZoom: 1,
    maxZoom: 6
});

// ✅ 添加地图控件
map.addControl(new mapboxgl.NavigationControl());

// ✅ 先加载 GeoJSON 数据，然后初始化地图
fetch('https://wenshanluo33.github.io/DataWeb/Assignment_03Adjustment/Map01/data/women_in_parliament.geojson')
  .then(response => response.json())
  .then(data => {
      console.log("✅ GeoJSON 数据成功加载:", data);

      map.on("load", function () {
          console.log("✅ Map Loaded Successfully");

          // ✅ 只添加一次 `map.addSource()`
          map.addSource("women-parliament-data", {
              type: "geojson",
              data: data
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
  })
  .catch(error => console.error('❌ 加载 GeoJSON 失败:', error));

// ✅ 添加 `addLegend()` 函数
function addLegend(breaks, colors) {
    const legend = document.createElement("div");
    legend.style.position = "absolute";
    legend.style.bottom = "10px";
    legend.style.right = "10px";
    legend.style.background = "white";
    legend.style.padding = "10px";
    legend.style.borderRadius = "4px";
    legend.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";

    let legendTitle = document.createElement("h4");
    legendTitle.innerText = "Women in Parliament (%)";
    legend.appendChild(legendTitle);

    for (let i = 0; i < breaks.length - 1; i++) {
        let row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "5px";

        let colorBox = document.createElement("div");
        colorBox.style.width = "15px";
        colorBox.style.height = "15px";
        colorBox.style.backgroundColor = colors[i];
        colorBox.style.marginRight = "8px";
        row.appendChild(colorBox);

        let label = document.createElement("span");
        label.innerText = `${breaks[i]} - ${breaks[i + 1]}%`;
        row.appendChild(label);

        legend.appendChild(row);
    }

    document.body.appendChild(legend);
}
