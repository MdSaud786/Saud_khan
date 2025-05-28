# import os
# from flask import Flask, request, jsonify, render_template
# from flask_cors import CORS
# from dotenv import load_dotenv
# import requests
# import joblib
# import pandas as pd
# import sqlite3
# from datetime import datetime

# # Flask app initialization
# # static_folder aur template_folder ko app.py ke directory ke relative set karein
# app = Flask(__name__,
#             template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
#             static_folder=os.path.join(os.path.dirname(__file__), 'static'))
# CORS(app)

# # Database Configuration
# BASE_DIR = os.path.abspath(os.path.dirname(__file__))
# DATABASE_NAME = os.path.join(BASE_DIR, 'weather_data.db')

# # Load environment variables from .env file (for local development)
# load_dotenv()
# OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

# if not OPENWEATHER_API_KEY:
#     # Ye warning Render logs mein dikhegi agar key set nahi hui
#     print("WARNING: OPENWEATHER_API_KEY environment variable not found. Weather API calls will likely fail.")
#     # Agar aap local mein strict error chahte hain toh ye line uncomment kar sakte hain
#     # raise ValueError("OPENWEATHER_API_KEY not found. Please set it in Render environment variables or .env file.")

# BASE_URL = "http://api.openweathermap.org/data/2.5/"

# # Load the trained ML model
# MODEL_PATH = os.path.join(BASE_DIR, 'linear_regression_model.joblib')

# PREDICTIVE_MODEL = None # Global variable to store the loaded model

# try:
#     PREDICTIVE_MODEL = joblib.load(MODEL_PATH)
#     print("Machine Learning Model loaded successfully!")
# except FileNotFoundError:
#     print(f"Error: Model file not found at {MODEL_PATH}. Please ensure it is saved and committed to Git.")
# except Exception as e:
#     print(f"Error loading the ML model: {e}")

# # IMPORTANT: Ye list aapke Jupyter Notebook se 'X.columns.tolist()' ka exact output hai.
# MODEL_FEATURES = ['humidity', 'pressure', 'wind_speed', 'hour_of_day', 'day_of_week', 'month', 'city_Dubai', 'city_Moscow', 'city_Mumbai', 'city_New York', 'city_Paris', 'city_Sydney', 'city_Tokyo', 'city_Toronto', 'country_AU', 'country_CA', 'country_FR', 'country_IN', 'country_JP', 'country_RU', 'country_TH', 'country_US', 'description_clear sky', 'description_few clouds', 'description_light rain', 'description_mist', 'description_overcast clouds', 'icon_02n', 'icon_04d', 'icon_04n', 'icon_10n', 'icon_50n']

# @app.route('/')
# def home():
#     # Render index.html from the 'templates' folder
#     return render_template('index.html')

# @app.route('/weather')
# def get_weather():
#     city = request.args.get('city')
#     if not city:
#         return jsonify({"error": "City parameter is required"}), 400

#     params = {
#         "q": city,
#         "appid": OPENWEATHER_API_KEY, # Ab yahan environment variable use hoga
#         "units": "metric"
#     }

#     try:
#         current_weather_url = f"{BASE_URL}weather"
#         response = requests.get(current_weather_url, params=params)
#         response.raise_for_status() # HTTP errors ko catch karne ke liye
#         current_data = response.json()

#         forecast_url = f"{BASE_URL}forecast"
#         forecast_response = requests.get(forecast_url, params=params)
#         forecast_response.raise_for_status()
#         forecast_data = forecast_response.json()

#         weather_info = {
#             "city": current_data["name"],
#             "country": current_data["sys"]["country"],
#             "temperature": current_data["main"]["temp"],
#             "feels_like": current_data["main"]["feels_like"],
#             "humidity": current_data["main"]["humidity"],
#             "description": current_data["weather"][0]["description"],
#             "icon": current_data["weather"][0]["icon"],
#             "wind_speed": current_data["wind"]["speed"],
#             "pressure": current_data["main"]["pressure"]
#         }

