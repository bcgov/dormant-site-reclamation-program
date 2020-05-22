app {
    name = 'dormant-site-reclamation-program'
    version = 'snapshot'
        namespaces {
        'build'{
            namespace = 'eazios-tools'
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
        timeoutInSeconds = 60*40 // 40 minutes
        templates = [
                [
                    'file':'openshift/templates/_python36.bc.json',
                    'params':[
                            'NAME':"dsrp-python-backend",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "services/dsrp-api",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'openshift/templates/_nginx.bc.json',
                    'params':[
                            'NAME':"dsrp-nginx",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "services/nginx",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                        'file':'openshift/templates/_nodejs.bc.json',
                        'params':[
                            'NAME':"dsrp-frontend",
                            'SUFFIX': "${app.build.suffix}",
                            'APPLICATION_SUFFIX': "-${app.build.env.id}",
                            'BASE_PATH': "/${app.git.changeId}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "services/dsrp-web",
                            'DOCKER_IMAGE_DIRECTORY': "openshift/docker-images/nodejs-10",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}",
                            'NODE_ENV': "production"
                        ]
                ],
                [
                    'file':'openshift/templates/postgresql.bc.json',
                    'params':[
                        'NAME':"dsrp-postgresql",
                        'SUFFIX': "${app.build.suffix}",
                        'TAG_NAME':"${app.build.version}"
                    ]
                ],
                [
                    'file':'openshift/templates/flyway.bc.json',
                    'params':[
                            'NAME':"dsrp-flyway-migration",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "migrations",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                'file':'openshift/templates/dbbackup.bc.json',
                    'params':[
                        'NAME':"dsrp-database-backup",
                        'SUFFIX': "${app.build.suffix}",
                        'VERSION':"${app.build.version}"
                    ]
                ],
                [
                    'file':'openshift/templates/tools/metabase.bc.json',
                    'params':[
                            'NAME':"metabase",
                            'SUFFIX': "${app.build.suffix}",
                            'VERSION':"${app.build.version}",
                            'SOURCE_CONTEXT_DIR': "openshift/docker-images/metabase",
                            'SOURCE_REPOSITORY_URL': "${app.git.uri}"
                    ]
                ],
                [
                    'file':'openshift/templates/tools/metabase-postgres.bc.json',
                    'params':[
                            'NAME':"metabase-postgres",
                            'VERSION':"${app.build.version}",
                    ]
                ]
                [
                    'file':'openshift/templates/tusd.bc.json',
                    'params':[
                            'TAG_NAME':"${app.build.version}",
                    ]
                ]
        ]
    }
}