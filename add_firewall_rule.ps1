# Add Firewall Rule for Port 5000

New-NetFirewallRule -DisplayName "Allow Node.js Port 5000" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
Write-Host "Firewall rule added for Port 5000"