#         conn = None
#         try:
#             conn = sqlite3.connect(DATABASE_NAME)
#             cursor = conn.cursor()

#             # Create table if it doesn't exist (ye bahut important hai)
#             cursor.execute('''
#                 CREATE TABLE IF NOT EXISTS current_weather (
#                     id INTEGER PRIMARY KEY AUTOINCREMENT,
#                     city TEXT NOT NULL,
#                     country TEXT,
#                     description TEXT,
#                     feels_like REAL,
#                     humidity INTEGER,
#                     icon TEXT,
#                     pressure INTEGER,
#                     temperature REAL,
#                     wind_speed REAL,
#                     collection_timestamp TEXT
#                 )
#             ''')
#             conn.commit() # Table creation commit karein

#             current_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

#             cursor.execute('''
#                 INSERT INTO current_weather (
#                     city, country, description, feels_like, humidity,
#                     icon, pressure, temperature, wind_speed, collection_timestamp
#                 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
#             ''', (
#                 weather_info['city'], weather_info['country'], weather_info['description'],
#                 weather_info['feels_like'], weather_info['humidity'], weather_info['icon'],
#                 weather_info['pressure'], weather_info['temperature'], weather_info['wind_speed'],
#                 current_timestamp
#             ))
#             conn.commit()
#             print(f"Data for {city} saved to database at {current_timestamp}")
#         except sqlite3.Error as e:
#             print(f"ERROR: Could not save data for {city} to database. SQLite Error: {e}")
#             print(f"SQL Query attempt failed.")
#         finally:
#             if conn:
#                 conn.close()

#         daily_forecasts = {}
#         for item in forecast_data["list"]:
#             date = item["dt_txt"].split(" ")[0]
#             if date not in daily_forecasts:
#                 daily_forecasts[date] = {
#                     "temp_max": item["main"]["temp_max"],
#                     "temp_min": item["main"]["temp_min"],
#                     "description": item["weather"][0]["description"],
#                     "icon": item["weather"][0]["icon"]
#                 }
#             else:
#                 daily_forecasts[date]["temp_max"] = max(daily_forecasts[date]["temp_max"], item["main"]["temp_max"])
#                 daily_forecasts[date]["temp_min"] = min(daily_forecasts[date]["temp_min"], item["main"]["temp_min"])

#         forecast_list = [{"date": date, **data} for date, data in daily_forecasts.items()]

#         return jsonify({
#             "current_weather": weather_info,
#             "forecast": forecast_list
#         })

#     except requests.exceptions.HTTPError as http_err:
#         error_msg = f"HTTP error occurred: {http_err}"
#         if response.status_code == 401:
#             error_msg += ". Check your OpenWeatherMap API Key."
#         return jsonify({"error": error_msg}), response.status_code
#     except requests.exceptions.ConnectionError as conn_err:
#         return jsonify({"error": f"Connection error occurred: {conn_err}"}), 503
#     except requests.exceptions.Timeout as timeout_err:
#         return jsonify({"error": f"Timeout error occurred: {timeout_err}"}), 504
#     except requests.exceptions.RequestException as req_err:
#         return jsonify({"error": f"An error occurred during API request: {req_err}"}), 500
#     except KeyError as e:
#         return jsonify({"error": f"Invalid data received from API or missing key: {e}. Check city name and API response structure."}), 500
#     except Exception as e:
#         return jsonify({"error": f"An unexpected server error occurred: {e}"}), 500

# # ----- Predict Temperature Route -----
# @app.route('/predict_temperature', methods=['GET'])
# def predict_temperature():
#     if PREDICTIVE_MODEL is None:
#         return jsonify({"error": "Prediction model not loaded. Please check backend logs."}), 500

#     city_name = request.args.get('city')
#     humidity = request.args.get('humidity', type=float)
#     pressure = request.args.get('pressure', type=float)
#     wind_speed = request.args.get('wind_speed', type=float)

