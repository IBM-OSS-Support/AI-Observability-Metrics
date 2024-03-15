#!/bin/bash

# Create /etc/containers/nodocker to suppress Podman message
touch /etc/containers/nodocker

# Ensure the script is executed by the 'postgres' user
if [ "$(id -u)" = '0' ]; then
    exec gosu postgres "$BASH_SOURCE" "$@"
fi

# Start PostgreSQL server using the 'postgres' user
pg_ctl start -D $PGDATA -l logfile
echo $PGDATA

# Wait for PostgreSQL to start
until pg_isready -h localhost -p 5432 -U "$POSTGRES_USER"; do
    echo "Waiting for PostgreSQL to start..."
    sleep 1
done

# Check if the database and user already exist
if ! psql -lqt | cut -d \| -f 1 | grep -qw "$POSTGRES_DB"; then
    # Create user, password, and database
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';
        CREATE DATABASE $POSTGRES_DB;
        GRANT ALL PRIVileges ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;
    EOSQL
else
    echo "Database and user already exist, skipping creation."
fi

# Keep the container running
tail -f /dev/null
