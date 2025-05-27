document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const weatherDisplay = document.getElementById('weatherDisplay');
    const predictionDisplay = document.getElementById('predictionDisplay');
    const predictedTempP = document.getElementById('predictedTemp');
    const loadingDiv = document.getElementById('loading');
    const errorDisplay = document.getElementById('errorDisplay');
    const darkModeToggle = document.getElementById('darkModeToggle'); // New: Dark mode toggle
    const body = document.body;

    const BACKEND_URL = 'YOUR_DEPLOYED_BACKEND_URL_HERE'; // Jaise: 'https://your-flask-app.onrender.com'
    // --- Dark Mode Toggle Logic ---
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        body.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'dark') {
            darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        } else {
            darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
        }
    } else {
        // Default to light mode if no theme is set
        body.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon'); // Ensure moon icon is shown
    }

    darkModeToggle.addEventListener('click', () => {
        let theme = body.getAttribute('data-theme');
        if (theme === 'dark') {
            body.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon'); // Change to moon icon
        } else {
            body.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Change to sun icon
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

        weatherDisplay.innerHTML = '';
        predictionDisplay.style.display = 'none';
        errorDisplay.style.display = 'none';
        loadingDiv.style.display = 'flex'; // Use flex for loading spinner alignment

        let currentHumidity = null;
        let currentPressure = null;
        let currentWindSpeed = null;

        try {
            // --- Fetch Current Weather Data ---
            const weatherResponse = await fetch(`${BACKEND_URL}/weather?city=${encodeURIComponent(city)}`);
            const weatherData = await weatherResponse.json();

            if (weatherResponse.ok) {
                displayWeatherData(weatherData); // Display current weather and forecast

                // Extract current weather parameters for prediction
                if (weatherData.current_weather) {
                    currentHumidity = weatherData.current_weather.humidity;
                    currentPressure = weatherData.current_weather.pressure;
                    currentWindSpeed = weatherData.current_weather.wind_speed;
                }

                // --- Fetch Predicted Temperature (only if current weather data is available) ---
                if (currentHumidity !== null && currentPressure !== null && currentWindSpeed !== null) {
                    await fetchPredictedTemperature(city, currentHumidity, currentPressure, currentWindSpeed);
                } else {
                    console.warn("Missing current weather data for prediction. Cannot fetch prediction.");
                    predictedTempP.textContent = "Prediction N/A: Required weather data missing.";
                    predictionDisplay.style.display = 'block'; // Show prediction section with error
                }

            } else {
                showError(weatherData.error || 'Something went wrong while fetching weather data.');
            }
        } catch (error) {
            console.error('Error in fetching data:', error);
            showError('Could not connect to the server or an unexpected error occurred.');
            predictedTempP.textContent = "Prediction N/A: Network or server error."; // Show prediction error
            predictionDisplay.style.display = 'block'; // Show prediction section with error
        } finally {
            loadingDiv.style.display = 'none'; // Hide loading regardless of success/failure
        }
    }

    async function fetchPredictedTemperature(city, humidity, pressure, wind_speed) {
        try {
            const predictResponse = await fetch(`${BACKEND_URL}/predict_temperature?city=${encodeURIComponent(city)}&humidity=${humidity}&pressure=${pressure}&wind_speed=${wind_speed}`);
            const predictData = await predictResponse.json();

            if (predictResponse.ok) {
                predictedTempP.textContent = `${predictData.predicted_temperature.toFixed(2)}°C`; // Format to 2 decimal places
                predictionDisplay.style.display = 'block'; // Show prediction section
            } else {
                console.error('Error fetching prediction:', predictData.error);
                predictedTempP.textContent = `Prediction Error: ${predictData.error || 'Unknown error'}`;
                predictionDisplay.style.display = 'block'; // Still show prediction section, but with error
            }
        } catch (error) {
            console.error('Network error fetching prediction:', error);
            predictedTempP.textContent = 'Prediction N/A (Network Error)';
            predictionDisplay.style.display = 'block'; // Still show prediction section, but with error
        }
    }

    function displayWeatherData(data) {
        if (!data || !data.current_weather) {
            showError('Invalid data received.');
            return;
        }

        const { current_weather, forecast } = data;
        const weatherHtml = `
            <div class="current-weather">
                <h2>${current_weather.city}, ${current_weather.country}</h2>
                <p class="current-temp">${current_weather.temperature.toFixed(1)}°C</p>
                <p><img src="http://openweathermap.org/img/wn/${current_weather.icon}@2x.png" alt="${current_weather.description}"> <span class="description">${current_weather.description}</span></p>
                <p><i class="fas fa-thermometer-half"></i> Feels like: ${current_weather.feels_like.toFixed(1)}°C</p>
                <p><i class="fas fa-tint"></i> Humidity: ${current_weather.humidity}%</p>
                <p><i class="fas fa-wind"></i> Wind Speed: ${current_weather.wind_speed.toFixed(2)} m/s</p>
                <p><i class="fas fa-tachometer-alt"></i> Pressure: ${current_weather.pressure} hPa</p>
            </div>
        `;

        let forecastHtml = '';
        if (forecast && forecast.length > 0) {
            forecastHtml = `
                <div class="forecast-section">
                    <h3>5-Day Forecast</h3>
                    <div class="forecast-cards">
                        ${forecast.map(day => `
                            <div class="forecast-card">
                                <div class="date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                                <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
                                <div class="temp-range">${day.temp_max.toFixed(1)}°C / ${day.temp_min.toFixed(1)}°C</div>
                                <div class="desc">${day.description}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        weatherDisplay.innerHTML = weatherHtml + forecastHtml;
    }

    function showError(message) {
        errorDisplay.style.display = 'flex'; // Changed to flex for centering content
        errorDisplay.querySelector('p').textContent = message;
        weatherDisplay.innerHTML = '<p>Enter a city to get weather information.</p>'; // Reset main display
        predictionDisplay.style.display = 'none'; // Hide prediction on error
    }

    // Optionally, fetch weather for a default city on load
    // cityInput.value = 'Bhopal'; // Example default city
    // fetchWeatherData(); // Uncomment to fetch on page load
});