import os
import sqlite3
import pandas as pd
import glob

DATABASE_NAME = 'weather_data.db'

# Directly paste the EXACT path you copied from Windows File Explorer here.
# Use a raw string (r"...") to avoid issues with backslashes.
CSV_FOLDER = r"C:\Saud_khan\notebook" # Example: r"C:\Saud_khan\notebooks"

def load_data_from_csv_to_db():
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        cursor = conn.cursor()

        # --- DEBUGGING PRINTS (yeh ab bhi useful hain, rehne do) ---
        print(f"DEBUG: Calculated CSV_FOLDER path: {CSV_FOLDER}")
        print(f"DEBUG: Contents of CSV_FOLDER (listing files):")
        try:
            if not os.path.exists(CSV_FOLDER):
                print(f"  - Error: CSV_FOLDER '{CSV_FOLDER}' does not exist.")
            elif not os.path.isdir(CSV_FOLDER):
                print(f"  - Error: CSV_FOLDER '{CSV_FOLDER}' is not a directory.")
            else:
                items = os.listdir(CSV_FOLDER)
                if not items:
                    print(f"  - Directory '{CSV_FOLDER}' is empty.")
                else:
                    for item in items:
                        print(f"  - {item}")
        except Exception as e:
            print(f"  - An unexpected error occurred while listing directory: {e}")
        # --- END DEBUGGING PRINTS ---

        csv_files_pattern = os.path.join(CSV_FOLDER, '*_current_weather.csv')
        print(f"DEBUG: Glob pattern used: {csv_files_pattern}")
        csv_files = glob.glob(csv_files_pattern)

        if not csv_files:
            print(f"No *_current_weather.csv files found matching pattern '{csv_files_pattern}'. Please check the path and file names.")
            return

        print(f"DEBUG: Found CSV files: {csv_files}")

        for csv_file in csv_files:
            print(f"Processing {os.path.basename(csv_file)}...")
            try:
                df = pd.read_csv(csv_file)
                df['collection_timestamp'] = df['collection_timestamp'].astype(str)
                df.to_sql('current_weather', conn, if_exists='append', index=False)
                print(f"Successfully loaded data from {os.path.basename(csv_file)}")
            except Exception as e:
                print(f"Error loading data from {os.path.basename(csv_file)}: {e}")

        conn.commit()
        print("\nAll historical CSV data loaded into the database.")

    except sqlite3.Error as e:
        print(f"Database error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    load_data_from_csv_to_db()