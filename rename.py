import os

# Replacements to make
replacements = {
    'Qinert': 'Qinert',
    'qinert': 'qinert',
    'QINERT': 'QINERT'
}

# Directories to skip
skip_dirs = {
    '.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', 
    'qinert.egg-info', '.pytest_cache', 'certs'
}

# Binary/unsupported extensions to skip
skip_exts = {
    '.pyc', '.png', '.jpg', '.jpeg', '.ico', '.pdf', '.zip', '.tar', '.gz', 
    '.whl', '.sqlite3', '.db', '.DS_Store', '.woff', '.woff2', '.ttf', '.eot'
}

def replace_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        # Not a UTF-8 text file, skip
        return False
        
    changed = False
    for old, new in replacements.items():
        if old in content:
            content = content.replace(old, new)
            changed = True
            
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
            
    return changed

def walk_and_replace(root_dir):
    changed_files = 0
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Modify dirnames in-place to skip unwanted directories
        dirnames[:] = [d for d in dirnames if d not in skip_dirs and not d.endswith('.egg-info')]
        
        for filename in filenames:
            ext = os.path.splitext(filename)[1].lower()
            if ext in skip_exts:
                continue
                
            filepath = os.path.join(dirpath, filename)
            if replace_in_file(filepath):
                changed_files += 1
                print(f"Updated: {filepath}")
                
    return changed_files

if __name__ == '__main__':
    root = r'c:\games\Qinert'
    print("Starting text replacement...")
    changed = walk_and_replace(root)
    print(f"Total files updated: {changed}")
