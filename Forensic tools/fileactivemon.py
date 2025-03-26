import os
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class FileActivityHandler(FileSystemEventHandler):
    def on_created(self, event):
        print(f"File created: {event.src_path}")

    def on_deleted(self, event):
        print(f"File deleted: {event.src_path}")

    def on_modified(self, event):
        print(f"File modified: {event.src_path}")

    def on_moved(self, event):
        print(f"File moved from {event.src_path} to {event.dest_path}")

def monitor_directory(directory_path):
    """Monitor file system activities in real time."""
    event_handler = FileActivityHandler()
    observer = Observer()
    observer.schedule(event_handler, directory_path, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    directory_to_monitor = "/path/to/monitor"
    monitor_directory(directory_to_monitor)