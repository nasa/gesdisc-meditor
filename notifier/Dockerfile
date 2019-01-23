FROM dev.gesdisc.eosdis.nasa.gov:443/centos


# install crontabs RUN yum -y update
RUN yum -y install crontabs
RUN yum install -y gcc-c++ make
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs
RUN yum -y install postfix
RUN yum -y install sendmail
RUN npm --version
RUN node --version

# comment out PAM
RUN sed -i -e '/pam_loginuid.so/s/^/#/' /etc/pam.d/crond

#Add your cron file
ADD cron /etc/cron.d/cron_test
RUN chmod 0644 /etc/cron.d/cron_test

# App portion
RUN mkdir -p /usr/src/app/notifier
WORKDIR /usr/src/app/notifier
COPY ./ ./
RUN npm install

CMD printenv | sed 's/^\(.*\)$/export \1/g' > /usr/src/app/env.sh && crond -x proc