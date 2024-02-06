/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'util';
import { exec as execNonPromise } from 'child_process';
import { SpaceUsers, UserRoles } from './app.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ObjectsToCsv = require('objects-to-csv');
const exec = promisify(execNonPromise);

// ADD TIMESTAMP in resultset
@Injectable()
export class AppService {

  async getSpacesList(): Promise<string[]> {
    try {
        const { stdout } = await exec('datasphere spaces list');

        return JSON.parse(stdout);    
    } catch(err) {
        Logger.error(`Error: ${err}`);
    }
  }

 async  getSpacesUsers(spaces: string[]): Promise<SpaceUsers[]> {
    try {
        const currentTimestamp = new Date(Date.now()).toISOString();

        const spacesUsers = await Promise.all(
        spaces.map(async (space) => {
            const { stdout } = await exec(`datasphere spaces users read --space ${space} --accept application/vnd.sap.datasphere.space.users.list+json`);
            const users = JSON.parse(stdout);
            const spaceUsers = [];

            for (const user of users) {
                spaceUsers.push({
                    space: space,
                    user: user,
                    updatedAt: currentTimestamp,
                });
            }

            return spaceUsers;
        })
  );

  return spacesUsers.flat();
    } catch(err) {
        Logger.error(`Error: ${err}`);
    }
 }

 async getUserRoles(): Promise<UserRoles[]> {
    try {
        const currentTimestamp = new Date(Date.now()).toISOString();

        const { stdout } = await exec(`datasphere users list --accept application/vnd.sap.datasphere.space.users.details+json`);
      
        const userRolesFull = JSON.parse(stdout);
      
        return userRolesFull.map(userData => {
            const userRoles = [];
            const roles = userData.roles.split(';');
      
            for (const role of roles) {
                userRoles.push(
                    {
                        user: userData.userName,
                        role,
                        updatedAt: currentTimestamp
                    }
                )
            }
      
            return userRoles;
        }).flat();  
      } catch(err) {
        Logger.error(`Error: ${err}`);
      }
 }

 createCsv<T>(data: T, name: string): void {
  new ObjectsToCsv(data).toDisk(`./downloads/${name}.csv`)
 }

 async createCsvs(): Promise<void> {
    try {
        const spaces = await this.getSpacesList();
        const spaceUsers = await this.getSpacesUsers(spaces);
        const userRoles = await this.getUserRoles();
    
        await this.createCsv(spaceUsers, 'spaceUsers');
        await this.createCsv(userRoles, 'userRoles');
    
        Logger.log('User data downloaded');
    
    } catch(err) {
        Logger.error(`Error: ${err}`);
    }
  }
}
