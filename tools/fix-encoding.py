#!/usr/bin/env python3
"""Fix UTF-8 mojibake encoding issues in translated HTML files."""

import sys
import os

# Common mojibake patterns (UTF-8 bytes misinterpreted as Windows-1252)
REPLACEMENTS = {
    'ÔÇö': '—',      # em-dash
    'ÔÇÖ': "'",      # right single quote (using ASCII apostrophe)
    'ÔÇô': '–',      # en-dash
    'ÔÇ£': '"',      # left double quote
    'ÔÇØ': '"',      # right double quote
    '├®': 'é',
    '├®': 'é',
    '├ë': 'ë',
    '├½': 'í',
    '├│': 'ó',
    '├║': 'ú',
    '├Â': 'Ö',
    '├ñ': 'ñ',
    '├í': 'á',
    '├╝': 'ü',
    '├Ñ': 'Ü',
    '├Á': 'ö',
    '├ä': 'ä',
    '├à': 'à',
    '├¿': 'è',
    '├¡': 'ï',
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã¶': 'ö',
    'Ã¼': 'ü',
    'Ã¤': 'ä',
    'Ã': 'Ö',
    'Ã': 'Ü',
    'ÃŸ': 'ß',
}

def fix_file(filepath):
    """Fix encoding issues in a single file."""
    print(f"Processing: {filepath}")
    
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    for old, new in REPLACEMENTS.items():
        content = content.replace(old, new)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Fixed encoding issues in {filepath}")
    else:
        print(f"  No changes needed in {filepath}")

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    files_to_fix = [
        os.path.join(base_dir, 'src', 'blog', 'creatine-hair-loss-nl.html'),
        os.path.join(base_dir, 'src', 'blog', 'creatine-hair-loss-de.html'),
    ]
    
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            fix_file(filepath)
        else:
            print(f"File not found: {filepath}")
    
    print("\nDone!")
