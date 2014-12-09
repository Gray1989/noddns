noddns
======

NoDDNS No-IP Secure (SSL) Dynamic DNS IP updater for Node.js

##### Easy Installation:
Assuming both Node.js and NPM are already installed and the correct environment variables are already set, in a command-line interface (with your app directory as the working directory to install the module into), type the following:
```
npm install noddns
```

##### Initialization:
`NoDDNS` will be used for the rest of the documentation
```javascript
var NoDDNS = require('noddns');
```

##### Usage:
 * ##### NoDDNS.updateIP(credentials, hostname, newip, callback, timeout)
    Updates IP address with no-ip.com's servers
    * credentials (string) - Format username:password
    * hostname (string) - Example host123.ddns.net
    * newip (string) - [IPAddress]|ONLINE|OFFLINE|[0=Auto/Default]
    * callback (function) - Returns DDNSResponse (object) asynchronously
        * DDNSResponse.ResponseCode - HTTP Response Code
        * DDNSResponse.Code - API Response Code
        * DDNSResponse.IPAddress - IP Address (if in response)
    * timeout (integer) - Max timeout in milliseconds (1/1000th of a second)
 * ##### NoDDNS.setUserAgent(appName, appVersion, appEmail)
    Used to change the user agent for API communications (important)
    * appName (string) - Name of your app (no spaces)
    * appVersion (string/numeric) - Your app version
    * appEmail (string) - Email address of app or app maintainer
 * ##### NoDDNS.setServer(newDDNSServer)
    Used to change the server which the IP update request is sent to*
    * newDDNSServer (string) - Server address
 * ##### NoDDNS.setSSLRootCACertificate(newCACertificate)
    Used to change the root CA used for verification of server with SSL*
    * newCACertificate (string) - PEM/Base64-encoded X.509 certificate
 * ##### NoDDNS.setDefaultTimeout(newTimeout)
    Used to change the default connection timeout*
    * newTimeout (integer) - New timeout in milliseconds

Example usage as a command-line interface:

```javascript
var NoDDNS = require('noddns');
if(!process.argv[3]) console.log('Command Line Interface (CLI) Usage:\n'
    + '  node dyndns.js username:password host [ipaddress|0] [timeout]\n'
    + '    node dyndns.js johnsmith:secret123 myhost.ddns.net\n'
    + '    node dyndns.js johnsmith:secret123 myhost.ddns.net 127.0.0.1\n'
    + '    node dyndns.js johnsmith:secret123 myhost.ddns.net 127.0.0.1 40000\n'
    + '    node dyndns.js johnsmith:secret123 myhost.ddns.net 0 40000\n'
    + '  * The IP address being ommitted is the same as specifying it as 0.\n'
    + '    This will default to the (public) IP used to make the connection.\n'
	+ '  * IP Address can also be specified as ONLINE or OFFLINE');
else { // Implementation:
    NoDDNS.setUserAgent('ConsoleDDNS', '1.2.1', 'your@email.com');
    NoDDNS.updateIP(process.argv[2], process.argv[3], process.argv[4], function(DDNSResponse) {
        if(DDNSResponse) {
            switch(DDNSResponse.Code) {
                case 'good':
                    console.log('IP Address Changed ['+DDNSResponse.IPAddress+']');
                    break;
                case 'nochg': // Important: IP Address *may* be undefined if there is no change!
                    console.log(DDNSResponse.IPAddress?'IP Address Unchanged ['+DDNSResponse.IPAddress+']':'IP Address Unchanged');
                    break;
                case 'nohost':
                    console.log('Invalid host');
                    break;
                case 'badauth':
                    console.log('Invalid credentials');
                    break;
                case 'badagent':
                    console.log('Bad agent used');
                    break;
                case '!donator':
                    console.log('Access denied to requested feature');
                    break;
                case 'abuse':
                    console.log('System abuse detected');
                    break;
                case '911':
                    console.log('Fatal server-side error');
                    break;
                default:
                    console.log('Unknown response: '+DDNSResponse.Code);
                }
            }
        else console.log("Connection error");
        }, process.argv[5]);
    }
```