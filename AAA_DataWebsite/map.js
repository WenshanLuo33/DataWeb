var initLoad = true;

// 📍 新增：照片Marker的点数据
const photoMarkers = [
  {
    coordinates: [-73.82647152215306, 40.760448022111774],
    imageUrl: "images/queens.png"
  },
  {
    coordinates: [-73.87354647981691, 40.74362507645736],
    imageUrl: "images/queens2.png"
  },
  {
    coordinates: [-73.91275698297525, 40.7439662409659],
    imageUrl: "images/queens3.png"
  },
  {
    coordinates: [-73.99562843018781, 40.71174862038325],
    imageUrl: "images/manhattan.png"
  },
  {
    coordinates: [-74.011063135813, 40.72291684926719],
    imageUrl: "images/manhattan2.png"
  },
  {
    coordinates: [-74.00504242159579, 40.75290025691971],
    imageUrl: "images/manhattan3.png"
  },
  {
    coordinates: [-74.01276890920732, 40.63951028805934],
    imageUrl: "images/Brooklyn.png"
  },
  {
    coordinates: [-73.9526703840298, 40.70256381744758],
    imageUrl: "images/brooklyn2.png"
  },
  {
    coordinates: [-73.96019008535762, 40.76403077522584],
    imageUrl: "images/manhattan4.png"
  },
  {
    coordinates: [-73.93910534190128, 40.8127972392416],
    imageUrl: "images/manhattan5.png"
  },
  {
    coordinates: [-73.90705976896467, 40.815200711941095],
    imageUrl: "images/bronx.png"
  }
];

// 📍 简单管理所有插入的照片Marker
let photoMarkerList = [];

function addPhotoMarkers() {
  photoMarkers.forEach(item => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      backgroundImage: `url(${item.imageUrl})`,
      width: '70px',
      height: '70px',
      backgroundSize: 'cover',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      border: '2px solid white',
    });
    el.className = 'photo-marker'; // 默认是透明的

    const marker = new mapboxgl.Marker(el)
      .setLngLat(item.coordinates)
      .addTo(map);

    photoMarkerList.push(marker);
  });
}

function removePhotoMarkers() {
  photoMarkerList.forEach(marker => marker.remove());
  photoMarkerList = [];
}


function setupPrinceFlatScroll() {
  const image = document.getElementById('prince-flat-image');
  const container = document.getElementById('prince-flat-container');

  if (!image || !container) return;

  window.addEventListener('scroll', () => {
    const rect = container.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const containerHeight = container.offsetHeight;

    const start = windowHeight;  
    const end = -containerHeight; 

    const totalScrollDistance = start - end;
    const currentScroll = start - rect.top;

    let scrollProgress = currentScroll / totalScrollDistance;
    scrollProgress = Math.min(Math.max(scrollProgress, 0), 1); 

    // 👉 加一段 延迟触发
    const delay = 0.2; // 30% 滑动前不动

    if (scrollProgress < delay) {
      // 👇 还没到起步点，保持初始状态
      image.style.transform = `translate(-50%, -50%) scale(1) rotate(0deg)`;
    } else {
      // 👇 到了起步点以后才开始放大旋转
      const effectiveProgress = (scrollProgress - delay) / (1 - delay); // 重新归一化到0~1
      const scale = 1 + effectiveProgress * 2.5;  
      const rotate = effectiveProgress * 198;       
      const offsetX = effectiveProgress * 350;  // 最后往右平移30px
      image.style.transform = `translate(calc(-50% + ${offsetX}px), -50%) scale(${scale}) rotate(${rotate}deg)`;
      
    }
  });
}





function fadeInPrinceFlatImage() {
  const flatImg = document.getElementById("prince-flat-image");
  if (flatImg) {
    flatImg.style.opacity = 1;
  }
  const mapDiv = document.getElementById("map");
  if (mapDiv) {
    mapDiv.style.display = "none"; // 🔥 彻底隐藏map
    setupPrinceFlatScroll();
  }
}
function fadeOutPrinceFlatImage() {
  const flatImg = document.getElementById("prince-flat-image");
  if (flatImg) {
    flatImg.style.opacity = 0;
  }
}

function fadeInLongScrollImage() {
  const longImg = document.getElementById("long-scroll-image");
  if (longImg) {
    longImg.style.opacity = 1;
  }
}

function fadeOutLongScrollImage() {
  const longImg = document.getElementById("long-scroll-image");
  if (longImg) {
    longImg.style.opacity = 0;
  }
}

