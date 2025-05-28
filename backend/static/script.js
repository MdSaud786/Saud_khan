// document.addEventListener('DOMContentLoaded', () => {
//     // 1. Get DOM Elements
//     const darkModeToggle = document.getElementById('darkModeToggle');
//     const cityInput = document.getElementById('cityInput');
//     const searchBtn = document.getElementById('searchBtn');

//     // Main display containers (Reverted to original IDs)
//     const loadingDiv = document.getElementById('loading');
//     const errorDisplay = document.getElementById('errorDisplay');
//     const weatherDisplay = document.getElementById('weatherDisplay'); // Main weather card
//     const predictionDisplay = document.getElementById('predictionDisplay'); // Prediction card
//     const predictedTempP = document.getElementById('predictedTemp');
//     const forecastDisplay = document.getElementById('forecastDisplay'); // Daily forecast section
//     const dailyForecastContainer = document.getElementById('dailyForecastContainer'); // Container for daily cards

//     const BACKEND_URL = ''; // Empty string for Render deployment

//     // Helper functions
//     const showElement = (element, displayType = 'block') => { // Default to 'block' for general divs
//         if (element) element.style.display = displayType;
//     };
//     const hideElement = (element) => {
//         if (element) element.style.display = 'none';
//     };

//     const showError = (message) => {
//         hideElement(loadingDiv);
//         hideElement(weatherDisplay);
//         hideElement(predictionDisplay);
//         hideElement(forecastDisplay);
//         showElement(errorDisplay);
//         errorDisplay.querySelector('p').textContent = `Error: ${message}`;
//         searchBtn.disabled = false;
//         searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather & Predict';
//     };

//     // --- Dark Mode Toggle Logic ---
//     const currentTheme = localStorage.getItem('theme');
//     if (currentTheme) {
//         document.documentElement.setAttribute('data-theme', currentTheme);
//         if (currentTheme === 'dark') {
//             darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon'); // Start with sun, change to moon if dark
//         } else {
//             darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Start with moon, change to sun if light
//         }
//     } else {
//         // Default to dark mode as per preferred UI
//         document.documentElement.setAttribute('data-theme', 'dark');
//         localStorage.setItem('theme', 'dark');
//         darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon'); // Ensure moon icon is shown for default dark mode
//     }

//     darkModeToggle.addEventListener('click', () => {
//         let theme = document.documentElement.getAttribute('data-theme');
//         if (theme === 'dark') {
//             document.documentElement.setAttribute('data-theme', 'light');
//             localStorage.setItem('theme', 'light');
//             darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
//         } else {
//             document.documentElement.setAttribute('data-theme', 'dark');
//             localStorage.setItem('theme', 'dark');
//             darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
//         }
//     });

//     // --- Weather Fetching Logic ---
//     searchBtn.addEventListener('click', fetchWeatherData);
//     cityInput.addEventListener('keypress', (event) => {
//         if (event.key === 'Enter') {
//             fetchWeatherData();
//         }
//     });

//     async function fetchWeatherData() {
//         const city = cityInput.value.trim();
//         if (!city) {
//             showError('Please enter a city name.');
//             return;
//         }

//         // Clear previous displays and show loading
//         hideElement(errorDisplay);
//         hideElement(weatherDisplay);
//         hideElement(predictionDisplay);
//         hideElement(forecastDisplay);
//         showElement(loadingDiv);
//         searchBtn.disabled = true;
//         searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';

//         let currentHumidity = null;
//         let currentPressure = null;
//         let currentWindSpeed = null;

//         try {
//             // --- Fetch Current Weather & Forecast Data ---
//             const weatherResponse = await fetch(`${BACKEND_URL}/weather?city=${encodeURIComponent(city)}`);
//             const weatherData = await weatherResponse.json();

//             if (weatherResponse.ok) {
//                 displayWeatherData(weatherData); // Display current weather and daily forecast

//                 // Extract current weather parameters for prediction
//                 if (weatherData.current_weather) {
//                     currentHumidity = weatherData.current_weather.humidity;
//                     currentPressure = weatherData.current_weather.pressure;
//                     currentWindSpeed = weatherData.current_weather.wind_speed;
//                 }

