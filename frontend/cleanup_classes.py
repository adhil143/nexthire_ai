import os
import re

pages_dir = 'src/pages'

for filename in os.listdir(pages_dir):
    if filename.endswith('.jsx'):
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Cleanup mess
        content = content.replace('dark:bg-slate-900 dark:bg-slate-900/90/60', 'dark:bg-slate-900/60')
        content = content.replace('dark:bg-slate-800 dark:bg-slate-800/80', 'dark:bg-slate-800')
        content = content.replace('dark:border-slate-800 dark:border-slate-800', 'dark:border-slate-800')
        content = content.replace('dark:bg-slate-900 dark:bg-slate-900/90', 'dark:bg-slate-900')
        
        # Fix any instances of dark:bg-slate-950 hover:bg-slate-100 dark:bg-slate-800 dark:bg-slate-800/80
        content = re.sub(r'dark:bg-slate-800 dark:bg-slate-800/80', 'dark:bg-slate-800', content)

        # Other specific cleanup rules if needed
        content = content.replace('dark:text-indigo-400 hover:text-indigo-500 dark:text-indigo-400', 'hover:text-indigo-400')
        content = content.replace('dark:text-slate-100 dark:text-white', 'dark:text-white')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Cleaned up malformed classes.")
