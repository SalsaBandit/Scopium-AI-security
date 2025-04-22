from django.http import JsonResponse
import subprocess
from .forensic_tools import *

def run_tool_1(request):
    try:
        # Example: Run a Python forensic tool script
        result = subprocess.run(['python3', 'forensic_tools/loganalysis.py'], capture_output=True, text=True)
        return JsonResponse({'success': True, 'output': result.stdout})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})

def run_tool_2(request):
    try:
        # Example: Run another forensic tool
        result = subprocess.run(['python3', 'forensic_tools/fileactivemon.py'], capture_output=True, text=True)
        return JsonResponse({'success': True, 'output': result.stdout})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})