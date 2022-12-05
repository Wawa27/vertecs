import { Body } from "cannon-es";

declare module "cannon-es" {
    interface Body {
        entityId?: string;
    }
}
