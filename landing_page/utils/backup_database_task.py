import os
import requests
import schedule
import time
from datetime import datetime, timedelta

# Configuration
EXPORT_ENDPOINT = "http://localhost:8000/export-database/"
# Production
# EXPORT_ENDPOINT = "http://reconnectv2.com/export-database/"

SECRET_KEY = os.getenv("SECRET_KEY_DB_EXPORT", None)  # Load from environment variable
print(f"Secret Key from env: {SECRET_KEY}")
LOCAL_BACKUP_DIR = "./backups"  # Directory to store backups
RETENTION_DAYS = 30  # Number of days to retain backups


def backup_database():
    try:
        # Step 1: Create backup directory if it doesn't exist
        if not os.path.exists(LOCAL_BACKUP_DIR):
            os.makedirs(LOCAL_BACKUP_DIR)

        # Step 2: Download the database from the /export-database endpoint
        print("Downloading database...")
        response = requests.get(f"{EXPORT_ENDPOINT}?secret_key={SECRET_KEY}")
        if response.status_code == 200:
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            local_backup_path = os.path.join(LOCAL_BACKUP_DIR, f"db_backup_{timestamp}.sqlite3")

            with open(local_backup_path, "wb") as f:
                f.write(response.content)

            print(f"Database backup saved locally at {local_backup_path}")

            # Step 3: Apply retention policy
            apply_retention_policy()

        else:
            print(f"Failed to download database. Status code: {response.status_code}")
            log_error(f"Database download failed with status code {response.status_code}")

    except Exception as e:
        print(f"Error during backup: {e}")
        log_error(f"Backup failed: {e}")


def apply_retention_policy():
    print("Applying retention policy...")
    try:
        cutoff_date = datetime.now() - timedelta(days=RETENTION_DAYS)
        for filename in os.listdir(LOCAL_BACKUP_DIR):
            file_path = os.path.join(LOCAL_BACKUP_DIR, filename)
            if os.path.isfile(file_path):
                file_modified_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                if file_modified_time < cutoff_date:
                    os.remove(file_path)
                    print(f"Deleted old backup: {file_path}")
    except Exception as e:
        print(f"Error during retention policy: {e}")
        log_error(f"Retention policy failed: {e}")


def log_error(message):
    # Simple logging to a file
    with open("backup_errors.log", "a") as log_file:
        log_file.write(f"{datetime.now()} - {message}\n")


def schedule_backup():
    # Schedule the backup job daily
    schedule.every().day.at("02:00").do(backup_database)  # Run at 2:00 AM daily
    print("Backup job scheduled. Waiting for the next run...")

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    backup_database()

    # schedule_backup()
