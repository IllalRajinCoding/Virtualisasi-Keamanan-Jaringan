# 2026-07-09 14:19:41 by RouterOS 7.21.4
# system id = 054VDDJWFBM
#
/interface ethernet
set [ find default-name=ether2 ] disable-running-check=no name=DMZ
set [ find default-name=ether3 ] disable-running-check=no name=LAN
set [ find default-name=ether4 ] disable-running-check=no name=MGMT
set [ find default-name=ether1 ] disable-running-check=no name=WAN
/ip address
add address=7.7.7.1/30 interface=DMZ network=7.7.7.0
add address=192.168.56.1/24 interface=LAN network=192.168.56.0
add address=192.168.100.1/24 comment="Management Network" interface=MGMT \
    network=192.168.100.0
/ip dhcp-client
add interface=WAN
/ip dns
set allow-remote-requests=yes servers=8.8.8.8,1.1.1.1
/ip firewall address-list
add address=203.0.113.10 comment="Blocked Attacker" list=blacklist
/ip firewall filter
add action=drop chain=input comment="INPUT - Drop Blacklisted IP" log=yes \
    log-prefix="BLACKLIST: " src-address-list=blacklist
add action=add-src-to-address-list address-list=blacklist \
    address-list-timeout=1d chain=input comment=\
    "Detect Excessive Connections" connection-limit=30,32 protocol=tcp
add action=accept chain=input comment="INPUT - Established Related" \
    connection-state=established,related
add action=add-src-to-address-list address-list=port_scanner \
    address-list-timeout=1d chain=input comment="Detect Port Scanner" \
    protocol=tcp psd=21,3s,3,1
add action=drop chain=input comment="INPUT - Drop Invalid" connection-state=\
    invalid
add action=drop chain=input comment="Drop Port Scanner" log=yes log-prefix=\
    "PORTSCAN: " src-address-list=port_scanner
add action=accept chain=input comment="INPUT - Allow Ping" protocol=icmp
add action=accept chain=input comment="INPUT - Winbox MGMT" dst-port=8291 \
    protocol=tcp src-address=192.168.100.0/24
add action=accept chain=input comment="INPUT - SSH LAN" dst-port=22 protocol=\
    tcp src-address=192.168.56.0/24
add action=drop chain=input comment="INPUT - Drop All"
add action=accept chain=forward comment="FORWARD - Established Related" \
    connection-state=established,related
add action=drop chain=forward comment="FORWARD - Drop Invalid" \
    connection-state=invalid
add action=accept chain=forward comment="FORWARD - WAN HTTP -> DMZ" \
    dst-address=7.7.7.2 dst-port=80 in-interface=WAN protocol=tcp
add action=accept chain=forward comment="FORWARD - WAN HTTPS -> DMZ" \
    dst-address=7.7.7.2 dst-port=443 in-interface=WAN protocol=tcp
add action=drop chain=forward comment="HTTP Flood Protection" \
    connection-limit=100,32 dst-address=7.7.7.2 dst-port=80,443 protocol=tcp
add action=accept chain=forward comment="FORWARD - DMZ MySQL" dst-address=\
    192.168.56.10 dst-port=3306 protocol=tcp src-address=7.7.7.2
add action=accept chain=forward comment="FORWARD - LAN Internet" \
    out-interface=WAN src-address=192.168.56.0/24
add action=accept chain=forward comment="FORWARD - DMZ Internet" \
    out-interface=WAN src-address=7.7.7.0/30
add action=drop chain=forward comment="Block Direct Docker Access" \
    dst-address=7.7.7.2 dst-port=3000,5000 in-interface=WAN protocol=tcp
add action=drop chain=forward comment="FORWARD - Block WAN to LAN" \
    in-interface=WAN out-interface=LAN
add action=drop chain=forward comment="FORWARD - Block DMZ to LAN" \
    dst-address=192.168.56.0/24 src-address=7.7.7.0/30
add action=drop chain=forward comment="FORWARD - Drop All"
/ip firewall nat
add action=masquerade chain=srcnat comment="Internet NAT" out-interface=WAN
add action=dst-nat chain=dstnat comment="HTTP to Nginx" dst-port=80 \
    in-interface=WAN protocol=tcp to-addresses=7.7.7.2 to-ports=80
add action=dst-nat chain=dstnat comment="HTTPS to Nginx" dst-port=443 \
    in-interface=WAN protocol=tcp to-addresses=7.7.7.2 to-ports=443
