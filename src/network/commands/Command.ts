export type SerializedCommand = {
    type: string;
    timestamp: number;
    data: any;
};

/**
 * A command is a one-shot message exchanged between the client and the server.
 * It represents a player intent (e.g. jump, spawn player, request terrain)
 * as opposed to a continuous state synchronized through NetworkComponents.
 * Commands are serialized to plain JSON using their `type` as discriminator.
 */
export default abstract class Command {
    #type: string;

    #timestamp: number;

    protected constructor(type: string, timestamp?: number) {
        this.#type = type;
        this.#timestamp = timestamp ?? Date.now();
    }

    /**
     * The command type, used as discriminator on the wire.
     * The type is shared between the client and the server, it should be stable
     * across packages to allow commands to be exchanged.
     */
    public get type(): string {
        return this.#type;
    }

    /**
     * Serialize the command data into a json object.
     */
    public abstract write(): any;

    /**
     * Deserialize the command data. The data should come from a trusted source.
     * @param data
     */
    public abstract read(data: any): void;

    public serialize(): SerializedCommand {
        return {
            type: this.type,
            timestamp: this.#timestamp,
            data: this.write(),
        };
    }

    public deserialize(serializedCommand: SerializedCommand): void {
        this.#type = serializedCommand.type;
        this.#timestamp = serializedCommand.timestamp;
        this.read(serializedCommand.data);
    }

    public get timestamp(): number {
        return this.#timestamp;
    }
}
