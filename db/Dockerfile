FROM registry.access.redhat.com/ubi8/ubi-minimal:latest

# Install InfluxDB
RUN microdnf update && \
    microdnf install -y wget tar && \
    wget https://dl.influxdata.com/influxdb/releases/influxdb2-2.1.1-linux-amd64.tar.gz && \
    tar xvfz influxdb2-2.1.1-linux-amd64.tar.gz && \
    cp influxdb2-2.1.1-linux-amd64/influxd /usr/local/bin/ && \
    rm -rf influxdb2-2.1.1-linux-amd64 influxdb2-2.x.x-linux-amd64.tar.gz

# Expose necessary ports (8086 is the default port for InfluxDB)
EXPOSE 8086

# Set the startup command
CMD ["influxd"]