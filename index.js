// NoDDNS No-IP Secure (SSL) Dynamic DNS IP updater module by Jonathan Gray
var https = require('https'),
	REPORTED_USERAGENT = 'NoDDNS/1.2.1 noddns@email', // [name/version email@domain] - Required by no-ip
	DEFAULT_TIMEOUT = 30000, // Value in milliseconds; 30-second default
	DDNS_SERVER = 'dynupdate.no-ip.com', // Server DDNS update requests are sent to
	/*	SSL Signing Chain:
			Equifax (Root CA, Expires August 22 2018)
				-> GeoTrust Global CA (intermediate)
					-> GeoTrust SSL CA - G2 (intermediate)
						-> *.no-ip.com
	Root CA certificate (Equifax) below, embedded for devices without this CA installed. */
	ROOT_CA_CERT = '-----BEGIN CERTIFICATE-----\n'
	+'MIIDIDCCAomgAwIBAgIENd70zzANBgkqhkiG9w0BAQUFADBOMQswCQYDVQQGEwJV\n'
	+'UzEQMA4GA1UEChMHRXF1aWZheDEtMCsGA1UECxMkRXF1aWZheCBTZWN1cmUgQ2Vy\n'
	+'dGlmaWNhdGUgQXV0aG9yaXR5MB4XDTk4MDgyMjE2NDE1MVoXDTE4MDgyMjE2NDE1\n'
	+'MVowTjELMAkGA1UEBhMCVVMxEDAOBgNVBAoTB0VxdWlmYXgxLTArBgNVBAsTJEVx\n'
	+'dWlmYXggU2VjdXJlIENlcnRpZmljYXRlIEF1dGhvcml0eTCBnzANBgkqhkiG9w0B\n'
	+'AQEFAAOBjQAwgYkCgYEAwV2xWGcIYu6gmi0fCG2RFGiYCh7+2gRvE4RiIcPRfM6f\n'
	+'BeC4AfBONOziipUEZKzxa1NfBbPLZ4C/QgKO/t0BCezhABRP/PvwDN1Dulsr4R+A\n'
	+'cJkVV5MW8Q+XarfCaCMczE1ZMKxRHjuvK9buY0V7xdlfUNLjUA86iOe/FP3gx7kC\n'
	+'AwEAAaOCAQkwggEFMHAGA1UdHwRpMGcwZaBjoGGkXzBdMQswCQYDVQQGEwJVUzEQ\n'
	+'MA4GA1UEChMHRXF1aWZheDEtMCsGA1UECxMkRXF1aWZheCBTZWN1cmUgQ2VydGlm\n'
	+'aWNhdGUgQXV0aG9yaXR5MQ0wCwYDVQQDEwRDUkwxMBoGA1UdEAQTMBGBDzIwMTgw\n'
	+'ODIyMTY0MTUxWjALBgNVHQ8EBAMCAQYwHwYDVR0jBBgwFoAUSOZo+SvSspXXR9gj\n'
	+'IBBPM5iQn9QwHQYDVR0OBBYEFEjmaPkr0rKV10fYIyAQTzOYkJ/UMAwGA1UdEwQF\n'
	+'MAMBAf8wGgYJKoZIhvZ9B0EABA0wCxsFVjMuMGMDAgbAMA0GCSqGSIb3DQEBBQUA\n'
	+'A4GBAFjOKer89961zgK5F7WF0bnj4JXMJTENAKaSbn+2kmOeUJXRmm/kEd5jhW6Y\n'
	+'7qj/WsjTVbJmcVfewCHrPSqnI0kBBIZCe/zuf6IWUrVnZ9NA2zsmWLIodz2uFHdh\n'
	+'1voqZiegDfqnc1zqcPGUIWVEX/r87yloqaKHee9570+sB3c4\n'
	+'-----END CERTIFICATE-----\n\n';

exports.updateIP = function(credentials, hostname, newip, callback, timeout) {
	// Handles the technical portion of the HTTP request
	var DDNSRequest = https.request({
		hostname: DDNS_SERVER,
		port: 443,
		path: '/nic/update?hostname='
			+ encodeURIComponent(hostname) // Added support for online/offline feature in place of IP
			+ (newip&&newip!=='0'?(newip==='OFFLINE'?'&offline=YES':(newip==='ONLINE'?'&offline=NO':'&myip='+encodeURIComponent(newip))):''),
		method: 'GET',
		auth: credentials,
		ca: ROOT_CA_CERT,
		headers: {'User-Agent':REPORTED_USERAGENT},
		agent: false
		},
		function(res) {
			var DDNSResponse = '';
			res.on('data', function(ch) {
				DDNSResponse += ch;
				});
			res.on('end', function() {
				// Fired only when a successful response is received
				var SpaceIndex = DDNSResponse.indexOf(' ');
				DDNSResponse = {
					ResponseCode: res.statusCode,
					Code: SpaceIndex!==-1?DDNSResponse.substr(0,SpaceIndex):DDNSResponse,
					IPAddress: SpaceIndex!==-1?DDNSResponse.substr(SpaceIndex+1):undefined
					};
				clearTimeout(DDNSTimeout);
				callback(DDNSResponse);
				});
			}
		),
	// Basic connection error handling
	DDNSTimeout = setTimeout(function() {
		DDNSRequest.abort();
		}, timeout || DEFAULT_TIMEOUT);
	DDNSRequest.on('error', function(e) {
		clearTimeout(DDNSTimeout);
		callback(false);
		});
	DDNSRequest.end();
	};

exports.setUserAgent = function(appName, appVersion, appEmail) {
	// You should call this method to properly set the User Agent before calling the .updateIP method.
	REPORTED_USERAGENT = appName+'/'+appVersion+' '+appEmail;
	};

exports.setServer = function(newDDNSServer) {
	// Used to change the DDNS server which the IP update request is sent to (should normally not need to be changed)
	DDNS_SERVER = newDDNSServer;
	};

exports.setSSLRootCACertificate = function(newCACertificate) {
	// This changes the root certification authority certificate used to verify the identity of no-ip
	ROOT_CA_CERT = newCACertificate;
	};

exports.setDefaultTimeout = function(newTimeout) {
	// Changes the default timeout used for request that don't specify one
	DEFAULT_TIMEOUT = newTimeout;
	};