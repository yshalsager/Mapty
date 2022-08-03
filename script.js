'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

if (navigator.geolocation) {
  /**
  `Geolocation.getCurrentPosition()`: Retrieves the device's current location.
  - It takes two parameters, a callback function to run on success and another one on failure.
  - The success callback function takes a GeolocationPosition object as its sole input parameter.
  **/
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Use destructuring to get the latitude and longitude from the position.coords object.
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
      const coords = [latitude, longitude];
      // 'map' is the id of the div where the map will be displayed
      // 'coords' is the coordinates of the map
      // 'SetView' takes two parameters: the coordinates and the zoom level of the map
      const map = L.map('map').setView(coords, 13);
      // 'L' is the Leaflet library entry point like namespace
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
      // Use 'on' method to add a click listener to the map
      map.on('click', function (mapEvent) {
        // console.log(mapEvent);
        // Use destructuring to get the latitude and longitude from the mapEvent.latlng object.
        const { lat, lng } = mapEvent.latlng;
        // Use the Leaflet library to add a marker to the map
        const marker = L.marker([lat, lng]).addTo(map).bindPopup(L.popup({
          maxWidth: 250,
          minHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup'
        })).setPopupContent("Workout").openPopup();
      });
    },
    function () { alert('Could not get your position') });
}