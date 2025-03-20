mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/wen3/cm7chskzi001a01qs14y68nb7",
    center: [0, 20],
    zoom: 2,
    minZoom: 1.2,
    maxZoom: 3.5
});

// ✅ 添加地图控件
map.addControl(new mapboxgl.NavigationControl());

// ✅ 先加载 GeoJSON 数据，然后初始化地图
fetch('https://wenshanluo33.github.io/DataWeb/Assignment_03Adjustment/Map01/data/women_in_parliament.geojson')
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
  })
  .then(data => {
      console.log("✅ GeoJSON 数据成功加载:", data);

      // ✅ **固定 `maxValue = 100`，`minValue = 0`**
      const minValue = 0;
      const maxValue = 100;

      map.on("load", function () {
          console.log("✅ Map Loaded Successfully");

          // ✅ 只添加一次 `map.addSource()`
          map.addSource("women-parliament-data", {
              type: "geojson",
              data: data
          });

          // ✅ 线性渐变颜色映射
          map.addLayer({
              id: "women-parliament-layer",
              type: "fill",
              source: "women-parliament-data",
              filter: [">", ["to-number", ["get", "Lower chamber female legislators (aggregate: average)"]], 0],
              paint: {
                  "fill-color": [
                      "interpolate",
                      ["linear"],
                      ["to-number", ["get", "Lower chamber female legislators (aggregate: average)"]],
                      minValue, "#f2f0f7",  // 低值（浅紫色）
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

          // ✅ **确保 `country-label` 在最上方**
          setTimeout(() => {
              const style = map.getStyle();
              console.log("📌 Mapbox Style Loaded", style);

              // 🔍 **动态查找可能的 `country-label` 图层**
              const countryLabelLayer = style.layers.find(layer => 
                  layer.id.includes("country") && layer.type === "symbol"
              );

              if (countryLabelLayer) {
                  console.log(`🟢 找到国家标签层: ${countryLabelLayer.id}`);
                  map.moveLayer(countryLabelLayer.id);
              } else {
                  console.warn("⚠️ 未找到 `country-label` 相关图层，可能样式不同。");
              }
          }, 1000); // 等待 1 秒，确保 Mapbox 样式加载完成
          

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

      }); // ✅ 正确闭合 `map.on("load", function () {...})`
  })
  .catch(error => console.error('❌ 加载 GeoJSON 失败:', error)); // ✅ 正确闭合 `.then(data => {...})`