function showMap() {
  const mapDiv = document.getElementById("map");
  if (mapDiv) {
    mapDiv.style.display = "block";
  }
}





/* Create two variables that will hold:
1. The different types of layers available to Mapbox and their
respective opacity attributes.
2. The possible alignments which could be applied to the vignettes.*/
var layerTypes = {
  fill: ["fill-opacity"],
  line: ["line-opacity"],
  circle: ["circle-opacity", "circle-stroke-opacity"],
  symbol: ["icon-opacity", "text-opacity"],
  raster: ["raster-opacity"],
  "fill-extrusion": ["fill-extrusion-opacity"],
  heatmap: ["heatmap-opacity"],
};

var alignments = {
  left: "lefty",
  center: "centered",
  right: "righty",
  full: "fully",
};

let truckPopupEnabled = false;


function getLayerPaintType(layerId) {
  const layer = map.getLayer(layerId);
  if (!layer) {
    console.warn("No layer found for ID:", layerId);
    return [];
  }

  const type = layer.type;
  switch (type) {
    case "fill":
      return ["fill-opacity"];
    case "line":
      return ["line-opacity"];
    case "circle":
      return ["circle-opacity"];
    case "symbol":
      return ["icon-opacity", "text-opacity"];   // ✅ 新增
    case "raster":
      return ["raster-opacity"];
    case "fill-extrusion":
      return ["fill-extrusion-opacity"];
    case "heatmap":
      return ["heatmap-opacity"];
    case "hillshade":
      return ["hillshade-opacity"];
    default:
      return [];
  }
}

function setLayerOpacity(layer) {
  if (!map.getLayer(layer.layer)) {
    console.warn(`⚠️ Layer ${layer.layer} not found, skipping opacity change`);
    return;
  }
  const paintProps = getLayerPaintType(layer.layer);

  paintProps.forEach(function (prop) {
    var options = {};
    if (layer.duration) {
      var transitionProp = prop + "-transition";
      options = { duration: layer.duration };
      map.setPaintProperty(layer.layer, transitionProp, options);
    }
    map.setPaintProperty(layer.layer, prop, layer.opacity, options);
  });
}



/* Next, these variables and functions create the story and vignette html
elements, and populate them with the content from the config.js file.
They also assign a css class to certain elements, also based on the
config.js file */
var story = document.getElementById("story");
var features = document.createElement("div");
var header = document.createElement("div");
features.setAttribute("id", "features");

// If the content exists, then assign it to the 'header' element
// Note how each one of these are assigning 'innerHTML'
if (config.topTitle) {
  var topTitle = document.createElement("div");
  topTitle.innerHTML = config.topTitle;
  header.appendChild(topTitle);
}
if (config.title) {
  var titleText = document.createElement("div");
  titleText.innerHTML = config.title;
  header.appendChild(titleText);
}
if (config.subtitle) {
  var subtitleText = document.createElement("div");
  subtitleText.innerHTML = config.subtitle;
  header.appendChild(subtitleText);
}
if (config.byline) {
  var bylineText = document.createElement("div");
  bylineText.innerHTML = config.byline;
  header.appendChild(bylineText);
}
if (config.description) {
  var descriptionText = document.createElement("div");
  descriptionText.innerHTML = config.description;
  header.appendChild(descriptionText);
}

// If after this, the header has anything in it, it gets appended to the story
if (header.innerText.length > 0) {
  header.classList.add(config.theme);
  header.setAttribute("id", "header");
  story.appendChild(header);
}

/* After building the elements and assigning content to the header these
functions will loop through the chapters in the config.js file,
create the vignette elements and assign them their respective content */
config.chapters.forEach((record, idx) => {
  /* These first two variables will hold each vignette, the chapter
  element will go in the container element */
  var container = document.createElement("div");
  var chapter = document.createElement("div");
  // Adds a class to the vignette
  chapter.classList.add("br3");
  // Adds all the content to the vignette's div
  chapter.innerHTML = record.chapterDiv;
  // Sets the id for the vignette and adds the step css attribute
  container.setAttribute("id", record.id);
  container.classList.add("step");
  // If the chapter is the first one, set it to active
  if (idx === 0) {
    container.classList.add("active");
  }
  // Adds the overall theme to the chapter element
  chapter.classList.add(config.theme);
  /* Appends the chapter to the container element and the container
  element to the features element */
  container.appendChild(chapter);
  container.classList.add(alignments[record.alignment] || "centered");
  if (record.hidden) {
    container.classList.add("hidden");
  }
  features.appendChild(container);
});

