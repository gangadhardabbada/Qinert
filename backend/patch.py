import os
def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Patch all the handshake calls that end with '        })'
    content = content.replace('"supported_algorithms": ["bb84"]\n        })', '"supported_algorithms": ["bb84"]\n        }, headers={"X-Qinert-Simulate": "true"})')
    content = content.replace('"supported_algorithms": ["bb84"]\n            })', '"supported_algorithms": ["bb84"]\n            }, headers={"X-Qinert-Simulate": "true"})')
    
    with open(filepath, 'w') as f:
        f.write(content)

for root, _, files in os.walk('c:/games/Qinert/backend/tests'):
    for file in files:
        if file.endswith('.py'):
            patch_file(os.path.join(root, file))
print('Done!')
