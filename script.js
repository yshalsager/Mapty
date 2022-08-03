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

class App {
  #map;
  #mapEvent;

  constructor() {
    this._getPosition();
    // Add an event listener to the form
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Add an event listener to the form type change
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      /**
      `Geolocation.getCurrentPosition()`: Retrieves the device's current location.
      - It takes two parameters, a callback function to run on success and another one on failure.
      - The success callback function takes a GeolocationPosition object as its sole input parameter.
      **/
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your position');
        }
      );
    }
  }

  _loadMap(position) {
    // Use destructuring to get the latitude and longitude from the position.coords object.
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    const coords = [latitude, longitude];
    // 'map' is the id of the div where the map will be displayed
    // 'coords' is the coordinates of the map
    // 'SetView' takes two parameters: the coordinates and the zoom level of the map
    this.#map = L.map('map').setView(coords, 13);
    // 'L' is the Leaflet library entry point like namespace
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap',
    }).addTo(this.#map);
    // Use 'on' method to add a click listener to the map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden'); // Show the form
    inputDistance.focus(); // Focus on the distance input
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(event) {
    event.preventDefault(); // Prevent the form from submitting
    // Clear form fields
    [inputDistance, inputDuration, inputCadence, inputElevation].forEach(
      input => (input.value = '')
    );
    // console.log(mapEvent);
    // Use destructuring to get the latitude and longitude from the mapEvent.latlng object.
    const { lat, lng } = this.#mapEvent.latlng;
    // Use the Leaflet library to add a marker to the map
    const marker = L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: 'running-popup',
        })
      )
      .setPopupContent('Workout')
      .openPopup();
  }
}

const app = new App();
