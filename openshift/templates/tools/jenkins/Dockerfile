FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

RUN wget -q http://updates.jenkins-ci.org/download/war/2.222.3/jenkins.war -O /usr/lib/jenkins/jenkins.war
RUN chmod 755 /usr/lib/jenkins/jenkins.war

USER 1001