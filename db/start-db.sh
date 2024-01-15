#!/bin/bash

# Start PostgreSQL server
/usr/pgsql-15/bin/postgres -D $PGDATA &

# Wait for PostgreSQL to start
sleep 10

# Create user, password, and database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
    CREATE DATABASE $POSTGRES_DB;
    GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
EOSQL

# Keep the container running
tail -f /dev/null
