import sqlite3

DATABASE_NAME = 'weather_data.db'

def create_table():
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()

        # Create table for current weather data
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
                collection_timestamp TEXT NOT NULL
            )
        ''')
        print(f"Table 'current_weather' created successfully in {DATABASE_NAME}")
        conn.commit()
    except sqlite3.Error as e:
        print(f"Error creating table: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    create_table()