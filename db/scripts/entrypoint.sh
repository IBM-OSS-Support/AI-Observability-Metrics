#!/bin/bash

export HOME=/dist
mkdir -p /mnt/vol/postgresql/data
mkdir -p /mnt/vol/postgresql/run
ln -f -s /mnt/vol/postgresql/run /var/run/postgresql


curruser="$(id -u)"
if [ X"$curruser" = X"0" ]; 
then
    echo running as user: ${curruser}
else
    export runas_postgres=${POSTGRES_USER}
    export USER_ID=$(id -u)
    export GROUP_ID=$(id -g)
    envsubst < /scripts/passwd.templ > /tmp/passwd

    export NSS_WRAPPER_PASSWD=/tmp/passwd
    export NSS_WRAPPER_GROUP=/etc/group
fi

export PGDATA=/mnt/vol/postgresql/data
echo PGDATA is: $PGDATA
export PATH=/usr/pgsql-15/bin:$PATH

echo starting postgres ...
/scripts/docker-entrypoint.sh postgres
