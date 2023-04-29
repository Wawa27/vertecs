import "cannon-es";

declare module "cannon-es" {
    interface Body {
        entityId?: string;
    }
}
