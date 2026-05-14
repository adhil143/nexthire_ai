import os
import re

replacements = {
    r'\bbg-white\b': 'bg-white dark:bg-slate-900/60 dark:backdrop-blur-xl',
    r'\bbg-slate-50\b': 'bg-slate-50 dark:bg-slate-950',
    r'\btext-slate-900\b': 'text-slate-900 dark:text-white',
    r'\btext-slate-800\b': 'text-slate-800 dark:text-slate-100',
    r'\btext-slate-700\b': 'text-slate-700 dark:text-slate-300',
    r'\btext-slate-600\b': 'text-slate-600 dark:text-slate-400',
    r'\btext-slate-500\b': 'text-slate-500 dark:text-slate-400',
    r'\bborder-slate-200\b': 'border-slate-200 dark:border-white/10',
    r'\bborder-slate-300\b': 'border-slate-300 dark:border-slate-700',
    r'\bborder-slate-100\b': 'border-slate-100 dark:border-slate-800',
    r'\bbg-indigo-50\b': 'bg-indigo-50 dark:bg-indigo-900/30',
    r'\bbg-indigo-100\b': 'bg-indigo-100 dark:bg-indigo-900/50',
    r'\btext-indigo-600\b': 'text-indigo-600 dark:text-indigo-400',
    r'\btext-indigo-500\b': 'text-indigo-500 dark:text-indigo-400',
    r'\bbg-emerald-50\b': 'bg-emerald-50 dark:bg-emerald-900/30',
    r'\bbg-emerald-100\b': 'bg-emerald-100 dark:bg-emerald-900/50',
    r'\btext-emerald-600\b': 'text-emerald-600 dark:text-emerald-400',
    r'\btext-emerald-700\b': 'text-emerald-700 dark:text-emerald-300',
    r'\bbg-amber-50\b': 'bg-amber-50 dark:bg-amber-900/30',
    r'\bbg-amber-100\b': 'bg-amber-100 dark:bg-amber-900/50',
    r'\btext-amber-600\b': 'text-amber-600 dark:text-amber-400',
    r'\btext-amber-700\b': 'text-amber-700 dark:text-amber-300',
    r'\bbg-rose-50\b': 'bg-rose-50 dark:bg-rose-900/30',
    r'\bbg-rose-100\b': 'bg-rose-100 dark:bg-rose-900/50',
    r'\btext-rose-500\b': 'text-rose-500 dark:text-rose-400',
    r'\btext-rose-700\b': 'text-rose-700 dark:text-rose-300',
    r'\bbg-slate-100\b': 'bg-slate-100 dark:bg-slate-800',
    r'\bbg-slate-800\b': 'bg-slate-800 dark:bg-slate-800/80',
    r'\bbg-slate-900\b': 'bg-slate-900 dark:bg-slate-900/90',
}

pages_dir = 'src/pages'

for filename in os.listdir(pages_dir):
    if filename.endswith('.jsx'):
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Don't double apply if already applied by accident
        if 'dark:bg-slate-900' in content and 'dark:text-white' in content:
            continue
            
        for pattern, replacement in replacements.items():
            content = re.sub(pattern, replacement, content)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Applied dark mode classes to all pages.")
