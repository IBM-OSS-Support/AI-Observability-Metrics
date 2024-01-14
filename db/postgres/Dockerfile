# Use UBI 8 minimal as the base image
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_VERSION=12
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=postgres
ENV PGDATA=/var/lib/postgresql/data

# Install PostgreSQL
RUN microdnf -y update && \
    microdnf -y install postgresql${POSTGRES_VERSION} && \
    microdnf clean all

# Initialize the database
RUN mkdir -p "$PGDATA" && \
    chown -R postgres:postgres "$PGDATA" && \
    chmod 700 "$PGDATA"

USER postgres

# Initialize the database and set up the configuration
RUN initdb -D "$PGDATA" && \
    echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf" && \
    echo "listen_addresses='*'" >> "$PGDATA/postgresql.conf"

# Expose the PostgreSQL port
EXPOSE 5432

# Set the default command to run when starting the container
CMD ["postgres"]
