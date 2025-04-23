import sys
import json
from collections import defaultdict
import re
import os
import subprocess
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

def parse_log(file_content):
    """Parse JSON logs and detect error frequency."""
    error_counts = defaultdict(int)

    try:
        logs = json.loads(file_content)  # Parse the JSON content
        for log in logs:
            log_level = log.get("log_level", "").upper()
            message = log.get("message", "")
            if log_level == "ERROR":
                error_counts[message] += 1
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        sys.exit(1)

    return error_counts

def detect_anomalies(error_counts, threshold=5):
    """Detect error anomalies based on frequency threshold."""
    anomalies = [error for error, count in error_counts.items() if count >= threshold]
    return anomalies

@csrf_exempt
def run_tool_1(request):
    """Handle file upload and run the forensic tool."""
    if request.method == 'POST' and request.FILES.get('logfile'):
        log_file = request.FILES['logfile']

        # Path to the forensic tool script
        script_path = os.path.join(os.path.dirname(__file__), "forensic_tools/loganalysis.py")

        try:
            # Decode the file content from bytes to string
            file_content = log_file.read().decode('utf-8')  # Ensure the file is UTF-8 encoded

            # Pass the decoded file content to the forensic tool
            result = subprocess.run(
                ["python3", script_path],
                input=file_content,  # Pass the file content as input
                capture_output=True,
                text=True
            )
            if result.returncode == 0:
                return JsonResponse({"success": True, "output": result.stdout})
            else:
                return JsonResponse({"success": False, "error": result.stderr})
        except Exception as e:
            return JsonResponse({"success": False, "error": str(e)})
    else:
        return JsonResponse({"success": False, "error": "No file uploaded."})

if __name__ == "__main__":
    # Read file content from stdin
    file_content = sys.stdin.read()

    try:
        error_data = parse_log(file_content)
        anomalies = detect_anomalies(error_data)
        if anomalies:
            print("Anomalies detected:")
            for anomaly in anomalies:
                print(anomaly)
        else:
            print("No anomalies detected.")
    except Exception as e:
        print(f"An error occurred: {e}")
        