// Appends the features element (with the vignettes) to the story element
story.appendChild(features);

/* Next, this section creates the footer element and assigns it
its content based on the config.js file */
var footer = document.createElement("div");

if (config.footer) {
  var footerText = document.createElement("p");
  footerText.innerHTML = config.footer;
  footer.appendChild(footerText);
}

if (footer.innerText.length > 0) {
  footer.classList.add(config.theme);
  footer.setAttribute("id", "footer");
  story.appendChild(footer);
}

// Adds the Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

/* This section creates the map element with the
attributes from the main section of the config.js file */
var map = new mapboxgl.Map({
  container: "map",
  style: config.style,
  center: config.chapters[0].location.center,
  zoom: config.chapters[0].location.zoom,
  bearing: config.chapters[0].location.bearing,
  pitch: config.chapters[0].location.pitch,
  interactive: false,
  projection: config.projection,
});

// Create a inset map if enabled in config.js
if (config.inset) {
  map.addControl(
    new GlobeMinimap({ ...config.insetOptions }),
    config.insetPosition
  );
}

if (config.showMarkers) {
  var marker = new mapboxgl.Marker({ color: config.markerColor });
  marker.setLngLat(config.chapters[0].location.center).addTo(map);
}

// instantiate the scrollama
var scroller = scrollama();

/* Here we add the two extra layers we are using, just like in our previous
tutorial. At the end, however, we setup the functions that will tie the
scrolling to the chapters and move the map from one location to another
while changing the zoom level, pitch and bearing */
map.on("load", function () {
  if (config.use3dTerrain) {
    map.addSource("mapbox-dem", {
      type: "raster-dem",
      url: "mapbox://styles/wen3/cm9g592vs00ho01qkgjqf8f12",
      tileSize: 512,
      maxzoom: 14,
    });
    // add the DEM source as a terrain layer with exaggerated height
    map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    // add a sky layer that will show when the map is highly pitched
    map.addLayer({
      id: "sky",
      type: "sky",
      paint: {
        "sky-type": "atmosphere",
        "sky-atmosphere-sun": [0.0, 0.0],
        "sky-atmosphere-sun-intensity": 15,
      },
    });
  }

  map.addLayer({
    id: "truckRouteLines",
    type: "line",
    source: {
      type: "geojson",
      data: "data/truckroute.geojson"
    },
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": [
        "interpolate",
        ["linear"],
        ["get", "ENTRIES_DIFF"],
        -1, "#ff4400",
        -0.7, "#ffba31",
        -0.4, "#ffffff"
      ],
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 1,
        14, 5
      ],
      "line-opacity": 0,
      "line-blur": 0.2,
      "line-offset": 0 // 也可以设置为正值向右偏移
    }
  }, "road-label-simple");


  map.addLayer({
    id: "warehouseBefore2020",
    type: "circle",
    source: {
      type: "geojson",
      data: "data/warehouse.geojson"
    },
    filter: [
      "all",
      ["<", ["coalesce", ["to-number", ["get", "Year Built"]], 0], 2020],
      ["!=", ["get", "State"], "NJ"]
    ],
    paint: {
      "circle-color": "#718BBF",
      "circle-opacity": 0,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 0.3,
      "circle-stroke-opacity": 0,
      "circle-radius": [
        "interpolate", ["linear"],
        ["coalesce", ["to-number", ["get", "RBA"]], 0],
        100000, 3,
        300000, 5,
        500000, 9
      ]
    }
  });
  
  
  map.addLayer({
    id: "warehouse2020after",
    type: "circle",
    source: {
      type: "geojson",
      data: "data/warehouse.geojson"
    },
    filter: [
      "all",
      [">=", ["coalesce", ["to-number", ["get", "Year Built"]], 0], 2020],
      ["!=", ["get", "State"], "NJ"]
    ],
    paint: {
      "circle-color": "#FFA500",
      "circle-opacity": 0,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 0.3,
      "circle-stroke-opacity": 0,
      "circle-radius": [
        "interpolate", ["linear"],
        ["coalesce", ["to-number", ["get", "RBA"]], 0],
        100000, 3,
        300000, 5,
        500000, 9
      ]
    }
  });
  

  map.loadImage("images/warehouse-marker.png", function(error, image) {
    if (error) throw error;
    map.addImage("warehouse-icon", image);

  map.addLayer({
    id: "warehouseAll",
    type: "symbol",
    source: {
      type: "geojson",
      data: "data/warehouse.geojson"
    },
    layout: {
      "icon-image": "warehouse-icon",
      "icon-size": 0.008,
      "icon-allow-overlap": true,
      "icon-opacity": 0
    },
    paint: {
      "icon-opacity": 0},
    filter: ["!=", ["get", "State"], "NJ"] 
  });
  map.moveLayer("warehouseAll");
});

