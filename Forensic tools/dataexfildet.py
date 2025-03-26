from scapy.all import sniff
import time

threshold = 1000  # Define a threshold for the amount of data transferred in bytes

def packet_handler(packet, packet_count=[0]):
    """Handle and log large data packets."""
    if packet.haslayer("IP"):
        packet_count[0] += len(packet)
        if packet_count[0] > threshold:
            print(f"Potential data exfiltration detected. Total bytes: {packet_count[0]}")
            packet_count[0] = 0  # Reset after alert

def monitor_data_exfiltration(interface="eth0"):
    """Monitor and detect potential data exfiltration."""
    print("Monitoring for data exfiltration...")
    sniff(iface=interface, prn=packet_handler)

if __name__ == "__main__":
    monitor_data_exfiltration(interface="eth0")