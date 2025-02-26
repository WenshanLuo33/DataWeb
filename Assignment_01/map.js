mapboxgl.accessToken = "pk.eyJ1Ijoid2VuMyIsImEiOiJjbTZpZGk0dDYwNnhqMm1vaGNtc2pyc29pIn0.R1YUPm_wlHzWpnWvsp8dIQ";

const map = new mapboxgl.Map({
    container: "map", // ✅ 添加逗号
    style: "mapbox://styles/wen3/cm6q2kgh700xi01qq9nlq2i76", // ✅ 添加逗号
    zoom: 10,
    center: [-74, 40.725]
});
