'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; // [lat,lng]
    this.distance = distance; //in km
    this.duration = duration; //in mins
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    //km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);

///////ss
//Application Architectures

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
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          //error cb
          alert('Could not get position');
        }
      );
    }
  }

  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(`https://www.google.com/maps/@${latitude},${longitude},13z`);

    //when we get the coords we want to display the map
    const coords = [latitude, longitude];
    console.log(`this`, this);
    this.#map = L.map('map').setView(coords, 13);
    //   console.log(map);
    L.tileLayer('https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    L.marker(coords)
      .addTo(this.#map)
      .bindPopup('A pretty CSS popup.<br> Easily customizable.')
      .openPopup();

    //whenever we click on the map this event happens
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    //Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //Check if data is valid

    //If activity is running, create running object
    if (type === 'running') {
      const cadance = +inputCadence.value;
      //Check if data is valid
      if (
        !validInputs(duration, distance, cadance) ||
        !allPositive(duration, distance, cadance)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Running([lat, lng], duration, distance, cadance);
    }

    //If activity is cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      //Check if data is valid
      if (
        !validInputs(duration, distance, elevation) ||
        !allPositive(duration, distance)
      )
        return alert('Inputs have to be positive numbers');

      workout = new Cycling([lat, lng], duration, distance, elevation);
    }

    //add new object to workout array
    this.#workouts.push(workout);
    console.log(`workout array`, this.#workouts);
    //render workout on map as marker
    this.renderWorkoutMarker(workout);
    //render workout on list

    //Hide + Clear input fields
    inputDistance.value = 66;
    inputDuration.value = inputCadence.value = inputElevation.value = '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`workout`)
      .openPopup();
  }
}

const app = new App();

//check whether the browser has geolocation API access
