app {
    name = 'dormant-site-reclamation-program'
    version = 'snapshot'

    namespaces {
        'build'{
            namespace = 'eazios-tools'
            disposable = true
        }
        'dev' {
            namespace = 'eazios-dev'
            disposable = true
        }
    }

    git {
        workDir = ['git', 'rev-parse', '--show-toplevel'].execute().text.trim()
        uri = ['git', 'config', '--get', 'remote.origin.url'].execute().text.trim()
        commit = ['git', 'rev-parse', 'HEAD'].execute().text.trim()
        changeId = "${opt.'pr'}"
        ref = opt.'branch'?:"refs/pull/${git.changeId}/head"
        github {
            owner = app.git.uri.tokenize('/')[2]
            name = app.git.uri.tokenize('/')[3].tokenize('.git')[0]
        }
    }

    build {
        env {
            name = 'build'
            id = "pr-${app.git.changeId}"
        }
        id = "${app.name}-${app.build.env.name}-${app.build.env.id}"
        name = "${app.name}"
        version = "${app.build.env.name}-${app.build.env.id}"

        suffix = "-${app.git.changeId}"
        namespace = 'eazios-tools'
    }

    deployment {
        env {
            name = vars.deployment.env.name // env-name
            id = "pr-${app.git.changeId}"
        }

        id = "${app.name}-${app.deployment.env.name}-${app.deployment.env.id}"
        name = "${app.name}"
        version = "${app.deployment.env.name}-${app.deployment.env.id}"

        namespace = "${vars.deployment.namespace}"
        timeoutInSeconds = 60*20 // 20 minutes
        templates = [
                [
                    'file':'openshift/templates/postgresql.dc.json',
                    'params':[
                            'NAME':"dsrp-postgresql",
                            'SUFFIX':"${vars.deployment.suffix}",
                            'DATABASE_SERVICE_NAME':"dsrp-postgresql${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.postgres.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.postgres.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.postgres.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.postgres.memory_limit}",
                            'IMAGE_STREAM_NAMESPACE':'',
                            'IMAGE_STREAM_NAME':"dsrp-postgresql",
                            'IMAGE_STREAM_VERSION':"${app.deployment.version}",
                            'POSTGRESQL_DATABASE':'dsrp',
                            'VOLUME_CAPACITY':"${vars.DB_PVC_SIZE}"
                    ]
                ],
                // [
                //     'file':'openshift/templates/dbbackup.dc.json',
                //     'params':[
                //             'NAME':"dsrp-database-backup",
                //             'SUFFIX': "${vars.deployment.suffix}",
                //             'VERSION':"${app.deployment.version}",
                //             'ENVIRONMENT_NAME':"${vars.deployment.namespace}",
                //             'ENVIRONMENT_FRIENDLY_NAME':"Dormant Site Reclamation Program (DEV)",
                //             'DATABASE_SERVICE_NAME':"dsrp-postgresql${vars.deployment.suffix}",
                //             'NFS_VOLUME_IDENTIFIER':"bk-eazios-dev-rz5el8sdtrii",
                //             'CPU_REQUEST':"${vars.resources.backup.cpu_request}",
                //             'CPU_LIMIT':"${vars.resources.backup.cpu_limit}",
                //             'MEMORY_REQUEST':"${vars.resources.backup.memory_request}",
                //             'MEMORY_LIMIT':"${vars.resources.backup.memory_limit}",
                //             'VERIFICATION_VOLUME_SIZE':"${vars.BACKUP_VERIFICATION_PVC_SIZE}",
                //             'FLYWAY_NAME':"dsrp-flyway-migration-client",
                //     ]
                // ],
                [
                    'file':'openshift/templates/redis.dc.json',
                    'params':[
                            'NAME':"dsrp-redis",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.redis.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.redis.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.redis.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.redis.memory_limit}",
                            'REDIS_VERSION':"3.2"
                    ]
                ],
                [
                    'file':'openshift/templates/_nodejs.dc.json',
                    'params':[
                            'NAME':"dsrp-frontend",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'APPLICATION_SUFFIX': "${vars.deployment.application_suffix}",
                            'TAG_NAME':"${app.deployment.version}",
                            'PORT':3000,
                            'CPU_REQUEST':"${vars.resources.node.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.node.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.node.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.node.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.node.replica_min}",
                            'REPLICA_MAX':"${vars.resources.node.replica_max}",
                            'APPLICATION_DOMAIN': "${vars.modules.'dsrp-frontend'.HOST}",
                            'BASE_PATH': "${vars.modules.'dsrp-frontend'.PATH}",
                            'NODE_ENV': "${vars.deployment.node_env}",
                            'FN_LAYER_URL': "${vars.deployment.fn_layer_url}",
                            'KEYCLOAK_RESOURCE': "${vars.keycloak.resource}",
                            'KEYCLOAK_CLIENT_ID': "${vars.keycloak.clientId_dsrp}",
                            'KEYCLOAK_URL': "${vars.keycloak.url}",
                            'KEYCLOAK_IDP_HINT': "${vars.keycloak.idpHint_dsrp}",
                            'API_URL': "https://${vars.modules.'dsrp-nginx'.HOST_DSRP}${vars.modules.'dsrp-nginx'.PATH}/api",
                            'TUSD_URL': "https://${vars.modules.'dsrp-nginx'.HOST_DSRP}${vars.modules.'dsrp-nginx'.PATH}/files/"
                    ]
                ],
                [
                    'file':'openshift/templates/_python36.dc.json',
                    'params':[
                            'NAME':"dsrp-python-backend",
                            'FLYWAY_NAME':"dsrp-flyway-migration-client",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'CPU_REQUEST':"${vars.resources.python.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.python.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.python.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.python.memory_limit}",
                            'UWSGI_THREADS':"${vars.resources.python.uwsgi_threads}",
                            'UWSGI_PROCESSES':"${vars.resources.python.uwsgi_processes}",
                            'REPLICA_MIN':"${vars.resources.python.replica_min}",
                            'REPLICA_MAX':"${vars.resources.python.replica_max}",
                            'JWT_OIDC_WELL_KNOWN_CONFIG': "${vars.keycloak.known_config_url}",
                            'JWT_OIDC_AUDIENCE': "${vars.keycloak.clientId_dsrp}",
                            'APPLICATION_DOMAIN': "${vars.modules.'dsrp-python-backend'.HOST}",
                            'BASE_PATH': "${vars.modules.'dsrp-python-backend'.PATH}",
                            'DB_CONFIG_NAME': "dsrp-postgresql${vars.deployment.suffix}",
                            'REDIS_CONFIG_NAME': "dsrp-redis${vars.deployment.suffix}",
                            'CACHE_REDIS_HOST': "dsrp-redis${vars.deployment.suffix}",
                            'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                            'URL': "https://${vars.modules.'dsrp-nginx'.HOST_DSRP}${vars.modules.'dsrp-nginx'.PATH}",
                            'API_URL': "https://${vars.modules.'dsrp-nginx'.HOST_DSRP}${vars.modules.'dsrp-nginx'.PATH}/api",
                            'DOCUMENT_GENERATOR_URL': "${vars.modules.'dsrp-docgen-api'.HOST}",

                    ]
                ],
                [
                    'file':'openshift/templates/docgen.dc.json',
                    'params':[
                            'NAME':"docgen",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'APPLICATION_SUFFIX': "${vars.deployment.application_suffix}",
                            'PORT':3030,
                            'CPU_REQUEST':"${vars.resources.docgen.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.docgen.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.docgen.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.docgen.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.docgen.replica_min}",
                            'REPLICA_MAX':"${vars.resources.docgen.replica_max}",
                            'BASE_PATH': "${vars.modules.'dsrp-docgen-api'.PATH}",
                            'NODE_ENV': "${vars.deployment.node_env}"
                    ]
                ],
                [
                    'file':'openshift/templates/tusd.dc.json',
                    'params':[
                            'NAME':"tusd",
                            'VERSION':"${app.deployment.version}",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'CPU_REQUEST':"${vars.resources.tusd.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.tusd.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.tusd.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.tusd.memory_limit}"
                    ]
                ],
                [
                    'file':'openshift/templates/_nginx.dc.json',
                    'params':[
                            'NAME':"dsrp-nginx",
                            'SUFFIX': "${vars.deployment.suffix}",
                            'VERSION':"${app.deployment.version}",
                            'LOG_PVC_SIZE':"${vars.LOG_PVC_SIZE}",
                            'CPU_REQUEST':"${vars.resources.nginx.cpu_request}",
                            'CPU_LIMIT':"${vars.resources.nginx.cpu_limit}",
                            'MEMORY_REQUEST':"${vars.resources.nginx.memory_request}",
                            'MEMORY_LIMIT':"${vars.resources.nginx.memory_limit}",
                            'REPLICA_MIN':"${vars.resources.nginx.replica_min}",
                            'REPLICA_MAX':"${vars.resources.nginx.replica_max}",
                            'DSRP_DOMAIN': "${vars.modules.'dsrp-nginx'.HOST_DSRP}",
                            'ROUTE': "${vars.modules.'dsrp-nginx'.ROUTE}",
                            'PATH_PREFIX': "${vars.modules.'dsrp-nginx'.PATH}",
                            'TUSD_SERVICE_URL': "${vars.modules.'dsrp-tusd-backend'.HOST}${vars.modules.'dsrp-tusd-backend'.PATH}",
                            'DSRP_SERVICE_URL': "${vars.modules.'dsrp-frontend'.HOST}",
                            'API_SERVICE_URL': "${vars.modules.'dsrp-python-backend'.HOST}",
                    ]
                ]
                // [
                //     'file':'openshift/templates/tools/metabase.dc.json',
                //     'params':[
                //             'NAME':"metabase",
                //             'NAME_DATABASE':"metabase-postgres",
                //             'VERSION':"${app.deployment.version}",
                //             'SUFFIX': "${vars.deployment.suffix}",
                //             'METABASE_PVC_SIZE':"${vars.METABASE_PVC_SIZE}",
                //             'ENVIRONMENT_NAME':"${app.deployment.env.name}",
                //             'APPLICATION_DOMAIN': "${vars.modules.'metabase'.HOST}",
                //             'CPU_REQUEST':"${vars.resources.metabase.cpu_request}",
                //             'CPU_LIMIT':"${vars.resources.metabase.cpu_limit}",
                //             'MEMORY_REQUEST':"${vars.resources.metabase.memory_request}",
                //             'MEMORY_LIMIT':"${vars.resources.metabase.memory_limit}",
                //     ]
                // ],
                // [
                //     'file':'openshift/templates/tools/metabase-postgres.dc.json',
                //     'params':[
                //             'NAME':"metabase-postgres",
                //             'VERSION':"${app.deployment.version}",
                //             'SUFFIX': "${vars.deployment.suffix}",
                //             'METABASE_PVC_SIZE':"${vars.METABASE_PVC_SIZE}",
                //             'CPU_REQUEST':"${vars.resources.metabase.db_cpu_request}",
                //             'CPU_LIMIT':"${vars.resources.metabase.db_cpu_limit}",
                //             'MEMORY_REQUEST':"${vars.resources.metabase.db_memory_request}",
                //             'MEMORY_LIMIT':"${vars.resources.metabase.db_memory_limit}"
                //     ]
                // ]
        ]
    }
}