// 加载 warehouse geojson 数据并生成合并后的 buffer 区域
fetch("data/warehouse.geojson")
  .then(res => res.json())
  .then(data => {
    // 过滤掉 State 为 NJ 的
    const filteredFeatures = data.features.filter(f => f.properties.State !== "NJ");
    const featureCollection = {
      type: "FeatureCollection",
      features: filteredFeatures
    };

    // 使用 turf 创建 buffer（单位是公里）
    const buffered = turf.buffer(featureCollection, 0.7, { units: "kilometers" });

    // 使用 reduce 合并所有 buffer 面
    let dissolved = buffered.features[0];
    for (let i = 1; i < buffered.features.length; i++) {
      try {
        dissolved = turf.union(dissolved, buffered.features[i]);
      } catch (e) {
        console.warn(`无法合并第 ${i} 个 buffer`, e);
      }
    }

    // 添加合并后的 buffer 图层
    map.addSource("warehouseAllBuffer", {
      type: "geojson",
      data: dissolved
    });

    map.addLayer({
      id: "warehouseAllBufferFill",
      type: "fill",
      source: "warehouseAllBuffer",
      paint: {
        "fill-color": "#47261E",
        "fill-opacity": 0
      }
    });

    map.addLayer({
      id: "warehouseAllBufferOutline",
      type: "line",
      source: "warehouseAllBuffer",
      paint: {
        "line-color": "#000000",
        "line-width": 0.9,
        "line-opacity": 0
      }
    });
    map.moveLayer("warehouseAllBufferFill");
    map.moveLayer("warehouseAllBufferOutline");
  });

  map.addLayer({
    id: "truckAADT-heatmap",
    type: "heatmap",
    source: {
      type: "geojson",
      data: "data/truck_aadt.geojson"
    },
    maxzoom: 15,
    paint: {
      // 热力图颜色
      "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0, "rgba(255, 255, 204, 0)",
        0.2, "rgba(255, 237, 160, 0.6)",
        0.4, "rgba(254, 217, 118, 0.8)",
        0.6, "rgba(254, 178, 76, 0.9)",
        0.8, "rgba(253, 141, 60, 0.95)",
        1, "rgba(240, 59, 32, 1)"
      ],
      // 热力图强度按 AADT 数值加权
      "heatmap-weight": [
        "interpolate",
        ["linear"],
        ["coalesce", ["to-number", ["get", "AADT"]], 0],
        0, 0,
        50000, 1
      ],
      // 热力图半径
      "heatmap-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0, 2,
        10, 20
      ],
      // 整体透明度
      "heatmap-opacity": 0
    }
  });
  
  
  map.addLayer({
    id: "industrialZones",
    type: "fill",
    source: {
      type: "geojson",
      data: "data/landuse_06.geojson"
    },
    paint: {
      "fill-color": "#563E60",
      "fill-opacity": 0,
      "fill-outline-color": "#404040"
    }
  });
  
  

  map.addLayer(
    {
      id: "medianIncome",
      type: "fill",
      source: {
        type: "geojson",
        data: "data/medianIncome.geojson",
      },
      filter: ["<", ["get", "MHHI"], 36577],
      paint: {
        "fill-color": "#ED1111",
        "fill-opacity": 0,
        "fill-outline-color": "#ED1111"
      }
    },
    "waterway"
  );

  map.addLayer({
    id: "communityOfColor",
    type: "circle",
    source: {
      type: "geojson",
      data: "data/community_of_color_with_density.geojson"
    },
    filter: ["!=", ["get", "race"], "White"],  // 👈 只显示非 White
    paint: {
      "circle-radius": 1,
      "circle-color": [
        "interpolate",
        ["linear"],
        ["get", "neighbors"],
        0, "#FFFFFF",
        3, "#FFFFFF",
        7, "#FFFFFF",  
        100, "#48709B", 
        110, "#1E548E"  
      ],
      "circle-opacity": 0,
    }
  });

  map.addLayer({
    id: "comments-layer",
    type: "circle",
    source: {
      type: "geojson",
      data: "data/comments.geojson"
    },
    paint: {
      "circle-radius": 6,
      "circle-color": [
        "match",
        ["get", "marker_icon_alt"],
        
        // 🫁 Public Health
        "Health & Environmental Impact", "#8390CA",
  
        // 🛡️ Safety Issues
        "Observed Pedestrian and Truck Conflict", "#C0E0DB",
        "Observed Bicyclist and Truck Conflict", "#C0E0DB",
        "Narrow Roadway", "#C0E0DB",
  
        // 🚛 Truck Traffic & Misbehavior
        "Weight & Height Restriction", "#fed9be",
        "Missing Truck Route Signage", "#fed9be",
        "Confusing Truck Route Signage", "#fed9be",
        "Difficult Truck Turn", "#fed9be",
        "Speeding Trucks", "#fed9be",
        "Maintenance Needed", "#fed9be",
        "Limited Curb Access for Trucks", "#fed9be",
        "Limited Truck Parking", "#fed9be",
        "Poor Truck Network Connections", "#fed9be",
  
        // 其他默认
        "#999999"
      ],
      "circle-opacity": 0, // 初始隐藏，滚动到章节时打开
      "circle-stroke-opacity": 0
    }
  });

  

  map.addSource('flushing-warehouse', {
    type: 'geojson',
    data: 'data/flushingwarehouse.geojson' // 确保你把文件放在 data/ 文件夹
  });

  // 📍 添加立体小楼图层，初始时隐藏
  map.addLayer({
    id: 'flushing-warehouse-layer',
    type: 'fill-extrusion',
    source: 'flushing-warehouse',
    layout: {},
    paint: {
      'fill-extrusion-color': '#965AA4', // 金色小楼
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0  // 初始时隐藏
    }
  });

  map.addSource('flushing-housing', {
    type: 'geojson',
    data: 'data/flushing-housing.geojson'
  });
  
  map.addLayer({
    id: 'flushing-housing-layer',
    type: 'fill-extrusion',
    source: 'flushing-housing',
    layout: {},
    paint: {
      'fill-extrusion-color': '#FBAC1C', // 深天蓝色 housing
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': ['get', 'min_height'],
      'fill-extrusion-opacity': 0  // 初始状态也隐藏
    }
  });

