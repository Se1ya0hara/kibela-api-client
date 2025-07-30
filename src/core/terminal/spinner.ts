import { colors } from './colors';

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export class Spinner {
  public text: string = '';
  private frameIndex: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private stream: NodeJS.WriteStream;
  private isRunning: boolean = false;

  constructor(text?: string) {
    this.text = text || '';
    this.stream = process.stderr;
  }

  start(text?: string): void {
    if (this.isRunning) return;
    
    if (text) {
      this.text = text;
    }

    if (!this.stream.isTTY) {
      // In non-TTY environment, just print the text once
      this.stream.write(`${this.text}\n`);
      return;
    }

    this.isRunning = true;
    this.frameIndex = 0;
    
    // Hide cursor
    this.stream.write('\x1B[?25l');
    
    this.intervalId = setInterval(() => {
      this.render();
    }, 80);
  }

  private render(): void {
    const frame = SPINNER_FRAMES[this.frameIndex];
    this.frameIndex = (this.frameIndex + 1) % SPINNER_FRAMES.length;
    
    // Clear line and render spinner
    this.stream.write(`\r${colors.cyan(frame)} ${this.text}`);
  }

  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.stream.isTTY) {
      // Clear line and show cursor
      this.stream.write('\r\x1B[K');
      this.stream.write('\x1B[?25h');
    }
  }

  succeed(text?: string): void {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${colors.green('✓')} ${message}\n`);
  }

  fail(text?: string): void {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${colors.red('✗')} ${message}\n`);
  }

  warn(text?: string): void {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${colors.yellow('⚠')} ${message}\n`);
  }

  info(text?: string): void {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${colors.blue('ℹ')} ${message}\n`);
  }

  setText(text: string): void {
    this.text = text;
  }
}