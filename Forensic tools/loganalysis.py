import re
from collections import defaultdict

def parse_log(file_path):
    """Parse logs and detect error frequency."""
    error_counts = defaultdict(int)

    with open(file_path, 'r') as log_file:
        for line in log_file:
            match = re.search(r"\[(.*?)\]\s(\w+):\s(.*)", line)
            if match:
                timestamp, log_level, message = match.groups()
                if log_level == 'ERROR':
                    error_counts[message] += 1

    return error_counts

def detect_anomalies(error_counts, threshold=5):
    """Detect error anomalies based on frequency threshold."""
    anomalies = [error for error, count in error_counts.items() if count >= threshold]
    return anomalies

if __name__ == "__main__":
    log_path = "/path/to/logfile.log"
    error_data = parse_log(log_path)
    anomalies = detect_anomalies(error_data)
    if anomalies:
        print("Anomalies detected:")
        for anomaly in anomalies:
            print(anomaly)
    else:
        print("No anomalies detected.")