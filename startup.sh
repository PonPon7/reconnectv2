#!/bin/bash
echo "Copying database to /tmp/..."
cp db.sqlite3 /tmp/db.sqlite3

echo "Applying database migrations..."
python manage.py migrate

echo "Starting Gunicorn server..."
gunicorn -w 4 -b :8080 reconnect_v2.wsgi:application
