export interface CommandOption {
  flags: string;
  description: string;
  defaultValue?: any;
  required?: boolean;
}

export interface ParsedArgs {
  args: string[];
  options: Record<string, any>;
}

export type CommandHandler = (args: ParsedArgs) => void | Promise<void>;

export class Command {
  private name: string;
  private description: string;
  private options: CommandOption[] = [];
  private handler?: CommandHandler;
  public subcommands: Map<string, Command> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor(name: string, description: string = '') {
    this.name = name;
    this.description = description;
  }

  option(flags: string, description: string, defaultValue?: any): this {
    this.options.push({ flags, description, defaultValue });
    return this;
  }

  requiredOption(flags: string, description: string): this {
    this.options.push({ flags, description, required: true });
    return this;
  }

  action(handler: CommandHandler): this {
    this.handler = handler;
    return this;
  }

  command(name: string, description?: string): Command {
    const cmd = new Command(name, description || '');
    this.subcommands.set(name, cmd);
    return cmd;
  }

  alias(alias: string): this {
    const parent = this.getParentName();
    if (parent) {
      this.aliases.set(alias, this.name);
    }
    return this;
  }

  private getParentName(): string | null {
    // This is a simplified version - in a full implementation, 
    // we'd track parent-child relationships
    return null;
  }

  parse(argv: string[]): void {
    // Check for subcommands first
    if (argv.length > 0 && !argv[0].startsWith('-') && this.subcommands.has(argv[0])) {
      const subcommand = this.subcommands.get(argv[0])!;
      subcommand.parse(argv.slice(1));
      return;
    }
    
    const parsed = this.parseArgs(argv);

    if (this.handler) {
      const result = this.handler(parsed);
      if (result instanceof Promise) {
        result.catch(err => {
          console.error('Error:', err.message);
          process.exit(1);
        });
      }
    } else {
      this.showHelp();
    }
  }

  private parseArgs(argv: string[]): ParsedArgs {
    const args: string[] = [];
    const options: Record<string, any> = {};

    // Set default values
    for (const opt of this.options) {
      const key = this.getOptionKey(opt.flags);
      if (opt.defaultValue !== undefined) {
        options[key] = opt.defaultValue;
      }
    }

    let i = 0;
    while (i < argv.length) {
      const arg = argv[i];

      if (arg.startsWith('-')) {
        // Handle --no- prefix for negated boolean options
        if (arg.startsWith('--no-')) {
          const positiveFlag = '--' + arg.slice(5);
          const option = this.findOption(positiveFlag);
          if (option && this.isBooleanFlag(option)) {
            const key = this.getOptionKey(option.flags);
            options[key] = false;
          } else {
            throw new Error(`Unknown option: ${arg}`);
          }
        } else {
          const option = this.findOption(arg);
          if (option) {
            const key = this.getOptionKey(option.flags);
            
            // Check if this is a boolean flag or expects a value
            if (this.isBooleanFlag(option)) {
              options[key] = true;
            } else {
              i++;
              if (i >= argv.length) {
                throw new Error(`Option ${arg} requires a value`);
              }
              options[key] = argv[i];
            }
          } else {
            // Debug: show available options
            const availableOptions = this.options.map(o => o.flags).join(', ');
            throw new Error(`Unknown option: ${arg}\nAvailable options: ${availableOptions}`);
          }
        }
      } else {
        args.push(arg);
      }
      i++;
    }

    // Check required options
    for (const opt of this.options) {
      if (opt.required) {
        const key = this.getOptionKey(opt.flags);
        if (!(key in options)) {
          throw new Error(`Required option ${opt.flags} not provided`);
        }
      }
    }

    return { args, options };
  }

  private findOption(flag: string): CommandOption | null {
    return this.options.find(opt => {
      const flags = opt.flags.split(/,\s*/);
      return flags.some(f => {
        const cleanFlag = f.trim().split(/\s+/)[0]; // Remove parameter part like <dir>
        return cleanFlag === flag;
      });
    }) || null;
  }

  private getOptionKey(flags: string): string {
    const longFlag = flags.split(/,\s*/).find(f => f.startsWith('--'));
    if (longFlag) {
      return longFlag.replace(/^--/, '').replace(/<.*>|\[.*\]/, '').trim();
    }
    const shortFlag = flags.split(/,\s*/)[0];
    return shortFlag.replace(/^-/, '').replace(/<.*>|\[.*\]/, '').trim();
  }

  private isBooleanFlag(option: CommandOption): boolean {
    return !option.flags.includes('<') && !option.flags.includes('[');
  }

  showHelp(): void {
    console.log(`\nUsage: ${this.name} [options] [command]\n`);
    
    if (this.description) {
      console.log(`${this.description}\n`);
    }

    if (this.options.length > 0) {
      console.log('Options:');
      const maxFlagLength = Math.max(...this.options.map(o => o.flags.length));
      
      for (const opt of this.options) {
        const flags = opt.flags.padEnd(maxFlagLength + 2);
        const required = opt.required ? ' (required)' : '';
        console.log(`  ${flags} ${opt.description}${required}`);
      }
      console.log();
    }

    if (this.subcommands.size > 0) {
      console.log('Commands:');
      const maxNameLength = Math.max(...Array.from(this.subcommands.keys()).map(k => k.length));
      
      for (const [name, cmd] of this.subcommands) {
        const paddedName = name.padEnd(maxNameLength + 2);
        console.log(`  ${paddedName} ${cmd.description}`);
      }
      console.log();
    }
  }
}

export class CLI {
  private program: Command;
  private version: string = '1.0.0';

  constructor(name: string, description?: string) {
    this.program = new Command(name, description);
    this.setupDefaultOptions();
  }

  private setupDefaultOptions(): void {
    this.program
      .option('-v, --version', 'output the version number')
      .option('-h, --help', 'display help for command');
  }

  setVersion(version: string): this {
    this.version = version;
    return this;
  }

  option(flags: string, description: string, defaultValue?: any): this {
    this.program.option(flags, description, defaultValue);
    return this;
  }

  requiredOption(flags: string, description: string): this {
    this.program.requiredOption(flags, description);
    return this;
  }

  command(name: string, description?: string): Command {
    return this.program.command(name, description);
  }

  action(handler: CommandHandler): this {
    this.program.action(handler);
    return this;
  }

  parse(argv: string[] = process.argv.slice(2)): void {
    try {
      // Handle version flag
      if (argv.includes('-v') || argv.includes('--version')) {
        console.log(this.version);
        process.exit(0);
      }

      // Handle help flag
      if (argv.includes('-h') || argv.includes('--help')) {
        // Check if help is for a specific command
        const commandIndex = argv.findIndex(arg => !arg.startsWith('-'));
        if (commandIndex >= 0 && this.program.subcommands.has(argv[commandIndex])) {
          const cmd = this.program.subcommands.get(argv[commandIndex])!;
          cmd.showHelp();
        } else {
          this.program.showHelp();
        }
        process.exit(0);
      }
      
      if (argv.length === 0) {
        this.program.showHelp();
        process.exit(0);
      }

      this.program.parse(argv);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    }
  }
}