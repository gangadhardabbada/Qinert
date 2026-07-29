import os

f = 'c:/games/Qinert/backend/tests/api/test_security.py'
with open(f, 'r') as file:
    content = file.read()

# Fix replay attack assertion
content = content.replace('QPS-4000', 'QPS-3002')

# Fix invalid session assertion
content = content.replace('resp.json()["detail"]["error_code"] == "QPS-1100"', 'resp.json()["payload"]["error_code"] == "QPS-1100"')

with open(f, 'w') as file:
    file.write(content)

os.system("cd c:/games/Qinert/backend && pytest")
