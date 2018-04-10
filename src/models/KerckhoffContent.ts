import Service from "../app";
import { KERCKHOFF_URL } from "../config";
import serviceInstance from "../index";
export default class KerckhoffContent {
  private slug: string;
  private content: any;

  constructor(slug: string, service?: Service) {
    this.slug = slug;
  }

  // TODO: updates the state of its content, and emit it to the room
  public update(content?: any): void {
    return
  }
}
