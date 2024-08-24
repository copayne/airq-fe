# Create T3 App
# Hudson Air Quality Frontend

## About
The Hudson Air Quality Frontend is a UI dashboard for managing and analyzing air quality data from the Hudson Air Quality project. It is built using [T3 Stack](https://create.t3.gg/), bootstrapped with `create-t3-app`. It utilizes apollo to handle fetching data from the graphql endpoint and is styled using Tailwind.

## TODO: SCREENSHOTS

## Initialize Frontend on a new machine

### Setup SSH key with github on machine
Run ```ssh-keygen``` on machine

Navigate to file (/.ssh by default)

Run ```cat id_rsa.pub``` and copy contents

Create new key under settings/SSH and GPG Keys

Copy contents to github key and save

### Clone repository on machine
```git clone git@github.com:copayne/airq-fe.git```

### Install Dependencies
```npm install```

### Run App
```npm run dev```

### Check Status
- Ensure API server is running and database has been setup
- Open browser tab and navigate to http://localhost:3000
- Should successfully open dashboard