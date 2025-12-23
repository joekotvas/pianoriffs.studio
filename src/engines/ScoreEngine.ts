import { Score, createDefaultScore } from '@/types';
import { Command } from '@/commands/types';
import { BatchCommand } from '@/commands/BatchCommand';
import { BatchEventPayload } from '@/api.types';
import { logger, LogLevel } from '@/utils/debug';

type Listener = (score: Score) => void;
type BatchListener = (payload: BatchEventPayload) => void;

export class ScoreEngine {
  private state: Score;
  private listeners: Set<Listener> = new Set();
  private batchListeners: Set<BatchListener> = new Set();
  private history: Command[] = [];
  private redoStack: Command[] = [];

  constructor(initialScore?: Score) {
    this.state = initialScore || createDefaultScore();
  }

  public getHistory(): Command[] {
    return this.history;
  }

  public getRedoStack(): Command[] {
    return this.redoStack;
  }

  public getState(): Score {
    return this.state;
  }

  public setState(newState: Score) {
    if (!newState || !newState.staves) {
      logger.logValidationFailure('Attempted to set invalid state in ScoreEngine', newState);
      return;
    }

    this.state = newState;
    this.notifyListeners();
  }

  public dispatch(command: Command, options: { addToHistory?: boolean } = {}): boolean {
    logger.logCommand(command.type, command);
    const { addToHistory = true } = options;

    try {
      const newState = command.execute(this.state);

      if (!newState || !newState.staves) {
        logger.logValidationFailure(`Command ${command.type} returned invalid state`, newState);
        // Don't update state if invalid
        return false;
      }

      if (addToHistory) {
        this.history.push(command);
        this.redoStack = []; // Clear redo stack on new action
      }

      this.setState(newState);
      return true;
    } catch (error) {
      logger.log(`Error executing command ${command.type}`, error, LogLevel.ERROR);
      console.error(error);
      return false;
    }
  }

  /**
   * Commits a batch command to the history stack without executing it.
   * Assumes the state has already been updated by individual commands in the batch.
   */
  public commitBatch(batchCommand: Command) {
    logger.log('Committing batch transaction', batchCommand);
    this.history.push(batchCommand);
    this.redoStack = [];

    // Emit batch event if it's a BatchCommand
    if (batchCommand instanceof BatchCommand) {
      const payload: BatchEventPayload = {
        type: 'batch',
        timestamp: Date.now(),
        commands: batchCommand.commands.map((cmd) => ({
          type: cmd.type,
          summary: (cmd as { summary?: string }).summary, // Optional summary if available
        })),
        affectedMeasures: [], // To be implemented if Command tracks measures
      };
      this.notifyBatchListeners(payload);
    }
  }

  public undo() {
    const command = this.history.pop();
    if (command) {
      const newState = command.undo(this.state);
      this.redoStack.push(command);
      this.setState(newState);
    }
  }

  public redo() {
    const command = this.redoStack.pop();
    if (command) {
      const newState = command.execute(this.state);
      this.history.push(command);
      this.setState(newState);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeBatch(listener: BatchListener): () => void {
    this.batchListeners.add(listener);
    return () => {
      this.batchListeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  private notifyBatchListeners(payload: BatchEventPayload) {
    this.batchListeners.forEach((listener) => listener(payload));
  }
}
