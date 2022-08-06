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

class Workout {
  // A parent class, that both Cycling and Running will inherit from
  date = new Date(); // ES6 class feild
  // Use current date and time to create a unique id for each workout
  // In a real-world applicaton, this would be a uuid or some other unique identifier
  id = String(Date.now()).slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    this.coords = coords; // an array of [lat, lng]
    this.distance = distance; // in kilometers
    this.duration = duration; // in minutes
  }

  _setDescription() {
    // capitalize first letter of the description is done using CSS now
    // this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
    //   months[this.date.getMonth()]
    // } ${this.date.getDate()}`;
    this.description = `${this.type} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  click() {
    // Public method to increment the number of clicks
    // This is accessible from all child classes
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence; // in rpm
    this.claculatePace();
    this._setDescription();
  }

  claculatePace() {
    // pace is in minutes per kilometer
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain; // in meters
    this.calculateSpeed();
    this._setDescription();
  }

  calculateSpeed() {
    // speed is in kilometers per hour
    this.speed = this.distance / (this.duration / 60); // duration is in minutes, so it's devided by 60 to get hours
    return this.speed;
  }
}

class App {
  #map;
  #mapEvent;
  #workouts = []; // An array of all the workouts

  constructor() {
    // Get user's position
    this._getPosition();

    // Load data from localStorage
    this._loadData();

    // Attach event listeners
    // Add an event listener to the form
    form.addEventListener('submit', this._newWorkout.bind(this));
    // Add an event listener to the form type change
    inputType.addEventListener('change', this._toggleElevationField);
    // Add an event listener to move to marker on click
    containerWorkouts.addEventListener('click', this._moveToMarker.bind(this));
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
    // render the workouts on the map
    this.#workouts.forEach(workout => this._renderWorkoutMarker(workout));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden'); // Show the form
    inputDistance.focus(); // Focus on the distance input
  }

  _hideForm() {
    // Clear form fields
    [inputDistance, inputDuration, inputCadence, inputElevation].forEach(
      input => (input.value = '')
    );
    // Hide the form
    form.classList.add('hidden');
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _isValidInput(...data) {
    return data.every(item => Number.isFinite(item));
  }
  _isPositiveNumber(...data) {
    return data.every(number => number > 0);
  }

  _newWorkout(event) {
    event.preventDefault(); // Prevent the form from submitting

    // get data from the form
    const type = inputType.value; // inputType is a select option element, value can be 'cycling' or 'running'
    const distance = +inputDistance.value; // inputDistance is a text input element, value should be converted to a number
    const duration = +inputDuration.value; // inputDuration is also a text input element, value should be converted to a number as well
    // Use destructuring to get the latitude and longitude from the mapEvent.latlng object.
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // create a new workout object
    // if workout is a running workout, create a new running workout object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // check if data is valid
      // if data is not a number, alert the user and return
      if (
        !this._isValidInput(distance, duration, cadence) ||
        !this._isPositiveNumber(distance, duration, cadence)
      )
        return alert('Inputs must be a positive number!');
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    // if workout is a cycling workout, create a new cycling workout object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !this._isValidInput(distance, duration, elevation) ||
        !this._isPositiveNumber(distance, duration)
      )
        return alert('Inputs must be a positive number!');
      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // add the workout to the workouts array
    this.#workouts.push(workout);

    // display the workout on the map as a marker
    this._renderWorkoutMarker(workout);
    // display the workout on the list
    this._renderWorkout(workout);
    // hide the form
    this._hideForm();
    // Store data in localStorage
    this._storeData();
  }

  _renderWorkoutMarker(workout) {
    // Use the Leaflet library to add a marker to the map
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minHeight: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.description} ${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} `
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>`;
    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>`;
    }
    if (workout.type === 'cycling') {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>`;
    }
    html += `</li>`;
    // insert the html as sibling of the form element
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToMarker(event) {
    // get the workout element from the clicked element
    const workoutEl = event.target.closest('.workout');
    if (!workoutEl) return;

    // find the workout in the workouts array
    const workout = this.#workouts.find(
      workout => workout.id === workoutEl.dataset.id
    );
    // move the map to the workout's marker
    this.#map.flyTo(workout.coords);
    workout.click();
    this._storeData();
  }

  _storeData() {
    // Store the workouts in localStorage as JSON string
    // LocalStorage is blocking, so only small amounts of data should be stored
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _loadData() {
    // Load workouts JSON string from localStorage
    const workouts = JSON.parse(localStorage.getItem('workouts'));
    if (!workouts) return;
    // add the workouts to the workouts array
    this.#workouts = workouts;
    // render the workouts on the list
    this.#workouts.forEach(workout => this._renderWorkout(workout));
    // After converting objects to JSON, then converting back to objects, the prototype chain is lost.
    // To fix this, we need to add the prototype chain back to the objects.
    this.#workouts.forEach(workout => {
      if (workout.type === 'running') {
        Object.setPrototypeOf(workout, Running.prototype);
      }
      if (workout.type === 'cycling') {
        Object.setPrototypeOf(workout, Cycling.prototype);
      }
    });
  }

  reset() {
    // remove workouts from localStorage
    localStorage.removeItem('workouts');
    // reload the page
    location.reload();
  }
}
const app = new App();
