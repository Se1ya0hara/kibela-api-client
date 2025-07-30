import * as readline from 'readline';
import { colors } from './colors';

export interface PromptOptions {
  type?: 'text' | 'password' | 'confirm' | 'select';
  message: string;
  default?: any;
  choices?: Array<{ title: string; value: any }>;
  validate?: (value: any) => boolean | string;
}

export class Prompt {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  async ask(options: PromptOptions): Promise<any> {
    switch (options.type) {
      case 'password':
        return this.askPassword(options);
      case 'confirm':
        return this.askConfirm(options);
      case 'select':
        return this.askSelect(options);
      default:
        return this.askText(options);
    }
  }

  private askText(options: PromptOptions): Promise<string> {
    return new Promise((resolve) => {
      const defaultHint = options.default ? ` (${options.default})` : '';
      const question = `${options.message}${defaultHint}: `;

      const askQuestion = () => {
        this.rl.question(question, (answer) => {
          const value = answer.trim() || options.default || '';
          
          if (options.validate) {
            const result = options.validate(value);
            if (result !== true) {
              console.log(colors.red(typeof result === 'string' ? result : 'Invalid input'));
              askQuestion();
              return;
            }
          }

          resolve(value);
        });
      };

      askQuestion();
    });
  }

  private askPassword(options: PromptOptions): Promise<string> {
    return new Promise((resolve) => {
      const question = `${options.message}: `;

      // Disable echo for password input
      const stdin = process.stdin;
      const wasRaw = stdin.isRaw;
      
      if (stdin.isTTY) {
        stdin.setRawMode(true);
      }

      process.stdout.write(question);
      
      let password = '';
      
      const onData = (char: Buffer) => {
        const str = char.toString();
        
        switch (str) {
          case '\n':
          case '\r':
          case '\u0004': // Ctrl+D
            if (stdin.isTTY && wasRaw !== undefined) {
              stdin.setRawMode(wasRaw);
            }
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            resolve(password);
            break;
          case '\u0003': // Ctrl+C
            if (stdin.isTTY && wasRaw !== undefined) {
              stdin.setRawMode(wasRaw);
            }
            stdin.removeListener('data', onData);
            process.stdout.write('\n');
            process.exit(0);
            break;
          case '\u007f': // Backspace
            if (password.length > 0) {
              password = password.slice(0, -1);
              process.stdout.write('\b \b');
            }
            break;
          default:
            password += str;
            process.stdout.write('*');
            break;
        }
      };

      stdin.on('data', onData);
    });
  }

  private askConfirm(options: PromptOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const defaultValue = options.default !== undefined ? options.default : true;
      const hint = defaultValue ? '(Y/n)' : '(y/N)';
      const question = `${options.message} ${hint}: `;

      this.rl.question(question, (answer) => {
        const value = answer.trim().toLowerCase();
        
        if (value === '') {
          resolve(defaultValue);
        } else if (value === 'y' || value === 'yes') {
          resolve(true);
        } else if (value === 'n' || value === 'no') {
          resolve(false);
        } else {
          // Invalid input, ask again
          this.askConfirm(options).then(resolve);
        }
      });
    });
  }

  private askSelect(options: PromptOptions): Promise<any> {
    return new Promise((resolve) => {
      if (!options.choices || options.choices.length === 0) {
        throw new Error('No choices provided for select prompt');
      }

      console.log(options.message);
      options.choices.forEach((choice, index) => {
        const isDefault = choice.value === options.default;
        const prefix = isDefault ? colors.cyan('❯') : ' ';
        console.log(`${prefix} ${index + 1}. ${choice.title}`);
      });

      const defaultIndex = options.default
        ? options.choices.findIndex(c => c.value === options.default) + 1
        : 1;
      
      const question = `Select an option (1-${options.choices.length}) [${defaultIndex}]: `;

      this.rl.question(question, (answer) => {
        const value = answer.trim();
        const index = value === '' ? defaultIndex - 1 : parseInt(value, 10) - 1;

        if (index >= 0 && index < options.choices!.length) {
          resolve(options.choices![index].value);
        } else {
          console.log(colors.red('Invalid selection. Please try again.'));
          this.askSelect(options).then(resolve);
        }
      });
    });
  }

  close(): void {
    this.rl.close();
  }
}

export async function prompt(options: PromptOptions): Promise<any> {
  const p = new Prompt();
  const result = await p.ask(options);
  p.close();
  return result;
}