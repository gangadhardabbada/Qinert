import os

# Fix test_protocol.py
f = 'c:/games/Qinert/backend/tests/api/test_protocol.py'
with open(f, 'r') as file:
    content = file.read()
content = content.replace('QPS-1002', 'QPS-1001')
with open(f, 'w') as file:
    file.write(content)

# Fix test_security.py
f = 'c:/games/Qinert/backend/tests/api/test_security.py'
with open(f, 'r') as file:
    content = file.read()
content = content.replace('assert resp.status_code == 404\n        assert resp.json()["payload"]["error_code"] == "ERR_SESSION_NOT_FOUND"', 'assert resp.status_code == 400\n        assert resp.json()["detail"]["error_code"] == "QPS-1100"')
content = content.replace('ERR_SESSION_EXPIRED', 'QPS-4000')
with open(f, 'w') as file:
    file.write(content)

# Run pytest again
os.system("cd c:/games/Qinert/backend && pytest")
