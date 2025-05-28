document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements for Weather Search
    const cityInput = document.getElementById('city-input');
    const getWeatherBtn = document.getElementById('get-weather-btn');
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');

    // DOM Elements for Prediction Form
    const predCityInput = document.getElementById('pred-city-input');
    const predHumidityInput = document.getElementById('pred-humidity-input');
    const predPressureInput = document.getElementById('pred-pressure-input');
    const predWindSpeedInput = document.getElementById('pred-wind-speed-input');
    const predictBtn = document.getElementById('predict-btn');
    const predictionResult = document.getElementById('prediction-result');

    // NEW: DOM Elements for Dark Mode Toggle
    const themeToggle = document.getElementById('checkbox'); // This is the ID for the dark mode switch
    const body = document.body; // Represents the <body> tag of your HTML

    const BASE_API_URL = ''; // Empty string means current domain (useful for Render deployment)

    // --- Dark Mode Functionality ---
    // Check for user's saved preference in localStorage when the page loads
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.classList.add('dark-mode'); // Apply dark mode class to body
        themeToggle.checked = true; // Set the toggle switch to ON
    }

    // Add event listener to the dark mode toggle switch
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            // If switch is checked (ON), enable dark mode
            body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled'); // Save preference
        } else {
            // If switch is unchecked (OFF), disable dark mode
            body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled'); // Save preference
        }
    });

    // --- Get Weather Button Event Listener ---
    getWeatherBtn.addEventListener('click', async () => {
        const city = cityInput.value.trim(); // Get city input and remove leading/trailing spaces
        if (!city) {
            // If city input is empty, show an error message
            weatherDisplay.innerHTML = '<p class="error-message">Please enter a city name.</p>';
            forecastDisplay.innerHTML = ''; // Clear forecast
            return; // Exit the function
        }

        // Show loading state while fetching data
        weatherDisplay.innerHTML = '<p class="loading-message">Fetching weather data...</p>';
        forecastDisplay.innerHTML = ''; // Clear previous forecast
        getWeatherBtn.disabled = true; // Disable button to prevent multiple clicks
        getWeatherBtn.textContent = 'Fetching...'; // Change button text to indicate loading

        try {
            // Fetch current weather data from your Flask backend
            const response = await fetch(`${BASE_API_URL}/weather?city=${encodeURIComponent(city)}`);
            const data = await response.json(); // Parse the JSON response

            if (!response.ok) {
                // If response is not OK (e.g., 404, 500), throw an error
                throw new Error(data.error || 'Failed to fetch weather data.');
            }

            // --- Display Current Weather ---
            const currentWeather = data.current_weather;
            // Updated HTML structure for current weather to match the desired UI
            weatherDisplay.innerHTML = `
                <div class="weather-info">
                    <h2>${currentWeather.city}, ${currentWeather.country}</h2>
                    <div class="main-temp-section">
                        <img src="http://openweathermap.org/img/wn/${currentWeather.icon}@2x.png" alt="${currentWeather.description}" class="weather-icon-large">
                        <p class="temperature">${currentWeather.temperature}°C</p>
                    </div>
                    <p class="description">${currentWeather.description}</p>
                    <div class="details-grid">
                        <p><span>Feels like:</span> ${currentWeather.feels_like}°C</p>
                        <p><span>Humidity:</span> ${currentWeather.humidity}%</p>
                        <p><span>Wind Speed:</span> ${currentWeather.wind_speed} m/s</p>
                        <p><span>Pressure:</span> ${currentWeather.pressure} hPa</p>
                    </div>
                </div>
            `;

            // --- Display Forecast ---
            forecastDisplay.innerHTML = ''; // Clear previous forecast
            data.forecast.forEach(day => {
                const forecastCard = document.createElement('div');
                forecastCard.classList.add('forecast-card'); // Add CSS class for styling
                forecastCard.innerHTML = `
                    <h3>${day.date}</h3>
                    <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}" class="forecast-icon">
                    <p>Max Temp: ${day.temp_max}°C</p>
                    <p>Min Temp: ${day.temp_min}°C</p>
                    <p>Description: ${day.description}</p>
                `;
                forecastDisplay.appendChild(forecastCard); // Add card to forecast display area
            });

        } catch (error) {
            console.error('Error fetching weather:', error);
            weatherDisplay.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
            forecastDisplay.innerHTML = '';
        } finally {
            getWeatherBtn.disabled = false; // Re-enable button
            getWeatherBtn.textContent = 'Get Weather'; // Restore button text
        }
    });

    // --- Predict Temperature Button Event Listener ---
    predictBtn.addEventListener('click', async () => {
        const city = predCityInput.value.trim();
        const humidity = predHumidityInput.value;
        const pressure = predPressureInput.value;
        const windSpeed = predWindSpeedInput.value;

        // Validate all prediction fields
        if (!city || humidity === '' || pressure === '' || windSpeed === '') {
            predictionResult.innerHTML = '<p class="error-message">Please fill all prediction fields.</p>';
            return;
        }

        predictionResult.innerHTML = '<p class="loading-message">Predicting temperature...</p>';
        predictBtn.disabled = true;
        predictBtn.textContent = 'Predicting...';

        try {
            // Fetch temperature prediction from your Flask backend
            const response = await fetch(`${BASE_API_URL}/predict_temperature?city=${encodeURIComponent(city)}&humidity=${humidity}&pressure=${pressure}&wind_speed=${windSpeed}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get prediction.');
            }

            predictionResult.innerHTML = `
                <h3>Predicted Temperature for ${data.city}:</h3>
                <p class="predicted-temp-value">${data.predicted_temperature}°C</p>
            `;

        } catch (error) {
            console.error('Error predicting temperature:', error);
            predictionResult.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
        } finally {
            predictBtn.disabled = false;
            predictBtn.textContent = 'Predict Temperature';
        }
    });
});
