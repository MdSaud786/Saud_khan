    // document.addEventListener('DOMContentLoaded', () => {
    //     // 1. Get DOM Elements (Updated IDs as per new HTML)
    //     const darkModeToggle = document.getElementById('darkModeToggle');
    //     const cityInput = document.getElementById('cityInput');
    //     const searchBtn = document.getElementById('searchBtn');
    //     const loadingDiv = document.getElementById('loading'); // Changed ID
    //     const errorDisplay = document.getElementById('errorDisplay'); // Changed ID
    //     const weatherDisplay = document.getElementById('weatherDisplay'); // Changed ID
    //     const predictionDisplay = document.getElementById('predictionDisplay'); // Changed ID
    //     const predictedTempP = document.getElementById('predictedTemp'); // Changed ID
    //     const forecastCardsContainer = document.getElementById('forecastCards'); // Changed ID
    //     const forecastSection = document.querySelector('.forecast-section'); // Select the whole section

    //     // Changed for Render deployment: Empty string means current domain
    //     const BACKEND_URL = ''; 

    //     // Helper function to show/hide elements using flex for loading/error
    //     const showElement = (element, displayType = 'flex') => { // Default to 'flex'
    //         element.style.display = displayType;
    //     };
    //     const hideElement = (element) => {
    //         element.style.display = 'none';
    //     };

    //     // Helper function to display error messages
    //     const showError = (message) => {
    //         hideElement(loadingDiv);
    //         hideElement(weatherDisplay);
    //         hideElement(predictionDisplay);
    //         hideElement(forecastSection); // Hide forecast on error
    //         showElement(errorDisplay);
    //         errorDisplay.querySelector('p').textContent = `Error: ${message}`;
    //         searchBtn.disabled = false; // Re-enable button
    //         searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather & Predict'; // Restore button content
    //     };

    //     // --- Dark Mode Toggle Logic ---
    //     const currentTheme = localStorage.getItem('theme');
    //     if (currentTheme) {
    //         document.documentElement.setAttribute('data-theme', currentTheme); // Use document.documentElement
    //         if (currentTheme === 'dark') {
    //             darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    //         } else {
    //             darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon');
    //         }
    //     } else {
    //         // Default to light mode if no theme is set
    //         document.documentElement.setAttribute('data-theme', 'light'); // Use document.documentElement
    //         localStorage.setItem('theme', 'light');
    //         // Ensure moon icon is shown for default light mode
    //         darkModeToggle.querySelector('i').classList.remove('fa-sun'); // Remove sun if present
    //         darkModeToggle.querySelector('i').classList.add('fa-moon'); // Add moon
    //     }

    //     darkModeToggle.addEventListener('click', () => {
    //         let theme = document.documentElement.getAttribute('data-theme'); // Use document.documentElement
    //         if (theme === 'dark') {
    //             document.documentElement.setAttribute('data-theme', 'light');
    //             localStorage.setItem('theme', 'light');
    //             darkModeToggle.querySelector('i').classList.replace('fa-sun', 'fa-moon'); // Change to moon icon
    //         } else {
    //             document.documentElement.setAttribute('data-theme', 'dark');
    //             localStorage.setItem('theme', 'dark');
    //             darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun'); // Change to sun icon
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
    //         weatherDisplay.innerHTML = '';
    //         predictionDisplay.style.display = 'none';
    //         errorDisplay.style.display = 'none';
    //         forecastSection.style.display = 'none'; // Hide forecast section initially
    //         showElement(loadingDiv); // Use helper function
    //         searchBtn.disabled = true;
    //         searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...'; // Spinner for button

    //         let currentHumidity = null;
    //         let currentPressure = null;
    //         let currentWindSpeed = null;

    //         try {
    //             // --- Fetch Current Weather Data ---
    //             const weatherResponse = await fetch(`${BACKEND_URL}/weather?city=${encodeURIComponent(city)}`);
    //             const weatherData = await weatherResponse.json();

    //             if (weatherResponse.ok) {
    //                 // Display current weather and forecast
    //                 displayWeatherData(weatherData);

    //                 // Extract current weather parameters for prediction
    //                 if (weatherData.current_weather) {
    //                     currentHumidity = weatherData.current_weather.humidity;
    //                     currentPressure = weatherData.current_weather.pressure;
    //                     currentWindSpeed = weatherData.current_weather.wind_speed;
    //                 }

    //                 // --- Fetch Predicted Temperature (only if current weather data is available) ---
    //                 if (currentHumidity !== null && currentPressure !== null && currentWindSpeed !== null) {
    //                     await fetchPredictedTemperature(city, currentHumidity, currentPressure, currentWindSpeed);
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
    //             predictedTempP.textContent = "Prediction N/A: Network or server error."; // Show prediction error
    //             showElement(predictionDisplay, 'block'); // Show prediction section with error
    //         } finally {
    //             hideElement(loadingDiv); // Hide loading regardless of success/failure
    //             searchBtn.disabled = false; // Re-enable button
    //             searchBtn.innerHTML = '<i class="fas fa-search"></i> Get Weather & Predict'; // Restore button content
    //         }
    //     }

    //     async function fetchPredictedTemperature(city, humidity, pressure, wind_speed) {
    //         try {
    //             const predictResponse = await fetch(`${BACKEND_URL}/predict_temperature?city=${encodeURIComponent(city)}&humidity=${humidity}&pressure=${pressure}&wind_speed=${wind_speed}`);
    //             const predictData = await predictResponse.json();

    //             if (predictResponse.ok) {
    //                 predictedTempP.textContent = `${predictData.predicted_temperature.toFixed(2)}°C`; // Format to 2 decimal places
    //                 showElement(predictionDisplay, 'block'); // Show prediction section
    //             } else {
    //                 console.error('Error fetching prediction:', predictData.error);
    //                 predictedTempP.textContent = `Prediction Error: ${predictData.error || 'Unknown error'}`;
    //                 showElement(predictionDisplay, 'block'); // Still show prediction section, but with error
    //             }
    //         } catch (error) {
    //             console.error('Network error fetching prediction:', error);
    //             predictedTempP.textContent = 'Prediction N/A (Network Error)';
    //             showElement(predictionDisplay, 'block'); // Still show prediction section, but with error
    //         }
    //     }

    //     function displayWeatherData(data) {
    //         if (!data || !data.current_weather) {
    //             showError('Invalid data received.');
    //             return;
    //         }

    //         const { current_weather, forecast } = data;

    //         // Display Current Weather
    //         weatherDisplay.innerHTML = `
    //             <div class="current-weather">
    //                 <h2>${current_weather.city}, ${current_weather.country}</h2>
    //                 <p class="current-temp">${current_weather.temperature.toFixed(1)}°C</p>
    //                 <p><img src="http://openweathermap.org/img/wn/${current_weather.icon}@2x.png" alt="${current_weather.description}"> <span class="description">${current_weather.description}</span></p>
    //                 <div class="weather-details-grid">
    //                     <div class="weather-detail-item"><span>Feels like</span> ${current_weather.feels_like.toFixed(1)}°C</div>
    //                     <div class="weather-detail-item"><span>Humidity</span> ${current_weather.humidity}%</div>
    //                     <div class="weather-detail-item"><span>Wind Speed</span> ${current_weather.wind_speed.toFixed(2)} m/s</div>
    //                     <div class="weather-detail-item"><span>Pressure</span> ${current_weather.pressure} hPa</div>
    //                 </div>
    //             </div>
    //         `;
    //         showElement(weatherDisplay, 'block'); // Ensure weather display is shown

    //         // Display Forecast
    //         forecastCardsContainer.innerHTML = ''; // Clear previous forecast cards
    //         if (forecast && forecast.length > 0) {
    //             forecast.forEach(day => {
    //                 const forecastCard = document.createElement('div');
    //                 forecastCard.classList.add('forecast-card');
    //                 forecastCard.innerHTML = `
    //                     <p class="date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
    //                     <img src="http://openweathermap.org/img/wn/${day.icon}.png" alt="${day.description}">
    //                     <p class="temp-range">${day.temp_max.toFixed(1)}°C / ${day.temp_min.toFixed(1)}°C</p>
    //                     <p class="desc">${day.description}</p>
    //                 `;
    //                 forecastCardsContainer.appendChild(forecastCard);
    //             });
    //             showElement(forecastSection, 'block'); // Show the entire forecast section
    //         } else {
    //             hideElement(forecastSection); // Hide if no forecast data
    //         }
    //     }

    //     // Optionally, fetch weather for a default city on load
    //     // cityInput.value = 'Bhopal'; // Example default city
    //     // fetchWeatherData(); // Uncomment to fetch on page load
    // });
    

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const loadingDiv = document.getElementById('loading');
    const errorDisplayDiv = document.getElementById('errorDisplay');
    const weatherDisplayDiv = document.getElementById('weatherDisplay');
    const predictionDisplayDiv = document.getElementById('predictionDisplay');
    const predictedTempSpan = document.getElementById('predictedTemp');
    const forecastSectionDiv = document.querySelector('.forecast-section');
    const forecastCardsDiv = document.getElementById('forecastCards');
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Function to hide all info sections and error
    function hideAllSections() {
        loadingDiv.style.display = 'none';
        errorDisplayDiv.style.display = 'none';
        weatherDisplayDiv.innerHTML = '<p>Enter a city to get weather information.</p>'; // Reset initial message
        weatherDisplayDiv.style.display = 'block'; // Always visible to show initial message
        predictionDisplayDiv.style.display = 'none';
        forecastSectionDiv.style.display = 'none';
    }

    // Function to show error message
    function showError(message) {
        errorDisplayDiv.querySelector('p').textContent = message;
        errorDisplayDiv.style.display = 'flex'; // Use flex for alignment
        loadingDiv.style.display = 'none';
        // Hide weather, prediction, forecast if error occurs
        weatherDisplayDiv.innerHTML = ''; // Clear weather info
        weatherDisplayDiv.style.display = 'none';
        predictionDisplayDiv.style.display = 'none';
        forecastSectionDiv.style.display = 'none';
    }

    // --- Dark Mode Toggle ---
    darkModeToggle.addEventListener('click', () => {
        document.documentElement.toggleAttribute('data-theme');
        // Save user preference
        if (document.documentElement.hasAttribute('data-theme')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Apply saved theme on load
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    searchBtn.addEventListener('click', async () => {
        const city = cityInput.value.trim();
        hideAllSections(); // Clear previous results

        if (!city) {
            showError("Please enter a city name.");
            return;
        }

        loadingDiv.style.display = 'flex'; // Show loading spinner

        try {
            // 1. Fetch current weather and 5-day forecast
            const weatherResponse = await fetch(`/weather?city=${encodeURIComponent(city)}`);
            if (!weatherResponse.ok) {
                const errorData = await weatherResponse.json();
                throw new Error(errorData.error || `HTTP error! Status: ${weatherResponse.status}`);
            }
            const weatherData = await weatherResponse.json();
            const currentWeather = weatherData.current_weather;

            // Update Weather Display (using the new HTML structure)
            weatherDisplayDiv.innerHTML = `
                <div class="current-weather">
                    <h2>${currentWeather.city}, ${currentWeather.country}</h2>
                    <p class="current-temp">${currentWeather.temperature.toFixed(1)}°C</p>
                    <p><img src="http://openweathermap.org/img/wn/${currentWeather.icon}@2x.png" alt="Weather Icon" /> <span class="description">${currentWeather.description}</span></p>
                </div>
                <div class="weather-details-grid">
                    <div class="weather-detail-item"><span>Feels Like</span>${currentWeather.feels_like.toFixed(1)}°C</div>
                    <div class="weather-detail-item"><span>Humidity</span>${currentWeather.humidity}%</div>
                    <div class="weather-detail-item"><span>Wind Speed</span>${currentWeather.wind_speed.toFixed(1)} m/s</div>
                    <div class="weather-detail-item"><span>Pressure</span>${currentWeather.pressure} hPa</div>
                </div>
            `;
            weatherDisplayDiv.style.display = 'block';

            // Update Forecast Cards
            forecastCardsDiv.innerHTML = ''; // Clear previous forecasts
            weatherData.forecast.forEach(day => {
                const forecastCard = document.createElement('div');
                forecastCard.classList.add('forecast-card');
                forecastCard.innerHTML = `
                    <p class="date">${new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    <img src="http://openweathermap.org/img/wn/${day.icon}@2x.png" alt="Weather Icon">
                    <p class="desc">${day.description}</p>
                    <p class="temp-range">Max: ${day.temp_max.toFixed(1)}°C</p>
                    <p class="temp-range">Min: ${day.temp_min.toFixed(1)}°C</p>
                `;
                forecastCardsDiv.appendChild(forecastCard);
            });
            forecastSectionDiv.style.display = 'block';

            // 2. Fetch Predicted Temperature
            // Ensure all required parameters are sent to the prediction endpoint
            const predictionParams = new URLSearchParams({
                city: currentWeather.city,
                humidity: currentWeather.humidity,
                pressure: currentWeather.pressure,
                wind_speed: currentWeather.wind_speed,
                description: currentWeather.description,
                icon: currentWeather.icon,
                country_code: currentWeather.country // Send country code
            });

            const predictResponse = await fetch(`/predict_temperature?${predictionParams.toString()}`);
            if (!predictResponse.ok) {
                const errorData = await predictResponse.json();
                // Instead of showing the full error, just indicate N/A or hide the section
                predictedTempSpan.textContent = 'N/A';
                console.error("Prediction Error:", errorData.error); // Log error to console for debugging
                // Don't show prediction error on UI, just hide the div if it failed
                predictionDisplayDiv.style.display = 'none';
            } else {
                const predictData = await predictResponse.json();
                predictedTempSpan.textContent = `${predictData.predicted_temperature.toFixed(1)}°C`;
                predictionDisplayDiv.style.display = 'block';
            }

        } catch (error) {
            console.error('An error occurred:', error);
            showError(`Failed to fetch weather data: ${error.message}. Please try again.`);
        } finally {
            loadingDiv.style.display = 'none'; // Hide loading spinner in all cases
        }
    });

    // Initial state on page load
    hideAllSections();
});