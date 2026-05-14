import os
import re

pages_dir = 'src/pages'

for filename in os.listdir(pages_dir):
    if filename.endswith('.jsx'):
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Upgrade Light Mode Backgrounds
        content = content.replace('bg-slate-50 dark:bg-slate-950', 'bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900')
        
        # Upgrade Light Mode Cards to Glassmorphism
        # Right now it's: bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl
        # We want: bg-white/70 backdrop-blur-xl dark:bg-slate-900/60
        # Wait, the script earlier did: bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl
        content = content.replace('bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl', 'bg-white/70 backdrop-blur-xl dark:bg-slate-900/60')
        content = content.replace('border-slate-200 dark:border-white/10', 'border-white/50 dark:border-white/10')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Upgraded Light Mode to premium glassmorphism.")
