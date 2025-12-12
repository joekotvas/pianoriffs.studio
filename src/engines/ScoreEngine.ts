import { Score, createDefaultScore } from '../types';
import { Command } from '../commands/types';
import { logger, LogLevel } from '../utils/debug';

type Listener = (score: Score) => void;

export class ScoreEngine {
  private state: Score;
  private listeners: Set<Listener> = new Set();
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

  public dispatch(command: Command) {
    logger.logCommand(command.type, command);
    
    try {
        const newState = command.execute(this.state);
        
        if (!newState || !newState.staves) {
            logger.logValidationFailure(`Command ${command.type} returned invalid state`, newState);
            // Don't update state if invalid
            return;
        }

        this.history.push(command);
        this.redoStack = []; // Clear redo stack on new action
        this.setState(newState);
    } catch (error) {
        logger.log(`Error executing command ${command.type}`, error, LogLevel.ERROR);
        console.error(error);
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

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
}
