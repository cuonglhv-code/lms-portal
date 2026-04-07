import os
import re

admin_file = r'src/components/AdminPortal.tsx'

with open(admin_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

sections = []
current_section = None
current_content = []

imports_block = []
in_imports = True

admin_portal_started = False
bracket_count = 0

for line in lines:
    if line.startswith('export const AdminPortal: React.FC = () => {'):
        admin_portal_started = True
        bracket_count = 1
        continue
        
    if admin_portal_started:
        bracket_count += line.count('{')
        bracket_count -= line.count('}')
        if bracket_count <= 0:
            admin_portal_started = False
        continue

    if line.startswith('const ') and 'Section: React.FC' in line:
        in_imports = False
        if current_section:
            sections.append({'name': current_section, 'content': current_content})
        current_section = line.split('const ')[1].split(':')[0]
        current_content = ['export ' + line]
    elif in_imports:
        imports_block.append(line)
    elif current_section:
        current_content.append(line)

if current_section:
    sections.append({'name': current_section, 'content': current_content})

out_dir = r'src/features/admin/sections'
os.makedirs(out_dir, exist_ok=True)

def fix_imports(text):
    text = text.replace("'../", "'../../../")
    text = text.replace("'./common/", "'../../../components/common/")
    text = text.replace("'./layout/", "'../../../components/layout/")
    text = text.replace("'./UserModal", "'../../../components/UserModal")
    text = text.replace("'./ClassModal", "'../../../components/ClassModal")
    text = text.replace("'./CenterModal", "'../../../components/CenterModal")
    text = text.replace("'./ClassDetailModal", "'../../../components/ClassDetailModal")
    return text

imports_text = "".join(imports_block).replace("import React, { useState, useEffect, useCallback } from 'react';\nimport { useNavigate } from 'react-router-dom';\n", "import React, { useState, useEffect, useCallback } from 'react';\n")
imports_text = fix_imports(imports_text)

for s in sections:
    file_path = os.path.join(out_dir, f"{s['name']}.tsx")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(imports_text)
        f.write("\n")
        f.write("".join(s['content']))

print("Re-created " + str(len(sections)) + " sections.")
