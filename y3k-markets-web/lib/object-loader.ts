// Object Loader - Universal Schema Fetcher
// Loads YAML object definitions from filesystem or API

import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import type { ObjectSchema } from '@/components/ProtocolConsole';

const OBJECTS_DIR = path.join(process.cwd(), '../objects');

export async function loadObject(id: string, type?: string): Promise<ObjectSchema | null> {
  try {
    // Try different paths based on type
    const paths = type 
      ? [path.join(OBJECTS_DIR, type, `${id}.yaml`)]
      : [
          path.join(OBJECTS_DIR, 'namespaces', `${id}.yaml`),
          path.join(OBJECTS_DIR, 'chains', `${id}.yaml`),
          path.join(OBJECTS_DIR, 'vaults', `${id}.yaml`),
          path.join(OBJECTS_DIR, 'agents', `${id}.yaml`),
          path.join(OBJECTS_DIR, 'infrastructure', `${id}.yaml`),
        ];

    for (const filePath of paths) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const object = yaml.load(content) as ObjectSchema;
        
        // Validate required fields
        if (!object.canonical_id || !object.object_type) {
          continue;
        }
        
        return object;
      } catch (err) {
        // Try next path
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error loading object:', error);
    return null;
  }
}

export async function getAllObjects(): Promise<ObjectSchema[]> {
  const objects: ObjectSchema[] = [];
  const types = ['namespaces', 'chains', 'vaults', 'agents', 'infrastructure'];
  
  for (const type of types) {
    try {
      const dir = path.join(OBJECTS_DIR, type);
      const files = await fs.readdir(dir);
      const yamlFiles = files.filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
      
      for (const file of yamlFiles) {
        const id = file.replace(/\.(yaml|yml)$/, '');
        const obj = await loadObject(id, type);
        if (obj) {
          objects.push(obj);
        }
      }
    } catch (err) {
      // Directory doesn't exist or is empty
      continue;
    }
  }
  
  return objects;
}

export async function searchObjects(query: string): Promise<ObjectSchema[]> {
  const all = await getAllObjects();
  const lowerQuery = query.toLowerCase();
  
  return all.filter(obj => 
    obj.canonical_id.toLowerCase().includes(lowerQuery) ||
    obj.display_name.toLowerCase().includes(lowerQuery) ||
    obj.description.toLowerCase().includes(lowerQuery)
  );
}

export function validateObject(obj: ObjectSchema): string[] {
  const errors: string[] = [];
  
  // Required fields
  if (!obj.canonical_id) errors.push('canonical_id is required');
  if (!obj.object_type) errors.push('object_type is required');
  if (!obj.display_name) errors.push('display_name is required');
  
  // Max 5 actions
  if (obj.actions && obj.actions.length > 5) {
    errors.push('Maximum 5 actions allowed');
  }
  
  // QR payload required
  if (!obj.qr || !obj.qr.payload) {
    errors.push('QR payload is required');
  }
  
  // Authority verification must be valid
  const validVerifications = ['verified', 'unverified', 'contested'];
  if (obj.authority && !validVerifications.includes(obj.authority.verification)) {
    errors.push('Invalid verification status');
  }
  
  // Check for banned state labels (marketing stats)
  const bannedLabels = [
    'users', 'followers', 'likes', 'shares', 
    'growth', 'testimonials', 'press', 'ratings'
  ];
  
  if (obj.state) {
    obj.state.forEach(stat => {
      const label = stat.label.toLowerCase();
      if (bannedLabels.some(banned => label.includes(banned))) {
        errors.push(`Banned state label: ${stat.label}`);
      }
    });
  }
  
  return errors;
}
