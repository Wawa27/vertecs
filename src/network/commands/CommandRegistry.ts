import CommandHandler from "./CommandHandler";

/**
 * Registry mapping command types to their handlers.
 * Handlers are dispatched by the network systems when a command is received.
 */
export default class CommandRegistry {
    #handlers: Map<string, CommandHandler<any>>;

    public constructor(handlers: CommandHandler<any>[] = []) {
        this.#handlers = new Map();
        handlers.forEach((handler) => this.register(handler));
    }

    public register(handler: CommandHandler<any>): void {
        if (this.#handlers.has(handler.commandType)) {
            throw new Error(
                `Command type ${handler.commandType} is already registered`
            );
        }
        this.#handlers.set(handler.commandType, handler);
    }

    public get(type: string): CommandHandler<any> | undefined {
        return this.#handlers.get(type);
    }

    public get handlers(): Map<string, CommandHandler<any>> {
        return this.#handlers;
    }
}