#     current_time = datetime.now()
#     hour_of_day = current_time.hour
#     day_of_week = current_time.weekday()
#     month = current_time.month

#     if not all([city_name, humidity is not None, pressure is not None, wind_speed is not None]):
#         return jsonify({"error": "Missing one or more required parameters: city, humidity, pressure, wind_speed"}), 400

#     input_data = {
#         'humidity': [humidity],
#         'pressure': [pressure],
#         'wind_speed': [wind_speed],
#         'hour_of_day': [hour_of_day],
#         'day_of_week': [day_of_week],
#         'month': [month]
#     }

#     input_df = pd.DataFrame(input_data)

#     for feature in MODEL_FEATURES:
#         if feature not in input_df.columns:
#             input_df[feature] = 0

#     city_col_name = f'city_{city_name}'
#     if city_col_name in input_df.columns:
#         input_df[city_col_name] = 1
#     else:
#         print(f"Warning: Unknown city '{city_name}' for prediction. Model might not perform well as its one-hot encoding is not activated.")

#     try:
#         prediction_input = input_df[MODEL_FEATURES]
#     except KeyError as k_err:
#         return jsonify({"error": f"Feature mismatch for prediction. Missing expected feature: {k_err}. Ensure MODEL_FEATURES list is correct and all expected columns are created."}), 500
#     except Exception as e:
#         return jsonify({"error": f"Error preparing prediction input: {e}"}), 500

#     try:
#         predicted_temperature = PREDICTIVE_MODEL.predict(prediction_input)[0]
#         return jsonify({
#             "city": city_name,
#             "predicted_temperature": round(predicted_temperature, 2)
#         })
#     except Exception as e:
#         return jsonify({"error": f"Error during prediction: {e}"}), 500

# if __name__ == '__main__':
#     # Local development ke liye .env file se API key load karne ke liye
#     # aapko ek .env file banani padegi 'backend' folder mein
#     # usmein likhna padega: OPENWEATHER_API_KEY="YOUR_ACTUAL_API_KEY"
#     # app.run(debug=True)
#     # Production ke liye, Render apne aap environment variables provide karta hai
#     app.run(host='0.0.0.0', port=os.environ.get('PORT', 10000)) # Render production settings

import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import joblib
import pandas as pd
from datetime import datetime
import sqlite3

# Flask app initialization
app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), 'static'))
CORS(app)

# Database Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_NAME = os.path.join(BASE_DIR, 'weather_data.db')

# Load environment variables from .env file (for local development)
load_dotenv()
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')

if not OPENWEATHER_API_KEY:
    print("WARNING: OPENWEATHER_API_KEY environment variable not found. Weather API calls will likely fail.")

BASE_URL = "http://api.openweathermap.org/data/2.5/"

# Load the trained ML model
MODEL_PATH = os.path.join(BASE_DIR, 'linear_regression_model.joblib')

PREDICTIVE_MODEL = None # Global variable to store the loaded model

try:
    PREDICTIVE_MODEL = joblib.load(MODEL_PATH)
    print("Machine Learning Model loaded successfully!")
except FileNotFoundError:
    print(f"Error: Model file not found at {MODEL_PATH}. Please ensure it is saved and committed to Git.")
except Exception as e:
    print(f"Error loading the ML model: {e}")