environments {
    'dev' {
        vars {
            DB_PVC_SIZE = '5Gi'
            DOCUMENT_PVC_SIZE = '1Gi'
            BACKUP_VERIFICATION_PVC_SIZE = '200Mi'
            LOG_PVC_SIZE = '1Gi'
            METABASE_PVC_SIZE = '10Gi'

            git {
                changeId = "${opt.'pr'}"
            }
            keycloak {
                clientId_dsrp = "dormant-application-dev"
                resource = "dormant-application-dev"
                idpHint_dsrp = "idir"
                url = "https://sso-test.pathfinder.gov.bc.ca/auth"
                known_config_url = "https://sso-test.pathfinder.gov.bc.ca/auth/realms/hud2v882/.well-known/openid-configuration"
                siteminder_url = "https://logontest7.gov.bc.ca"
            }
            resources {
                node {
                    cpu_request = "10m"
                    cpu_limit = "30m"
                    memory_request = "64Mi"
                    memory_limit = "256Mi"
                    replica_min = 1
                    replica_max = 1
                }
                docgen {
                    cpu_request = "50m"
                    cpu_limit = "200m"
                    memory_request = "128Mi"
                    memory_limit = "256Mi"
                    replica_min = 1
                    replica_max = 1
                }
                nginx {
                    cpu_request = "10m"
                    cpu_limit = "20m"
                    memory_request = "64Mi"
                    memory_limit = "104Mi"
                    replica_min = 1
                    replica_max = 1
                }
                tusd {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "256Mi"
                    memory_limit = "512Mi"
                    replica_min = 1
                    replica_max = 1
                }
                python {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "256Mi"
                    memory_limit = "512Mi"
                    uwsgi_threads = 4
                    uwsgi_processes = 2
                    replica_min = 1
                    replica_max = 1
                }
                python_lite {
                    cpu_request = "10m"
                    cpu_limit = "100m"
                    memory_request = "128Mi"
                    memory_limit = "256Mi"
                    uwsgi_threads = 2
                    uwsgi_processes = 1
                    replica_min = 1
                    replica_max = 1
                }
                postgres {
                    cpu_request = "50m"
                    cpu_limit = "100m"
                    memory_request = "512Mi"
                    memory_limit = "1Gi"
                }
                redis {
                    cpu_request = "10m"
                    cpu_limit = "20m"
                    memory_request = "16Mi"
                    memory_limit = "32Mi"
                }
                metabase {
                    cpu_request = "10m"
                    cpu_limit = "200m"
                    memory_request = "1Gi"
                    memory_limit = "2Gi"
                    db_cpu_request = "50m"
                    db_cpu_limit = "100m"
                    db_memory_request = "256Mi"
                    db_memory_limit = "1Gi"
                }
                backup {
                    cpu_request = "10m"
                    cpu_limit = "200m"
                    memory_request = "512Mi"
                    memory_limit = "1Gi"
                }
            }
            deployment {
                env {
                    name = "dev"
                }
                key = 'dev'
                namespace = 'eazios-dev'
                suffix = "-pr-${vars.git.changeId}"
                application_suffix = "-pr-${vars.git.changeId}"
                node_env = "development"
                fn_layer_url = "https://delivery.apps.gov.bc.ca/ext/sgw/geo.allgov"
            }
            modules {
                'dsrp-frontend' {
                    HOST = "http://dsrp-frontend${vars.deployment.suffix}:3000"
                    PATH = "/${vars.git.changeId}"
                }
                'dsrp-nginx' {
                    HOST_DSRP = "dsrp-${vars.deployment.key}.pathfinder.gov.bc.ca"
                    PATH = "/${vars.git.changeId}"
                    ROUTE = "/${vars.git.changeId}"
                }
                'dsrp-python-backend' {
                    HOST = "http://dsrp-python-backend${vars.deployment.suffix}:5000"
                    PATH = "/${vars.git.changeId}/api"
                }
                'dsrp-tusd-backend' {
                    HOST = "http://tusd${vars.deployment.suffix}:1080"
                    PATH = "/files/"
                }
                'dsrp-redis' {
                    HOST = "http://dsrp-redis${vars.deployment.suffix}"
                }
                'metabase' {
                    HOST = "dsrp-metabase-${vars.deployment.namespace}.pathfinder.gov.bc.ca"
                }
                'dsrp-docgen-api' {
                    HOST = "http://docgen${vars.deployment.suffix}:3030"
                }
            }
        }
    }
}
