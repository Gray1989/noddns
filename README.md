noddns
======

NoDDNS No-IP Secure (SSL) Dynamic DNS IP updater for Node.js

Example usage as a command-line interface:

	var NoDDNS = require('noddns');
	if(!process.argv[3]) console.log('Command Line Interface (CLI) Usage:\n'
		+ '  node dyndns.js username:password host [ipaddress|0] [timeout]\n'
		+ '    node dyndns.js johnsmith:secret123 myhost.ddns.net\n'
		+ '    node dyndns.js johnsmith:secret123 myhost.ddns.net 127.0.0.1\n'
		+ '    node dyndns.js johnsmith:secret123 myhost.ddns.net 127.0.0.1 40000\n'
		+ '    node dyndns.js johnsmith:secret123 myhost.ddns.net 0 40000\n'
		+ '  * The IP address being ommitted is the same as specifying it as 0.\n'
		+ '    This will default to the (public) IP used to make the connection.');
	else { // Implementation:
		NoDDNS.setUserAgent('ConsoleDDNS', .1, 'your@email.com');
		NoDDNS.updateIP(process.argv[2], process.argv[3], process.argv[4], function(DDNSResponse) {
			if(DDNSResponse) {
				switch(DDNSResponse.Code) {
					case 'good':
						console.log('IP Address Changed ['+DDNSResponse.IPAddress+']');
						break;
					case 'nochg': // Important: IP Address *may* be undefined if there is no change!
						console.log(DDNSResponse.IPAddress?'IP Address Unchanged ['+DDNSResponse.IPAddress+']':'IP Address Unchanged');
						break;
					case 'badauth':
						console.log('Invalid credentials');
						break;
					case 'nohost':
						console.log('Invalid host');
						break;
					default:
						console.log('Unknown response: '+DDNSResponse.Code);
					}
				}
			else console.log("Connection error");
			}, process.argv[5]);
		}