# MODEL_FEATURES list for prediction (no city-specific features, same as last update)
MODEL_FEATURES = ['humidity', 'pressure', 'wind_speed', 'hour_of_day', 'day_of_week', 'month']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/weather')
def get_weather():
    city = request.args.get('city')
    if not city:
        return jsonify({"error": "City parameter is required"}), 400

    params = {
        "q": city,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }

    try:
        # Fetch current weather data
        current_weather_url = f"{BASE_URL}weather"
        response = requests.get(current_weather_url, params=params)
        response.raise_for_status()
        current_data = response.json()

        # Fetch 5-day / 3-hour forecast data
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
            # Removed sunrise, sunset as per the desired UI's display
        }

        # --- Start Database Insertion Logic for current_weather ---
        conn = None
        try:
            conn = sqlite3.connect(DATABASE_NAME)
            cursor = conn.cursor()

            # Create table if it doesn't exist
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS current_weather (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    city TEXT NOT NULL,
                    country TEXT,
                    description TEXT,
                    feels_like REAL,
                    humidity INTEGER,
                    icon TEXT,
                    pressure INTEGER,
                    temperature REAL,
                    wind_speed REAL,
                    collection_timestamp TEXT
                )
            ''')
            conn.commit()

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
            print(f"ERROR: Could not save data for {city} to database. SQLite Error: {e}")
        finally:
            if conn:
                conn.close()
        # --- End Database Insertion Logic ---

        # Process 5-day daily forecast data
        daily_forecasts = {}
        for item in forecast_data["list"]:
            date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
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

        # Removed hourly forecast processing as it's not needed for the desired UI.

        return jsonify({
            "current_weather": weather_info,
            "forecast": forecast_list # Only daily forecast
        })

    except requests.exceptions.HTTPError as http_err:
        error_msg = f"HTTP error occurred: {http_err}"
        if response.status_code == 401:
            error_msg += ". Check your OpenWeatherMap API Key."
        elif response.status_code == 404:
            error_msg += ". City not found."
        return jsonify({"error": error_msg}), response.status_code
    except requests.exceptions.ConnectionError as conn_err:
        return jsonify({"error": f"Connection error occurred: {conn_err}"}), 503
    except requests.exceptions.Timeout as timeout_err:
        return jsonify({"error": f"Timeout error occurred: {timeout_err}"}), 504
    except requests.exceptions.RequestException as req_err:
        return jsonify({"error": f"An error occurred during API request: {req_err}"}), 500
    except KeyError as e:
        return jsonify({"error": f"Invalid data received from API or missing key: {e}. Check city name."}), 500
    except Exception as e:
        return jsonify({"error": f"An unexpected server error occurred: {e}"}), 500

# ----- Predict Temperature Route (Same as previous update for warning fix) -----
@app.route('/predict_temperature', methods=['GET'])
def predict_temperature():
    if PREDICTIVE_MODEL is None:
        return jsonify({"error": "Prediction model not loaded. Please check backend logs."}), 500

    humidity = request.args.get('humidity', type=float)
    pressure = request.args.get('pressure', type=float)
    wind_speed = request.args.get('wind_speed', type=float)

    current_time = datetime.now()
    hour_of_day = current_time.hour
    day_of_week = current_time.weekday()
    month = current_time.month

    if not all([humidity is not None, pressure is not None, wind_speed is not None]):
        return jsonify({"error": "Missing one or more required parameters: humidity, pressure, wind_speed"}), 400

    input_data = {
        'humidity': [humidity],
        'pressure': [pressure],
        'wind_speed': [wind_speed],
        'hour_of_day': [hour_of_day],
        'day_of_week': [day_of_week],
        'month': [month]
    }

    input_df = pd.DataFrame(input_data)

    for feature in MODEL_FEATURES:
        if feature not in input_df.columns:
            input_df[feature] = 0

    try:
        prediction_input = input_df[MODEL_FEATURES]
    except KeyError as k_err:
        return jsonify({"error": f"Feature mismatch for prediction. Missing expected feature: {k_err}. Ensure MODEL_FEATURES list is correct and all expected columns are created."}), 500
    except Exception as e:
        return jsonify({"error": f"Error preparing prediction input: {e}"}), 500

    try:
        predicted_temperature = PREDICTIVE_MODEL.predict(prediction_input)[0]
        return jsonify({
            "predicted_temperature": round(predicted_temperature, 2)
        })
    except Exception as e:
        return jsonify({"error": f"Error during prediction: {e}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=os.environ.get('PORT', 10000))
