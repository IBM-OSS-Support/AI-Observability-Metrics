# Use UBI 8 minimal as the base image
FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

# Set environment variables for PostgreSQL
ENV POSTGRES_USER=postgres \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=roja_postgres \
    PGDATA=/var/lib/postgresql/data \
    PATH=/usr/pgsql-15/bin:$PATH

# Install PostgreSQL and other necessary tools
RUN microdnf -y install yum

RUN microdnf update -y

RUN microdnf install -y yum wget findutils nss_wrapper gettext

RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm \
    && yum -y module disable postgresql \
    && yum install -y postgresql15-server

RUN mkdir /docker-entrypoint-initdb.d

RUN wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/1.16/gosu-amd64" \
    && chmod +x /usr/local/bin/gosu \
    && echo "listen_addresses = '*'" >> /usr/pgsql-15/share/postgresql.conf.sample

RUN yum clean all

RUN rm -rf /var/cache/yum

RUN microdnf clean all


ENV PATH /usr/pgsql-15/bin:$PATH
COPY /scripts /scripts
ENTRYPOINT ["/scripts/entrypoint.sh"]
# Expose the PostgreSQL port
EXPOSE 5432
# USER 1001
