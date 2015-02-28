#!/bin/bash
git commit -a -m "$MESSAGE" 1>git_out.log
git push origin master 1>>git_out.log