// 📍 添加 Prince Street 高亮线
map.addSource('prince-street-highlight', {
  type: 'geojson',
  data: 'data/prince_street.geojson'
});

map.addLayer({
  id: 'prince-street-fill',
  type: 'fill',
  source: 'prince-street-highlight',  // 你的geojson source
  paint: {
    'fill-color': '#E5173A',    
    'fill-opacity': 0         
  }
});
map.addLayer({
  id: 'prince-street-outline',
  type: 'line',
  source: 'prince-street-highlight',
  paint: {
    'line-color': '#000000',   
    'line-width': 1,           
    'line-opacity': 0     
  }
});


  // 📍 添加立体建筑图层
map.addLayer(
  {
    id: "3d-buildings",
    source: "composite",
    "source-layer": "building",
    filter: ["==", "extrude", "true"],
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-color": "#aaa",
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 0,
        15, ["get", "height"]
      ],
      "fill-extrusion-base": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 0,
        15, ["get", "min_height"]
      ],
      "fill-extrusion-opacity": 0.6
    }
  },
  'waterway-label' // 插入到这个图层下面
);
  

  map.moveLayer("truckRouteLines"); // 可以视情况放更低
  map.moveLayer("medianIncome");
  map.moveLayer("industrialZones");
  map.moveLayer("truckAADT-heatmap");
  map.moveLayer("warehouseBefore2020");
  map.moveLayer("warehouse2020after");
  map.moveLayer("communityOfColor");
  map.moveLayer("warehousePM25");



  // setup the instance, pass callback functions
  scroller
    .setup({
      step: ".step",
      offset: 0.5,
      progress: true,
    })
    
    .onStepEnter(async (response) => {
      var current_chapter = config.chapters.findIndex(
        (chap) => chap.id === response.element.id
      );
      var chapter = config.chapters[current_chapter];

      response.element.classList.add("active");
      map[chapter.mapAnimation || "flyTo"](chapter.location);

      if (config.showMarkers) {
        marker.setLngLat(chapter.location.center);
      }

      if (chapter.onChapterEnter.length > 0) {
        chapter.onChapterEnter.forEach(item => {
          if (item.layer) {
            setLayerOpacity(item);
          } else if (item.callback && typeof window[item.callback] === 'function') {
            window[item.callback]();
          }
        });
      }      

      if (chapter.id === "long-scroll") {
        const person = document.getElementById('floating-person');
        if (person) {
          person.style.display = 'block';  // ✅ 滑到 long-scroll 时出现
        }
        observeFloatingItems();  // ✅ 这里触发监听
      }      

      if (chapter.callback) {
        window[chapter.callback]();
      }
      if (chapter.rotateAnimation) {
        map.once("moveend", () => {
          const rotateNumber = map.getBearing();
          map.rotateTo(rotateNumber + 180, {
            duration: 30000,
            easing: function (t) {
              return t;
            },
          });
        });
      }
      if (config.auto) {
        var next_chapter = (current_chapter + 1) % config.chapters.length;
        map.once("moveend", () => {
          document
            .querySelectorAll(
              '[data-scrollama-index="' + next_chapter.toString() + '"]'
            )[0]
            .scrollIntoView();
        });
      }
    })


    .onStepExit((response) => {
      var chapter = config.chapters.find(
        (chap) => chap.id === response.element.id
      );
      response.element.classList.remove("active");
    
      if (chapter.id === "long-scroll") {
        const person = document.getElementById('floating-person');
        if (person) {
          person.style.display = 'none';  // ✅ 离开 long-scroll 时隐藏
        }
      }
      
      if (chapter.onChapterExit.length > 0) {
        chapter.onChapterExit.forEach(item => {
          if (item.layer) {
            setLayerOpacity(item);
          } else if (item.callback && typeof window[item.callback] === 'function') {
            window[item.callback]();
          }
        });
      }
    });
    

  if (config.auto) {
    document.querySelectorAll('[data-scrollama-index="0"]')[0].scrollIntoView();
  }
});





