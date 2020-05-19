FROM tusproject/tusd:latest

# Install Keycloak gatekeeper
RUN wget -q -O /tmp/gatekeeper.tar.gz https://downloads.jboss.org/keycloak/6.0.1/gatekeeper/keycloak-gatekeeper-linux-amd64.tar.gz && \
    tar xzvf /tmp/gatekeeper.tar.gz -C /tmp/ && \
    mv /tmp/keycloak-gatekeeper /usr/local/bin/ && \
    rm -rf /tmp/gatekeeper.tar.gz /tmp/keycloak-gatekeeper