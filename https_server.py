# thanks Martin Pitt: http://www.piware.de/2011/01/creating-an-https-server-in-python/
import BaseHTTPServer, SimpleHTTPServer
import ssl

httpd = BaseHTTPServer.HTTPServer(('localhost', 4443), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket (httpd.socket, certfile='localhost.pem', server_side=True)
httpd.serve_forever()