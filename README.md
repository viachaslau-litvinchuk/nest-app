

## Description
Application to generate csv file with data about users, roles and spaces from SAP Datasphere.

## Prerequsits
- Install [Git SCM](https://git-scm.com/downloads);
- Install [Node.js >=18.10.0](https://nodejs.org/en/download);
- Install [SAP Datasphere cli >=2023.25.0](https://www.npmjs.com/package/@sap/datasphere-cli);
- [Create OAuth2.0 Clients to Authenticate Against SAP Datasphere](https://help.sap.com/docs/SAP_DATASPHERE/935116dd7c324355803d4b85809cec97/3f92b46fe0314e8ba60720e409c219fc.html?state=DRAFT&version=DEV_CURRENT);
- [Log into the Command Line Interface via an OAuth Client](https://help.sap.com/docs/SAP_DATASPHERE/d0ecd6f297ac40249072a44df0549c1a/eb7228a171a842fa84e48c899d48c970.html?q=oauth%20client);
- Set config host
    > datasphere config host set "<Server_URL>".

## Setup and run the application
1. Grab the source codes from GitHub:
    > `git clone https://github.com/viachaslau-litvinchuk/nest-app.git -b master`;
2. Install required packages:
    > `npm install`;
3. Run the application:
    > `npm run start` or `nest start`;
4. To find generated csv files navigate to ./downloads folder.
5. Now you can upload the files to SAP Datasphere tables.

## Data model
***spaceUsers:*** *SPACE: NVARCHAR(20), USER: NVARCHAR(20), UPDATEDAT: DateTime;*

***userRoles:*** *USER: NVARCHAR(20), ROLE: NVARCHAR(100), UPDATEDAT: DateTime;*

## Possible use cases
- Get change of data over time;
- Get user's roles by spaces;
- Get roles by spaces.

## Possible improvements
- Expanding of data model;
- Simplification of authorization process.