import type { EcsManager } from "../../core";
import type Command from "./Command";

/**
 * Context passed to command handlers when a command is executed.
 * On the server, `senderId` is the id of the client entity that sent the command.
 */
export type CommandContext = {
    ecsManager: EcsManager;
    senderId?: string;
};

/**
 * A command handler is responsible for executing commands of a given type.
 * It is registered in a CommandRegistry and dispatched by the network systems.
 */
export default abstract class CommandHandler<T extends Command> {
    public readonly commandClass: new () => T;

    public readonly commandType: string;

    protected constructor(commandClass: new () => T, commandType?: string) {
        this.commandClass = commandClass;
        this.commandType = commandType ?? commandClass.name;
    }

    /**
     * Server-side validation, return true if the command can be executed.
     * @param command
     * @param context
     */
    public accept(command: T, context: CommandContext): boolean {
        return true;
    }

    /**
     * Execute the command.
     * @param command
     * @param context
     */
    public abstract execute(command: T, context: CommandContext): void;
}
