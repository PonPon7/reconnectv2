import json
from django.conf import settings
import os

# Used to continously sync between React build entry points - X.js and Y.css
# And Django project envinronemnt - to allow automatic name updating
# Reads from React build asset-manifest.json
# Prepares requests for Django's HTML template calling to load .js and .css entry-points.


def react_assets(request):
    manifest_path = settings.BASE_DIR / "landing_page/static/ReactPage_FoodProphet/asset-manifest.json"
    try:
        with open(manifest_path, "r") as manifest_file:
            manifest = json.load(manifest_file)
            return {
                "react_assets": {
                    "css": manifest["files"].get("main.css"),
                    "js": manifest["files"].get("main.js"),
                }
            }
    except FileNotFoundError:
        return {"react_assets": {}}


print(os.getenv('DJANGO_ENV'))
