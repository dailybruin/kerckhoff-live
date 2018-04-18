import axios from 'axios';
import Service from '../app';
import { KERCKHOFF_URL, MAX_TIME_BEFORE_RECHECK } from '../config';
import serviceInstance from '../index';

export default class KerckhoffContent {
  private slug: string;
  private content: any;
  private lastUpdateTime?: number;
  private ver?: string;

  constructor(slug: string) {
    this.slug = slug;
    // TODO: have this
    this.update();
  }

  // called when
  // 1) new data comes in from Kerckhoff
  // 2) someone wants a refresh
  public async pushData(update: boolean = false): Promise<void> {
    if (update || this.needUpdate()) {
      await this.update();
    }
    // we have some content, now push that to the end user
    // TODO: emit to the room
  }

  // Called by new subscriber who connects to node server and wants initial data
  // 1) getData will return data if it is current, otherwise it will
  // 2) update its data from django using pushData(true)
  public async getData(): Promise<any> {
    // If data is NOT current
    if (this.needUpdate()) {
      await this.pushData(true);
    }
    return this.content;
  }

  protected async fetchFromKerckhoff(slug: string): Promise<any> {
    const fullURL = KERCKHOFF_URL + '/api/packages/' + slug;
    const res = await axios.get(fullURL);
    return res.data;
  }

  // method called also when new post comes in from Kerckhoff
  // TODO: updates the state of its content, and emit it to the room
  private async update(): Promise<void> {
    const response = await this.fetchFromKerckhoff(this.slug);
    this.content = response;
    this.lastUpdateTime = Date.now();
  }

  private needUpdate(): boolean {
    return (
      this.lastUpdateTime === undefined ||
      Date.now() - this.lastUpdateTime > MAX_TIME_BEFORE_RECHECK
    );
  }
}
