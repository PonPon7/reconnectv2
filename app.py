from flask import Flask, jsonify
import psycopg2

app = Flask(__name__)

# Database connection configuration
DB_CONFIG = {
    'dbname': 'reconnectv2',
    'user': 'postgres',
    'password': 'dummytest',  # Replace with your Cloud SQL PostgreSQL password
    'host': 'dummy',  # Replace with your Cloud SQL instance's public IP
    'port': 5432
}


@app.route('/', methods=['GET'])
def test_db_connection():
    try:
        # Connect to the database
        connection = psycopg2.connect(**DB_CONFIG)
        cursor = connection.cursor()

        # Test query
        cursor.execute('SELECT version();')
        db_version = cursor.fetchone()

        # Close connection
        cursor.close()
        connection.close()

        return jsonify({'status': 'success', 'db_version': db_version[0]}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
