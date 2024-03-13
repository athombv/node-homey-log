import Homey from 'homey/lib/Homey';
import Raven from 'raven';

interface LogInstanceParams {
  /**
   * `this.homey` instance in
   * your app (e.g. `App#homey`/`Driver#homey`/`Device#homey`).
   */
  homey: Homey;

  /**
   * Additional options for Raven
   */
  options?: any;
}

declare class Log {

  /**
   * Construct a new Log instance.
   * @param args Parameters for creating the Log instance
   *
   * @example
   * class MyApp extends Homey.App {
   *   onInit() {
   *     this.homeyLog = new Log({ homey: this.homey });
   *   }
   * }
   */
  constructor(args: LogInstanceParams);

  /**
   * Init Raven, provide falsy value as `url` to prevent sending events upstream in debug mode.
   * @param {string|boolean} url
   * @param {object} opts
   * @param {boolean} opts.captureUnhandledRejections - Track unhandled promise rejections not
   * enabled by default)
   * @returns {Log}
   * @private
   */
  init(url: boolean | string, opts: Raven.RavenOptions): Log;

  /**
   * Set `tags` that will be sent as context with every message or error. See the raven-node
   * documentation: https://docs.sentry.io/clients/node/usage/#raven-node-additional-context.
   * @param tags
   */
  setTags(tags: object): Log;

  /**
   * Set `extra` that will be sent as context with every message or error. See the raven-node
   * documentation: https://docs.sentry.io/clients/node/usage/#raven-node-additional-context.
   * @param extra
   */
  setExtra(extra: object): Log;

  /**
   * Set `user` that will be sent as context with every message or error. See the raven-node
   * documentation: https://docs.sentry.io/clients/node/usage/#raven-node-additional-context.
   * @param user
   */
  setUser(user: object): Log;

  /**
   * Create and send message event to Sentry. See the raven-node documentation:
   * https://docs.sentry.io/clients/node/usage/#capturing-messages
   * @param message Message to be sent
   */
  captureMessage(message: string): Promise<string> | undefined;

  /**
   * Create and send exception event to Sentry. See the raven-node documentation:
   * https://docs.sentry.io/clients/node/usage/#capturing-errors
   * @param err Error instance to be sent
   */
  captureException(err: Error): Promise<string | undefined>;

  /**
   * Mimic SDK log method.
   * @private
   */
  private static _log(): void;

  /**
   * Mimic SDK error method.
   * @private
   */
  private static _error(): void;

  /**
   * Mimic SDK timestamp.
   * @private
   */
  private static _logTime(): string;

  /**
   * Raven.mergeContext covers only 1-level of the context (tags, extra, user)
   * We need to merge a 2-level of the context
   * see https://github.com/getsentry/raven-node/issues/228
   * @param key The key where we can access the sent value
   * @param value The logged value
   * @private
   */
  private static _mergeContext(key: string, value: object): void;

}

export = Log;
