# Use UBI 8 minimal as the base image
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=roja_postgres
ENV PGDATA=/var/lib/postgresql/data

# Install PostgreSQL
RUN microdnf -y install yum

RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm && \
    yum install -y postgresql15-server && \
    yum clean all

# Initialize the database
RUN /usr/pgsql-15/bin/postgresql-15-setup initdb

# Adjust PostgreSQL configuration to allow remote connections
RUN echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
RUN echo "listen_addresses='*'" >> "$PGDATA/postgresql.conf"

# Expose the PostgreSQL port
EXPOSE 5432

# Copy the custom initialization script
COPY start-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-db.sh

# Set the command to run the initialization script
CMD ["init-db.sh"]
