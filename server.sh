#!/bin/bash

$1

scp -i "Clients_Server_Key.pem" $1  ubuntu@ec2-3-123-8-36.eu-central-1.compute.amazonaws.com:~/test/


# ssh -i "Clients_Server_Key.pem" ubuntu@ec2-3-123-8-36.eu-central-1.compute.amazonaws.com "bash -s" $1 << 'ENDSSH'


# scp $1 username@a:/path/to/destination

# cp $1 .




