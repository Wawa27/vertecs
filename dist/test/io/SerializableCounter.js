import { SerializableComponent } from "../../src/io";
export default class SerializableCounter extends SerializableComponent {
    count;
    constructor(counter, options) {
        super(options);
        this.count = counter || 0;
    }
    increment() {
        this.count++;
    }
    accept(data) {
        return true;
    }
    read(data) {
        this.count = data.count;
    }
    write() {
        return {
            count: this.count,
        };
    }
}
