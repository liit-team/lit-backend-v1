import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private colorize(level: string, message: string): string {
    const colors: Record<string, string> = {
      log: '\x1b[32m', // green
      error: '\x1b[31m', // red
      warn: '\x1b[33m', // yellow
      debug: '\x1b[34m', // blue
      verbose: '\x1b[35m', // magenta
    };
    const reset = '\x1b[0m'; // reset color
    return `${colors[level] || ''}${message}${reset}`;
  }

  log(message: string) {
    console.log(this.colorize('log', `[Log]: ${message}`));
  }

  error(message: string, trace?: string) {
    console.error(this.colorize('error', `[Error]: ${message}`), trace);
  }

  warn(message: string) {
    console.warn(this.colorize('warn', `[Warn]: ${message}`));
  }

  debug(message: string) {
    console.debug(this.colorize('debug', `[Debug]: ${message}`));
  }

  verbose(message: string) {
    console.info(this.colorize('verbose', `[Verbose]: ${message}`));
  }
}