//                 // --- Fetch Predicted Temperature (only if current weather data is available) ---
//                 // No city parameter sent for prediction to avoid "Unknown city" warning
//                 if (currentHumidity !== null && currentPressure !== null && currentWindSpeed !== null) {
//                     await fetchPredictedTemperature(currentHumidity, currentPressure, currentWindSpeed);
//                 } else {
//                     console.warn("Missing current weather data for prediction. Cannot fetch prediction.");
//                     predictedTempP.textContent = "Prediction N/A: Required weather data missing.";
//                     showElement(predictionDisplay, 'block'); // Show prediction section with error
//                 }

//             } else {
//                 showError(weatherData.error || 'Something went wrong while fetching weather data.');
//             }
//         } catch (error) {
//             console.error('Error in fetching data:', error);
//             showError('Could not connect to the server or an unexpected error occurred.');
//             predictedTempP.textContent = "Prediction N/A: Network or server error.";
//             showElement(predictionDisplay, 'block'); // Show prediction section with error
//         } finally {
//             hideElement(loadingDiv);
//             searchBtn.disabled = false;
//             searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather & Predict';
//         }
//     }

//     // fetchPredictedTemperature function (no city parameter, same as previous update)
//     async function fetchPredictedTemperature(humidity, pressure, wind_speed) {
//         try {
//             const predictResponse = await fetch(`${BACKEND_URL}/predict_temperature?humidity=${humidity}&pressure=${pressure}&wind_speed=${wind_speed}`);
//             const predictData = await predictResponse.json();

//             if (predictResponse.ok) {
//                 predictedTempP.textContent = `${predictData.predicted_temperature.toFixed(2)}°C`;
//                 showElement(predictionDisplay, 'block');
//             } else {
//                 console.error('Error fetching prediction:', predictData.error);
//                 predictedTempP.textContent = `Prediction Error: ${predictData.error || 'Unknown error'}`;
//                 showElement(predictionDisplay, 'block');
//             }
//         } catch (error) {
//             console.error('Network error fetching prediction:', error);
//             predictedTempP.textContent = 'Prediction N/A (Network Error)';
//             showElement(predictionDisplay, 'block');
//         }
//     }

//     // displayWeatherData function (updated for preferred UI structure)
//     function displayWeatherData(data) {
//         if (!data || !data.current_weather) {
//             showError('Invalid data received.');
//             return;
//         }

//         const { current_weather, forecast } = data; // No hourly_forecast for this UI

//         // --- Display Current Weather Card ---
//         weatherDisplay.innerHTML = `
//             <div class="location">${current_weather.city}, ${current_weather.country}</div>
//             <div class="temperature">${current_weather.temperature.toFixed(1)}°C</div>
//             <div class="icon-wrapper">
//                 <img src="http://openweathermap.org/img/wn/${current_weather.icon}@4x.png" alt="${current_weather.description}">
//             </div>
//             <div class="description">${current_weather.description}</div>
            
//             <div class="weather-details-grid">
//                 <div class="detail-item">
//                     <span class="label">Feels like</span>
//                     <span class="value">${current_weather.feels_like.toFixed(1)}°C</span>
//                 </div>
//                 <div class="detail-item">
//                     <span class="label">Humidity</span>
//                     <span class="value">${current_weather.humidity}%</span>
//                 </div>
//                 <div class="detail-item">
//                     <span class="label">Wind Speed</span>
//                     <span class="value">${current_weather.wind_speed.toFixed(1)} m/s</span>
//                 </div>
//                 <div class="detail-item">
//                     <span class="label">Pressure</span>
//                     <span class="value">${current_weather.pressure} hPa</span>
//                 </div>
//             </div>
//         `;
//         showElement(weatherDisplay, 'block'); // Show the current weather card

//         // --- Display Daily Forecast ---
//         dailyForecastContainer.innerHTML = '';
//         if (forecast && forecast.length > 0) {
//             forecast.forEach(day => {
//                 const dailyCard = document.createElement('div');
//                 dailyCard.classList.add('daily-card');
//                 dailyCard.innerHTML = `
//                     <div class="date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
//                     <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
//                     <div class="temp-range">${day.temp_max.toFixed(1)}°C / ${day.temp_min.toFixed(1)}°C</div>
//                     <div class="description-text">${day.description}</div>
//                 `;
//                 dailyForecastContainer.appendChild(dailyCard);
//             });
//             showElement(forecastDisplay, 'block');
//         } else {
//             hideElement(forecastDisplay);
//         }

