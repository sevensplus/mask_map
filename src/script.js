Vue.component('store-info',{
  props:['item'],
  template:`  
    <div class="single">
    <div class='store_name'>{{item.pharmacy_name}}
    （<img class='img_adult' src='./src/asset/adult.png' /> {{item.adult}}｜<img class='img_child' src='./src/asset/child.png'/>{{item.children}}）
    </div>
    <div class='store_phone'><img class='img_phone' src='./src/asset/phone.png'/>{{ item.mobile_number }}</div>
    <div class='store_address'><img class='img_address' src='./src/asset/pin.png'/>{{ item.address }}</div>
    <div class='store_distance'>{{ item.distance }} km</div>
    <div>
  `
})
var maskmap = new Vue({
  el:"#maskmap",
  mounted:function(){
    navigator.geolocation.getCurrentPosition(sucessGet,errorGet);
  },
  data:{
    position:{
      latitude:0,
      longitude:0
    },
    stores:[]
  },
  methods:{
    moveCenter:function(lat,lng){
      this.position.latitude = lat;
      this.position.longitude = lng;
      this.getStore()
    },
    drawStore:function(){
      $('.leaflet-marker-pane > img').remove()
      $('.leaflet-popup-pane > div').remove()      
      for(let i = 0;i < 30; i ++ ){
        let item = this.stores[i];
        let str = `<div class='popbox'><img class='pop_img' src='./src/asset/pharmacy.png'/></div><div><div class='pop_title'>${item['pharmacy_name']}</div><div>${item.address}</div><div>`
        if (item.adult == 0 && item.children == 0){
          L.marker([item.latitude,item.longitude],{icon:gray_icon}).addTo(mymap).bindPopup(str);
        } else {
          L.marker([item.latitude,item.longitude],{icon:light_icon}).addTo(mymap).bindPopup(str);
        }
      }
    },
    getStore:function(){
      let url = "https://asia-east2-botfat.cloudfunctions.net/a_liff_search";
      fetch(url, {
        method:"POST",
        body:JSON.stringify({
          "action":"mask",
          "lat":this.position.latitude,
          "lng":this.position.longitude,
          "token":"oakdatech"
        }),
        headers:{
          'Content-Type':'application/json'
        }
      })
      .then( res => res.json())
      .then( res => {
        this.stores = res.result
        this.drawStore()
      })
    },
    clickStore:function(e){
      let str = `<div class='popbox'><img class='pop_img' src='./src/asset/pharmacy.png'/></div><div><div class='pop_title'>${e['pharmacy_name']}</div><div>${e.address}</div><div>`;
      var popup = L.popup()
        .setLatLng([e.latitude, e.longitude])
        .setContent(str)
        .openOn(mymap)
        mymap.panTo([e.latitude,e.longitude])
    }
  }
})

// draw map
var mymap;
let icons = L.Icon.extend({});
let light_icon = new icons({iconUrl:'./src/asset/icon.png'});
let gray_icon = new icons({iconUrl:'./src/asset/gray_icon.png'});
function sucessGet(current){
  initial(current.coords.latitude,current.coords.longitude);
};
function errorGet(){
  initial(25.0291, 121.557)
};
function initial(lat,lng){
  mymap = L.map('map').setView([lat,lng], 15);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken:'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
  }).addTo(mymap);
  maskmap.moveCenter(lat,lng);
  mymap.on('dragend',function(){
    let locate = mymap.getCenter();
    maskmap.moveCenter(locate.lat,locate.lng);
  });
};
