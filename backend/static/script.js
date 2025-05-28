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