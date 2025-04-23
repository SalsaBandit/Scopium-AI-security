from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import subprocess
import os
from .forensic_tools import *


def run_tool_2(request):
    try:
        # Example: Run another forensic tool
        result = subprocess.run(['python3', 'forensic_tools/fileactivemon.py'], capture_output=True, text=True)
        return JsonResponse({'success': True, 'output': result.stdout})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

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