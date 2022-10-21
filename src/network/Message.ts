import SerializedEntity from "./SerializedEntity";

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

    public constructor(
        sharedMessageData: SharedMessageData,
        privateMessageData: PrivateMessageData
    ) {
        this.#sharedMessageData = sharedMessageData;
        this.#privateMessageData = privateMessageData;
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
