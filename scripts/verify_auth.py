import json
import http.client

conn = http.client.HTTPConnection('localhost', 8180, timeout=10)
payload = json.dumps({
    'email': 'verify-flow-python@example.com',
    'password': 'secret123',
    'firstName': 'Verify',
    'lastName': 'Python',
    'phone': '123456789'
})
headers = {'Content-Type': 'application/json'}
conn.request('POST', '/api/session/register', body=payload, headers=headers)
res = conn.getresponse()
body = res.read().decode('utf-8')
print('register_status', res.status)
print('register_body', body)
set_cookie = res.getheader('Set-Cookie') or ''
print('set_cookie', set_cookie)

conn2 = http.client.HTTPConnection('localhost', 8180, timeout=10)
headers2 = {}
if set_cookie:
    headers2['Cookie'] = set_cookie.split(';')[0]
conn2.request('GET', '/api/session/me', headers=headers2)
res2 = conn2.getresponse()
body2 = res2.read().decode('utf-8')
print('me_status', res2.status)
print('me_body', body2)
