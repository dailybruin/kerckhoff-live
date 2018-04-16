import Service from '../app';
import { KERCKHOFF_URL, MAX_TIME_BEFORE_RECHECK } from '../config';
import serviceInstance from '../index';
export default class KerckhoffContent {
  private slug: string;
  private content: any;
  private lastUpdateTime?: number;
  private ver?: string;

  constructor(slug: string, service?: Service) {
    this.slug = slug;
    // TODO: have this
    this.update();
  }

  // called when
  // 1) new data comes in from Kerckhoff
  // 2) someone wants a refresh
  public async pushData(update: boolean = false): Promise<void> {
    if (
      update ||
      this.lastUpdateTime === undefined ||
      Date.now() - this.lastUpdateTime > MAX_TIME_BEFORE_RECHECK
    ) {
      await this.update();
    }
    // we have some content, now push that to the end user
    // TODO: emit to the room
  }

  //public getData: Im a new subscriber, I connect to node server, I need new initial data
  //I call getData. getData will return data if it is current, otherwise it will 
  //update its data from django

  // method called also when new post comes in from Kerckhoff
  // TODO: updates the state of its content, and emit it to the room
  private async update(): Promise<void> {
    const response = await this.fetchFromKerckhoff(this.slug);
    this.content = response;
    this.lastUpdateTime = Date.now();
  }

  private async fetchFromKerckhoff(slug: string): Promise<any> {
    // TODO: actually fetch from kerckhoff
    return {
      test: 'test',
    };
  }
}
