import Command from "./Command";

export type SetupData = {
    clientId: string;
};

/**
 * Sent by the server to each connected client to provide the client's network id.
 */
export default class SetupCommand extends Command {
    public static readonly TYPE = "setup";

    #clientId: string;

    public constructor(clientId?: string) {
        super(SetupCommand.TYPE);
        this.#clientId = clientId ?? "";
    }

    public write(): SetupData {
        return {
            clientId: this.#clientId,
        };
    }

    public read(data: SetupData): void {
        this.#clientId = data.clientId;
    }

    public get clientId(): string {
        return this.#clientId;
    }
}
