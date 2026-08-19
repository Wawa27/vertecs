import { Command } from "../../../src";

type TestMessageData = {
    message: string;
};

export default class TestMessageCommand extends Command {
    public static readonly TYPE = "testMessage";

    #message: string;

    public constructor(message?: string) {
        super(TestMessageCommand.TYPE);
        this.#message = message ?? "";
    }

    public write(): TestMessageData {
        return {
            message: this.#message,
        };
    }

    public read(data: TestMessageData): void {
        this.#message = data.message;
    }

    public get message(): string {
        return this.#message;
    }
}
