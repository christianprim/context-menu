#!/bin/bash
PATH='/home/ubuntu/workspace/context/tex/texmf-linux-64/bin:$PATH'
context --nonstopmode $DOCUMENT
if [ -f ${DOCUMENT}.pdf ]; then
    /mnt/shared/sbin/c9 open ${DOCUMENT}.pdf
else
    /mnt/shared/sbin/c9 open ${DOCUMENT}.log
fi