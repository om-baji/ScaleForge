#!/usr/bin/env python3

"""
Kubernetes Data Stream Script (Python)
Streams Kubernetes cluster data in JSON format via subprocess
"""

import json
import subprocess
import time
from datetime import datetime

def get_cluster_data():
    """Fetch Kubernetes cluster data using kubectl"""
    try:
        result = subprocess.run(
            ['kubectl', 'get', 'all', '-o', 'json'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return None
        
        data = json.loads(result.stdout)
        
        # Parse and structure the data
        structured_data = {
            'timestamp': int(time.time() * 1000),
            'pods': [],
            'services': [],
            'deployments': [],
            'replicasets': []
        }
        
        for item in data.get('items', []):
            kind = item.get('kind')
            
            if kind == 'Pod':
                structured_data['pods'].append({
                    'name': item['metadata']['name'],
                    'namespace': item['metadata'].get('namespace', 'default'),
                    'status': item['status'].get('phase', 'Unknown'),
                    'ready': len([c for c in item['status'].get('containerStatuses', []) if c.get('ready')]),
                    'totalContainers': len(item['status'].get('containerStatuses', [])),
                    'restarts': item['status'].get('containerStatuses', [{}])[0].get('restartCount', 0),
                    'creationTime': item['metadata'].get('creationTimestamp', '')
                })
            
            elif kind == 'Service':
                structured_data['services'].append({
                    'name': item['metadata']['name'],
                    'namespace': item['metadata'].get('namespace', 'default'),
                    'type': item['spec'].get('type', 'Unknown'),
                    'clusterIP': item['spec'].get('clusterIP', ''),
                    'externalIP': item['spec'].get('externalIPs', ['none'])[0] if item['spec'].get('externalIPs') else 'none',
                    'ports': [p['port'] for p in item['spec'].get('ports', [])]
                })
            
            elif kind == 'Deployment':
                structured_data['deployments'].append({
                    'name': item['metadata']['name'],
                    'namespace': item['metadata'].get('namespace', 'default'),
                    'replicas': item['spec'].get('replicas', 0),
                    'ready': item['status'].get('readyReplicas', 0),
                    'available': item['status'].get('availableReplicas', 0),
                    'creationTime': item['metadata'].get('creationTimestamp', '')
                })
            
            elif kind == 'ReplicaSet':
                structured_data['replicasets'].append({
                    'name': item['metadata']['name'],
                    'namespace': item['metadata'].get('namespace', 'default'),
                    'replicas': item['spec'].get('replicas', 0),
                    'ready': item['status'].get('readyReplicas', 0),
                    'available': item['status'].get('availableReplicas', 0)
                })
        
        return structured_data
    
    except subprocess.TimeoutExpired:
        print("Error: kubectl command timed out")
        return None
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return None
    except FileNotFoundError:
        print("Error: kubectl not found in PATH")
        return None

def main():
    """Main streaming loop"""
    print("Starting Kubernetes Data Stream...")
    print("Press Ctrl+C to stop\n")
    
    try:
        while True:
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            print(f"[{timestamp}] Streaming cluster data...")
            
            data = get_cluster_data()
            if data:
                # Print JSON for piping to other tools
                print(json.dumps(data, indent=2))
            
            # Wait before next update
            time.sleep(2)
    
    except KeyboardInterrupt:
        print("\n\nStream stopped by user")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
