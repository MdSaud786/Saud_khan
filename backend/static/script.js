    document.addEventListener('DOMContentLoaded', () => {
        // 1. Get DOM Elements
        const darkModeToggle = document.getElementById('darkModeToggle');
        const cityInput = document.getElementById('cityInput');
        const searchBtn = document.getElementById('searchBtn');

        // Main display containers
        const loadingDiv = document.getElementById('loading');
        const errorDisplay = document.getElementById('errorDisplay');
        const weatherSectionsWrapper = document.getElementById('weatherSectionsWrapper'); // New wrapper for all weather content
        const currentWeatherCard = document.getElementById('currentWeatherCard');
        const hourlyForecastSection = document.getElementById('hourlyForecastSection');
        const hourlyCardsContainer = document.getElementById('hourlyCardsContainer');
        const dailyForecastSection = document.getElementById('dailyForecastSection');
        const dailyCardsContainer = document.getElementById('dailyCardsContainer');
        const predictionDisplay = document.getElementById('predictionDisplay'); // New position
        const predictedTempP = document.getElementById('predictedTemp');

        const BACKEND_URL = ''; // Empty string for Render deployment

        // Helper functions
        const showElement = (element, displayType = 'flex') => {
            if (element) element.style.display = displayType;
        };
        const hideElement = (element) => {
            if (element) element.style.display = 'none';
        };

        const showError = (message) => {
            hideElement(loadingDiv);
            hideElement(weatherSectionsWrapper); // Hide all weather content
            showElement(errorDisplay);
            errorDisplay.querySelector('p').textContent = `Error: ${message}`;
            searchBtn.disabled = false;
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather';
        };

        // --- Dark Mode Toggle Logic (with 'sun' as default icon for light mode) ---
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark') {
                darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon'); // Start with sun, change to moon if dark
            } else {
                darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Start with moon, change to sun if light
            }
        } else {
            // Default to light mode if no theme is set
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Ensure sun icon is shown for default light mode
        }

        darkModeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
                darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
            }
        });

        // --- Weather Fetching Logic ---
        searchBtn.addEventListener('click', fetchWeatherData);
        cityInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                fetchWeatherData();
            }
        });

        async function fetchWeatherData() {
            const city = cityInput.value.trim();
            if (!city) {
                showError('Please enter a city name.');
                return;
            }

            // Clear previous displays and show loading
            hideElement(errorDisplay);
            hideElement(weatherSectionsWrapper);
            showElement(loadingDiv);
            searchBtn.disabled = true;
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';

            let currentHumidity = null;
            let currentPressure = null;
            let currentWindSpeed = null;

            try {
                // --- Fetch Current Weather & Forecast Data ---
                const weatherResponse = await fetch(`${BACKEND_URL}/weather?city=${encodeURIComponent(city)}`);
                const weatherData = await weatherResponse.json();

                if (weatherResponse.ok) {
                    displayWeatherData(weatherData); // Display current weather, hourly, and daily forecast

                    // Extract current weather parameters for prediction
                    if (weatherData.current_weather) {
                        currentHumidity = weatherData.current_weather.humidity;
                        currentPressure = weatherData.current_weather.pressure;
                        currentWindSpeed = weatherData.current_weather.wind_speed;
                    }

                    // --- Fetch Predicted Temperature (only if current weather data is available) ---
                    // Removed city parameter from prediction request to avoid "Unknown city" warning
                    if (currentHumidity !== null && currentPressure !== null && currentWindSpeed !== null) {
                        await fetchPredictedTemperature(currentHumidity, currentPressure, currentWindSpeed);
                    } else {
                        console.warn("Missing current weather data for prediction. Cannot fetch prediction.");
                        predictedTempP.textContent = "Prediction N/A: Required weather data missing.";
                        showElement(predictionDisplay, 'flex'); // Show prediction section with error
                    }

                } else {
                    showError(weatherData.error || 'Something went wrong while fetching weather data.');
                }
            } catch (error) {
                console.error('Error in fetching data:', error);
                showError('Could not connect to the server or an unexpected error occurred.');
                predictedTempP.textContent = "Prediction N/A: Network or server error.";
                showElement(predictionDisplay, 'flex'); // Show prediction section with error
            } finally {
                hideElement(loadingDiv);
                searchBtn.disabled = false;
                searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather';
            }
        }

        // Updated fetchPredictedTemperature function (no city parameter)
        async function fetchPredictedTemperature(humidity, pressure, wind_speed) {
            try {
                const predictResponse = await fetch(`${BACKEND_URL}/predict_temperature?humidity=${humidity}&pressure=${pressure}&wind_speed=${wind_speed}`);
                const predictData = await predictResponse.json();

                if (predictResponse.ok) {
                    predictedTempP.textContent = `${predictData.predicted_temperature.toFixed(2)}°C`;
                    showElement(predictionDisplay, 'flex');
                } else {
                    console.error('Error fetching prediction:', predictData.error);
                    predictedTempP.textContent = `Prediction Error: ${predictData.error || 'Unknown error'}`;
                    showElement(predictionDisplay, 'flex');
                }
            } catch (error) {
                console.error('Network error fetching prediction:', error);
                predictedTempP.textContent = 'Prediction N/A (Network Error)';
                showElement(predictionDisplay, 'flex');
            }
        }

        function displayWeatherData(data) {
            if (!data || !data.current_weather) {
                showError('Invalid data received.');
                return;
            }

            const { current_weather, forecast, hourly_forecast } = data; // Added hourly_forecast

            // --- Display Current Weather Card ---
            currentWeatherCard.innerHTML = `
                <div class="location-info">${current_weather.city}, ${current_weather.country}</div>
                <div class="main-temp-icon">
                    <img src="http://openweathermap.org/img/wn/${current_weather.icon}@4x.png" alt="${current_weather.description}" class="weather-icon-large">
                    <div class="main-temp">${current_weather.temperature.toFixed(1)}°C</div>
                </div>
                <div class="weather-description">${current_weather.description}</div>
                
                <div class="weather-details-grid">
                    <div class="detail-item">
                        <i class="fas fa-thermometer-half icon"></i>
                        <span class="label">Feels like</span>
                        <span class="value">${current_weather.feels_like.toFixed(1)}°C</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tint icon"></i>
                        <span class="label">Humidity</span>
                        <span class="value">${current_weather.humidity}%</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-wind icon"></i>
                        <span class="label">Wind</span>
                        <span class="value">${current_weather.wind_speed.toFixed(1)} m/s</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-tachometer-alt icon"></i>
                        <span class="label">Pressure</span>
                        <span class="value">${current_weather.pressure} hPa</span>
                    </div>
                    ${current_weather.uv_index ? `
                    <div class="detail-item">
                        <i class="fas fa-sun icon"></i>
                        <span class="label">UV Index</span>
                        <span class="value">${current_weather.uv_index.toFixed(0)}</span>
                    </div>` : ''}
                    ${current_weather.sunrise && current_weather.sunset ? `
                    <div class="detail-item">
                        <i class="far fa-clock icon"></i>
                        <span class="label">Sunrise</span>
                        <span class="value">${new Date(current_weather.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                    <div class="detail-item">
                        <i class="far fa-clock icon"></i>
                        <span class="label">Sunset</span>
                        <span class="value">${new Date(current_weather.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>` : ''}
                    ${current_weather.air_quality ? `
                    <div class="detail-item">
                        <i class="fas fa-smog icon"></i>
                        <span class="label">Air Quality</span>
                        <span class="value">${current_weather.air_quality.toFixed(0)} AQI</span>
                    </div>` : ''}
                </div>
            `;

            // --- Display Hourly Forecast ---
            hourlyCardsContainer.innerHTML = '';
            if (hourly_forecast && hourly_forecast.length > 0) {
                hourly_forecast.forEach(hour => {
                    const hourlyCard = document.createElement('div');
                    hourlyCard.classList.add('hourly-card');
                    hourlyCard.innerHTML = `
                        <div class="time">${new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</div>
                        <img src="http://openweathermap.org/img/wn/${hour.icon}.png" alt="${hour.description}">
                        <div class="temp">${hour.temp.toFixed(1)}°C</div>
                    `;
                    hourlyCardsContainer.appendChild(hourlyCard);
                });
                showElement(hourlyForecastSection, 'flex');
            } else {
                hideElement(hourlyForecastSection);
            }

            // --- Display Daily Forecast ---
            dailyCardsContainer.innerHTML = '';
            if (forecast && forecast.length > 0) {
                forecast.forEach(day => {
                    const dailyCard = document.createElement('div');
                    dailyCard.classList.add('daily-card');
                    dailyCard.innerHTML = `
                        <div class="day">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</div>
                        <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
                        <div class="temp-range">${day.temp_max.toFixed(1)}°C / ${day.temp_min.toFixed(1)}°C</div>
                    `;
                    dailyCardsContainer.appendChild(dailyCard);
                });
                showElement(dailyForecastSection, 'flex');
            } else {
                hideElement(dailyForecastSection);
            }

            showElement(weatherSectionsWrapper, 'flex'); // Show the main wrapper
            // Prediction display will be handled by fetchPredictedTemperature
        }

        // --- Initial Load (Optional) ---
        // cityInput.value = 'Bhopal'; 
        // fetchWeatherData();
    });
    