// 鼠标悬停弹出 Popup：显示 Owner Name、PropertyID、PM2.5

map.on('mouseenter', 'warehousePM25', (e) => {
  map.getCanvas().style.cursor = 'pointer';

  const props = e.features[0].properties;
  const owner = props["Owner Name"] || "Unknown";
  const id = props["PropertyID"] || "N/A";
  const pm25 = props["RAW_E_PM25"] || "N/A";

  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  })
  .setLngLat(e.lngLat)
  .setHTML(
    `<strong>${owner}</strong><br/>
     ID: ${id}<br/>
     PM2.5: ${pm25}`
  )
  .addTo(map);

  // 把 popup 存一下（便于退出时关闭）
  map._pm25Popup = popup;
});

map.on('mouseleave', 'warehousePM25', () => {
  map.getCanvas().style.cursor = '';
  if (map._pm25Popup) {
    map._pm25Popup.remove();
    map._pm25Popup = null;
  }
});

// 📍 让小视频、小图片滑到时出现，滑走时消失
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    } else {
      entry.target.classList.remove('visible');
    }
  });
}, {
  threshold: 0.4  // 露出40%就触发
});

// 观察所有的 scroll-item
document.querySelectorAll('.scroll-item').forEach(item => {
  observer.observe(item);
});


function showWhiteBackground() {
  const mapDiv = document.getElementById("map");
  if (mapDiv) {
    mapDiv.style.display = "none";
  }
}

function observeFloatingItems() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.4  // 元素露出 40% 就触发
  });

  document.querySelectorAll('.scroll-item').forEach(item => {
    observer.observe(item);
  });
}

// ✅ 动态设置 #long-scroll-container 的高度为 flushingstreet.png 的真实高度
window.addEventListener('load', () => {
  const longImg = document.getElementById('long-scroll-image');
  const container = document.getElementById('long-scroll-container');

  if (longImg && container) {
    // 图片加载完成后获取高度
    longImg.onload = () => {
      container.style.height = longImg.naturalHeight + 'px';
    };

    // 如果图片已经被缓存（即刷新页面时已经加载完）
    if (longImg.complete) {
      container.style.height = longImg.naturalHeight + 'px';
    }
  }
});

window.addEventListener('load', () => {
  const container = document.getElementById('long-scroll-container');
  const longImg = document.getElementById('long-scroll-image');

  if (container && longImg) {
    function setContainerHeight() {
      const height = longImg.naturalHeight;
      if (height && height > 0) {
        container.style.height = height + 'px';
      }
    }

    // 尝试立即设置
    setContainerHeight();

    // 图片加载完成后再次设置
    longImg.onload = () => setContainerHeight();

    // 防止缓存绕过 onload 的情况
    if (longImg.complete) setContainerHeight();
  }
});