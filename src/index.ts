import { KibelaClient } from './client';
import { Notes } from './resources/notes';
import { Groups } from './resources/groups';
import { Users } from './resources/users';
import { Folders } from './resources/folders';
import { KibelaConfig } from './types';

export class Kibela {
  private client: KibelaClient;
  public notes: Notes;
  public groups: Groups;
  public users: Users;
  public folders: Folders;

  constructor(config: KibelaConfig) {
    this.client = new KibelaClient(config);
    this.notes = new Notes(this.client);
    this.groups = new Groups(this.client);
    this.users = new Users(this.client);
    this.folders = new Folders(this.client);
  }

  getTeam(): string {
    return this.client.getTeam();
  }
}

export function createClient(config: KibelaConfig): Kibela {
  return new Kibela(config);
}

export * from './types';