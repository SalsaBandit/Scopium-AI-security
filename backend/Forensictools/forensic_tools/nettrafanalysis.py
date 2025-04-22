from scapy.all import sniff

def packet_handler(packet):
    """Handle captured network packet."""
    if packet.haslayer('IP'):
        src_ip = packet['IP'].src
        dst_ip = packet['IP'].dst
        print(f"Captured Packet: {src_ip} -> {dst_ip}")

def capture_packets(interface="eth0", count=10):
    """Capture and analyze network packets."""
    print("Starting packet capture...")
    sniff(iface=interface, prn=packet_handler, count=count)

if __name__ == "__main__":
    capture_packets(interface="eth0", count=10)