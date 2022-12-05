import { SerializedEntity } from "./SerializedEntity";

export type SharedMessageData = {
    entities: SerializedEntity[];
    customData: any[];
};

export type PrivateMessageData = {
    entities: SerializedEntity[];
    customData: any[];
};

export default class Message {
    #sharedMessageData: SharedMessageData;

    #privateMessageData: PrivateMessageData;

    public constructor() {
        this.#sharedMessageData = { entities: [], customData: [] };
        this.#privateMessageData = { entities: [], customData: [] };
    }

    public toJSON(): any {
        const json: any = { ...this };
        const prototype = Object.getPrototypeOf(this);
        for (let i = 0; i < Object.getOwnPropertyNames(prototype).length; i++) {
            const key = Object.getOwnPropertyNames(prototype)[i];
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
            const hasGetter =
                descriptor && typeof descriptor.get === "function";
            if (hasGetter) {
                // @ts-ignore
                json[key] = this[key];
            }
        }
        return json;
    }

    public get sharedMessageData(): SharedMessageData {
        return this.#sharedMessageData;
    }

    public set sharedMessageData(value: SharedMessageData) {
        this.#sharedMessageData = value;
    }

    public get privateMessageData(): PrivateMessageData {
        return this.#privateMessageData;
    }

    public set privateMessageData(value: PrivateMessageData) {
        this.#privateMessageData = value;
    }
}
