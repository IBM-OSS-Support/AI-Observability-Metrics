# Use UBI 8 minimal as the base image
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=roja_postgres
ENV PGDATA=/var/lib/postgresql/data

# Install PostgreSQL
RUN microdnf -y install yum

RUN microdnf update -y \
    && microdnf update tzdata -y  \
    && microdnf reinstall tzdata -y \
    && microdnf install -y --disableplugin=subscription-manager yum wget findutils nss_wrapper gettext\
    && yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm \
    && yum install -y postgresql15-server \
    && mkdir /docker-entrypoint-initdb.d \
    && wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.16/gosu-amd64" \
    && chmod -R 777 /usr/local/bin/gosu /var/lib/pgsql /docker-entrypoint-initdb.d /var/run/postgresql \
    && echo "listen_addresses = '*'" >> /usr/pgsql-15/share/postgresql.conf.sample \
    && yum clean all \
    && rm -rf /var/cache/yum \
    && microdnf clean all 

ENV PATH /usr/pgsql-15/bin:$PATH

STOPSIGNAL SIGINT

# Expose the PostgreSQL port
EXPOSE 5432

# Copy the custom initialization script
COPY start-db.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start-db.sh

# Set the command to run the initialization script
CMD ["init-db.sh"]
