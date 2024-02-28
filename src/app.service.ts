import { Injectable, Logger } from '@nestjs/common';
import { promisify } from 'util';
import { exec as execNonPromise } from 'child_process';
import { SpaceUsers, UserRoles } from './app.model';
import { createObjectCsvWriter } from 'csv-writer';
import { promises as fs } from 'fs';

const exec = promisify(execNonPromise);

@Injectable()
export class AppService {
  async getSpacesList(): Promise<string[]> {
    try {
      const { stdout } = await exec('datasphere spaces list');

      return JSON.parse(stdout);
    } catch (err) {
      Logger.error(`Error: ${err}`);
    }
  }

  async getSpacesUsers(spaces: string[]): Promise<SpaceUsers[]> {
    try {
      const currentTimestamp = new Date(Date.now()).toISOString();

      const spacesUsers = await Promise.all(
        spaces.map(async (space) => {
          const { stdout } = await exec(
            `datasphere spaces users read --space ${space} --accept application/vnd.sap.datasphere.space.users.list+json`,
          );
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
        }),
      );

      return spacesUsers.flat();
    } catch (err) {
      Logger.error(`Error: ${err}`);
    }
  }

  async getUserRoles(): Promise<UserRoles[]> {
    try {
      const currentTimestamp = new Date(Date.now()).toISOString();

      const { stdout } = await exec(
        `datasphere users list --accept application/vnd.sap.datasphere.space.users.details+json`,
      );

      const userRolesFull = JSON.parse(stdout);

      return userRolesFull
        .map((userData) => {
          const userRoles = [];
          const roles = userData.roles.split(';');

          for (const role of roles) {
            userRoles.push({
              user: userData.userName,
              role,
              updatedAt: currentTimestamp,
            });
          }

          return userRoles;
        })
        .flat();
    } catch (err) {
      Logger.error(`Error: ${err}`);
    }
  }

  async createCsv<T>(data: T[], name: string): Promise<void> {
    const header = [];
    const dirPath = './downloads';

    try {
      await fs.access(dirPath);
    } catch (e) {
      await fs.mkdir(dirPath);
    }

    for (const key in data[0]) {
      header.push({ id: key, title: key.toUpperCase() });
    }

    const cvsWriter = createObjectCsvWriter({
      path: `${dirPath}/${name}.csv`,
      header,
    });

    await cvsWriter.writeRecords(data);
  }

  async createCsvs(): Promise<void> {
    try {
      const spaces = await this.getSpacesList();
      const spaceUsers = await this.getSpacesUsers(spaces);
      const userRoles = await this.getUserRoles();

      await this.createCsv(spaceUsers, 'spaceUsers');
      await this.createCsv(userRoles, 'userRoles');

      Logger.log('User data downloaded');
    } catch (err) {
      Logger.error(`Error: ${err}`);
    }
  }
}
