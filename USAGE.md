# Dormant Sites Reclamation Program

## Installation and Usage

This project was built off of the MDS project (https://github.com/bcgov/mds) and uses the same tech stack.

This file describes how to run the project and develop against it.

## Requirements

- Docker
- NodeJS 10

## Getting Started

- Install Requirements listed above
- On Windows, note the following:
  - If containers are not working, they may not be enabled, enabling them in docker settings and restarting the machine fixes this
  - Drive sharing is disabled by default, make sure to share your local drive in docker settings

### Setting up local development

**NOTE:** This project also has a Makefile but it may be in a broken state and is not currently used for development.

- Get your ".env" files from a teammate so that various services will run correctly.
- Navigate to the project directory and run the following commands to install and run the backend:
```
docker-compose up -d --build backend
docker-compose up -d --build docgen-api
```
**Note:** If you also work on the MDS project, you may need to bring down those containers, as the DSRP project will want to bring up containers that use the same ports.

- Navigate to the `dsrp-web` directory and run the following commands to install and run the frontend:
```
npm install
npm run serve
```

- There is currently no script to easily get test data. A common flow is to:
1. Port forward the test or prod database to your system
2. Use the import data feature in a client, e.g., DBeaver, to import data from the forwarded database to your local database

**Important note about importing real data into your local environment:** You MUST use a script/write SQL to change the email addresses in each `application.json` column, otherwise, you will be causing the system to email the actual applicants!

### Using the Document Manager and Document Generator locally

If you are running the frontend using npm run serve then you will not be able to use the document manager at the same time as the document generator. If you wish to do this then you need to make an addition to your hosts file so the browser can resolve the document_manager_backend to localhost.

If you are on a windows machine ensure that you open powershell in administrator mode as that is required to modify the hosts file and run the following command at the root of this project:

```
.\AddHosts.ps1 -Hostname document_manager_backend -DesiredIP 127.0.0.1 -CheckHostnameOnly $true
```

This will add an entry for the document manager backend if it does not currently exist.

On a mac or linux run the following:

```
./AddHosts.sh add 127.0.0.1 document_manager_backend
```

you will be prompted for your sudo password if the entry does not already exist.
