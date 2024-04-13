
# Project Title

A brief description of what this project does and who it's for

# Burger Index Backend


## Installation and setup
Clone the repo using github

```
git clone git@github.com:noumandilshad/burger-index-backend.git
```

Use the package manager [npm](https://www.npmjs.com/) to install dependencies.

```
npm install 
```

Copy and paste the `.env` file provied and fill in the details like aws credentials.

## Start application
### Prerequisites
- Need Elastic-Seach to be installed.
- Need My-SQL to ne installed.
- NestJS to be installed

Use below command to run the nestjs application locally.

```
npm run start:dev
```

## Working

### Data Processor
Data processor modules has a schedular that runs every day at 1am and does the following:

* Fetch the data from S3 bucket that is been upload on current day and download it to the "burgur-index-data-set" folder.
* Extract the .zip files to "burgur-index-data" folder.
* After that It processes the files and does the following.
    - Get the all the json files, one by one and format to proess furthur.
    - Get the formated data, and save it into mysql tables using typeorm.
    - Index the data into Elastic-Search, to be used by frontend.

### Data Management
Data mangement modules is used to fiter and query the data using elastic search and does following:

1. Frontend calls and api `/data-management/search` with query params to fetch data, the api uses elastic-search to return the filtered data.

Query parameters:

Query Paramemeters:
```
index: products
query: Coffee
fields[]: name
offset: 0
limit: 50
```