//         // Prediction display will be handled by fetchPredictedTemperature
//     }

//     // Initial Load (Optional)
//     // cityInput.value = 'Delhi'; // You can uncomment this to pre-fill a city
//     // fetchWeatherData();
// });



document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');

    // Prediction form elements
    const predCityInput = document.getElementById('pred-city-input');
    const predHumidityInput = document.getElementById('pred-humidity-input');
    const predPressureInput = document.getElementById('pred-pressure-input');
    const predWindSpeedInput = document.getElementById('pred-wind-speed-input');
    const predictBtn = document.getElementById('predict-btn');
    const predictionResult = document.getElementById('prediction-result');

    const BASE_API_URL = ''; // Empty string means current domain

    getWeatherBtn.addEventListener('click', async () => {
        const city = cityInput.value.trim();
        if (!city) {
            weatherDisplay.innerHTML = '<p class="error-message">Please enter a city name.</p>';
            forecastDisplay.innerHTML = '';
            return;
        }

        // Show loading state
        weatherDisplay.innerHTML = '<p class="loading-message">Fetching weather data...</p>';
        forecastDisplay.innerHTML = '';
        getWeatherBtn.disabled = true; // Disable button during fetch
        getWeatherBtn.textContent = 'Fetching...';

        try {
            const response = await fetch(`${BASE_API_URL}/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch weather data.');
            }

            // Display current weather
            const currentWeather = data.current_weather;
            weatherDisplay.innerHTML = `
                <h2>${currentWeather.city}, ${currentWeather.country}</h2>
                <p>Temperature: ${currentWeather.temperature}°C (Feels like: ${currentWeather.feels_like}°C)</p>
                <p>Description: ${currentWeather.description} <img src="http://openweathermap.org/img/wn/${currentWeather.icon}.png" alt="${currentWeather.description}"></p>
                <p>Humidity: ${currentWeather.humidity}%</p>
                <p>Wind Speed: ${currentWeather.wind_speed} m/s</p>
                <p>Pressure: ${currentWeather.pressure} hPa</p>
            `;

            // Display forecast
            forecastDisplay.innerHTML = ''; // Clear previous forecast
            data.forecast.forEach(day => {
                const forecastCard = document.createElement('div');
                forecastCard.classList.add('forecast-card');
                forecastCard.innerHTML = `
                    <h3>${day.date}</h3>
                    <p>Max Temp: ${day.temp_max}°C</p>
                    <p>Min Temp: ${day.temp_min}°C</p>
                    <p>Description: ${day.description} <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}"></p>
                `;
                forecastDisplay.appendChild(forecastCard);
            });

        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherDisplay.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            forecastDisplay.innerHTML = '';
        } finally {
            getWeatherBtn.disabled = false; // Enable button after fetch
            getWeatherBtn.textContent = 'Get Weather';
        }
    });

    predictBtn.addEventListener('click', async () => {
        const city = predCityInput.value.trim();
        const humidity = predHumidityInput.value;
        const pressure = predPressureInput.value;
        const windSpeed = predWindSpeedInput.value;

        if (!city || humidity === '' || pressure === '' || windSpeed === '') {
            predictionResult.innerHTML = '<p class="error-message">Please fill all prediction fields.</p>';
            return;
        }

        predictionResult.innerHTML = '<p class="loading-message">Predicting temperature...</p>';
        predictBtn.disabled = true; // Disable button during fetch
        predictBtn.textContent = 'Predicting...';

        try {
            const response = await fetch(`${BASE_API_URL}/predict_temperature?city=${encodeURIComponent(city)}&humidity=${humidity}&pressure=${pressure}&wind_speed=${windSpeed}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get prediction.');
            }

            predictionResult.innerHTML = `
                <h3>Predicted Temperature for ${data.city}:</h3>
                <p>${data.predicted_temperature}°C</p>
            `;

        } catch (error) {
            console.error('Error predicting temperature:', error);
            predictionResult.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        } finally {
            predictBtn.disabled = false; // Enable button after fetch
            predictBtn.textContent = 'Predict Temperature';
        }
    });
});