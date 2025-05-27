import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv # load_dotenv ko rehne dein, shayad future mein kaam aaye
import requests
import joblib # Model load karne ke liye
import pandas as pd # DataFrame ban banane aur encoding ke liye
import sqlite3
from datetime import datetime
from flask import render_template # Isko imports mein add karein


# Load environment variables from .env file
# load_dotenv() # <-- Is line ko comment out kar dein ya hata dein
# print(f"DEBUG: OPENWEATHER_API_KEY value after load_dotenv(): {os.getenv('OPENWEATHER_API_KEY')}")

app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')
CORS(app, resources={r"/*": {"origins": ["http://localhost:8000", "https://your-frontend-app.github.io", "https://your-frontend-app.netlify.app"]}})

# Database Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_NAME = os.path.join(BASE_DIR, 'weather_data.db')

# Get API key from environment variables (TEMPORARY DIRECT ASSIGNMENT)
# Production ke liye, ise os.getenv() se hi load karna chahiye
OPENWEATHER_API_KEY = "OPENWEATHER_API_KEY" # <-- Aapki API key yahan directly daal di hai
# if not OPENWEATHER_API_KEY: # <-- Is 'if' block ko comment out kar dein ya hata dein
#     raise ValueError("OPENWEATHER_API_KEY not found in .env file. Please get one from openweathermap.org")

BASE_URL = "http://api.openweathermap.org/data/2.5/"

# Load the trained ML model
# Model ka path sahi hona chahiye
MODEL_PATH = os.path.join(BASE_DIR, 'linear_regression_model.joblib')
PREDICTIVE_MODEL = None # Global variable to store the loaded model

try:
    PREDICTIVE_MODEL = joblib.load(MODEL_PATH)
    print("Machine Learning Model loaded successfully!")
except FileNotFoundError:
    print(f"Error: Model file not found at {MODEL_PATH}. Please ensure it is saved.")
except Exception as e:
    print(f"Error loading the ML model: {e}")

# IMPORTANT: Ye list aapke Jupyter Notebook se 'X.columns.tolist()' ka exact output hai.
# Ye wahi order aur wahi columns honge jo model training ke waqt the.
MODEL_FEATURES = ['humidity', 'pressure', 'wind_speed', 'hour_of_day', 'day_of_week', 'month', 'city_Dubai', 'city_Moscow', 'city_Mumbai', 'city_New York', 'city_Paris', 'city_Sydney', 'city_Tokyo', 'city_Toronto', 'country_AU', 'country_CA', 'country_FR', 'country_IN', 'country_JP', 'country_RU', 'country_TH', 'country_US', 'description_clear sky', 'description_few clouds', 'description_light rain', 'description_mist', 'description_overcast clouds', 'icon_02n', 'icon_04d', 'icon_04n', 'icon_10n', 'icon_50n']

@app.route('/')
def home():
    # return "Weather App Backend is running!" # Is line ko hata dein
    return render_template('index.html') # Ab ye index.html serve karega

