#!/bin/bash
until pg_isready -h postgres-core -U stellar; do
  echo 'Waiting for database...';
  sleep 2;
done;

export DATABASE="postgresql://dbname=stellar-core-node1 host=postgres-core user=stellar password=stellar123"

# Init DB if needed
stellar-core new-db 2>/dev/null || true

# Run standalone mode  
stellar-core run --ll INFO
