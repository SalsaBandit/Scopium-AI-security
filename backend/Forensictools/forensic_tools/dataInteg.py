import os
import hashlib
import time

def get_file_hash(file_path):
    """Generate SHA256 hash for a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    return sha256.hexdigest()

def monitor_directory(directory_path, interval=10):
    """Monitor a directory for file changes."""
    file_hashes = {}

    while True:
        for root, dirs, files in os.walk(directory_path):
            for file in files:
                file_path = os.path.join(root, file)
                current_hash = get_file_hash(file_path)

                if file_path not in file_hashes:
                    file_hashes[file_path] = current_hash
                elif file_hashes[file_path] != current_hash:
                    print(f"File changed: {file_path}")

        time.sleep(interval)

if __name__ == "__main__":
    path_to_monitor = "/path/to/monitor"
    monitor_directory(path_to_monitor)