@app.route('/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY, # Ab yahan direct value use hogi
        "units": "metric"
    }

    try:
        current_weather_url = f"{BASE_URL}weather"
        response = requests.get(current_weather_url, params=params)
        response.raise_for_status()
        current_data = response.json()

        forecast_url = f"{BASE_URL}forecast"
        forecast_response = requests.get(forecast_url, params=params)
        forecast_response.raise_for_status()
        forecast_data = forecast_response.json()

        weather_info = {
            "city": current_data["name"],
            "country": current_data["sys"]["country"],
            "temperature": current_data["main"]["temp"],
            "feels_like": current_data["main"]["feels_like"],
            "humidity": current_data["main"]["humidity"],
            "description": current_data["weather"][0]["description"],
            "icon": current_data["weather"][0]["icon"],
            "wind_speed": current_data["wind"]["speed"],
            "pressure": current_data["main"]["pressure"]
        }

        conn = None
        try:
            conn = sqlite3.connect(DATABASE_NAME)
            cursor = conn.cursor()

            current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            cursor.execute('''
                INSERT INTO current_weather (
                    city, country, description, feels_like, humidity,
                    icon, pressure, temperature, wind_speed, collection_timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                weather_info['city'], weather_info['country'], weather_info['description'],
                weather_info['feels_like'], weather_info['humidity'], weather_info['icon'],
                weather_info['pressure'], weather_info['temperature'], weather_info['wind_speed'],
                current_timestamp
            ))
            conn.commit()
            print(f"Data for {city} saved to database at {current_timestamp}")
        except sqlite3.Error as e:
            # Ye error message ab terminal mein zaroor dikhna chahiye agar database mein problem hai
            print(f"ERROR: Could not save data for {city} to database. SQLite Error: {e}")
            print(f"SQL Query attempt: INSERT INTO current_weather VALUES ({weather_info['city']}, ...)") # Add this line to see the attempted query if it fails
        finally:
            if conn:
                conn.close()

        daily_forecasts = {}
        for item in forecast_data["list"]:
            date = item["dt_txt"].split(" ")[0]
            if date not in daily_forecasts:
                daily_forecasts[date] = {
                    "temp_max": item["main"]["temp_max"],
                    "temp_min": item["main"]["temp_min"],
                    "description": item["weather"][0]["description"],
                    "icon": item["weather"][0]["icon"]
                }
            else:
                daily_forecasts[date]["temp_max"] = max(daily_forecasts[date]["temp_max"], item["main"]["temp_max"])
                daily_forecasts[date]["temp_min"] = min(daily_forecasts[date]["temp_min"], item["main"]["temp_min"])

        forecast_list = [{"date": date, **data} for date, data in daily_forecasts.items()]

        return jsonify({
            "current_weather": weather_info,
            "forecast": forecast_list
        })

    except requests.exceptions.HTTPError as http_err:
        return jsonify({"error": f"HTTP error occurred: {http_err} - {response.text}"}), response.status_code
    except requests.exceptions.ConnectionError as conn_err:
        return jsonify({"error": f"Connection error occurred: {conn_err}"}), 503
    except requests.exceptions.Timeout as timeout_err:
        return jsonify({"error": f"Timeout error occurred: {timeout_err}"}), 504
    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": f"An error occurred: {req_err}"}), 500
    except KeyError as e:
        return jsonify({"error": f"Invalid data received from API or missing key: {e}. Check city name."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

# ----- Predict Temperature Route (NEWLY ADDED / UPDATED) -----
@app.route('/predict_temperature', methods=['GET'])
def predict_temperature():
    if PREDICTIVE_MODEL is None:
        return jsonify({"error": "Prediction model not loaded. Please check backend logs."}), 500

    # Required parameters for prediction (same as your model's X features, excluding encoded ones for now)
    city_name = request.args.get('city')
    humidity = request.args.get('humidity', type=float)
    pressure = request.args.get('pressure', type=float)
    wind_speed = request.args.get('wind_speed', type=float)
    
    current_time = datetime.now()
    hour_of_day = current_time.hour
    day_of_week = current_time.weekday() # Monday is 0, Sunday is 6
    month = current_time.month

    # Validate inputs
    if not all([city_name, humidity is not None, pressure is not None, wind_speed is not None]):
        return jsonify({"error": "Missing one or more required parameters: city, humidity, pressure, wind_speed"}), 400

    # Create a DataFrame for prediction
    input_data = {
        'humidity': [humidity],
        'pressure': [pressure],
        'wind_speed': [wind_speed],
        'hour_of_day': [hour_of_day],
        'day_of_week': [day_of_week],
        'month': [month]
        # Categorical features will be added as one-hot encoded
    }
    
    input_df = pd.DataFrame(input_data)

    # Add placeholder columns for all one-hot encoded categorical features
    # Set all to 0 initially. This handles cases where a city/desc/icon might be missing from the current request
    for feature in MODEL_FEATURES:
        if feature not in input_df.columns:
            input_df[feature] = 0

    # Set the specific one-hot encoded column for the 'city' to 1
    # Note: 'country', 'description', 'icon' are left as 0 unless you add logic to take them as input
    city_col_name = f'city_{city_name}'
    if city_col_name in input_df.columns:
        input_df[city_col_name] = 1
    else:
        # Handle unknown city: print a warning or return an error
        print(f"Warning: Unknown city '{city_name}' for prediction. Model might not perform well as its one-hot encoding is not activated.")
        # Optionally, you can return an error here if city is not found in model features
        # return jsonify({"error": f"City '{city_name}' not in model's known cities for prediction."}), 400

    # Ensure the final input_df has columns in the exact order of MODEL_FEATURES
    try:
        prediction_input = input_df[MODEL_FEATURES]
    except KeyError as k_err:
        return jsonify({"error": f"Feature mismatch for prediction. Missing expected feature: {k_err}. Ensure MODEL_FEATURES list is correct and all expected columns are created."}), 500
    except Exception as e:
        return jsonify({"error": f"Error preparing prediction input: {e}"}), 500

    try:
        predicted_temperature = PREDICTIVE_MODEL.predict(prediction_input)[0]
        return jsonify({
            "city": city_name,
            "predicted_temperature": round(predicted_temperature, 2)
        })
    except Exception as e:
        return jsonify({"error": f"Error during prediction: {e}"}), 500

if __name__ == '__main__':
    app.run(debug=True)