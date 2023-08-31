export default class DependencyGraph {
    static getOrderedSystems(systems) {
        const resolved = [];
        const unresolved = [];
        systems.forEach((system) => {
            if (systems.includes(system) && !resolved.includes(system)) {
                this.resolveSystem(systems, system, resolved, unresolved);
            }
        });
        return resolved;
    }
    static resolveSystem(systems, systemToResolve, resolvedSystems, unresolved) {
        if (!systemToResolve.hasEnoughTimePassed()) {
            return false;
        }
        unresolved.push(systemToResolve);
        const dependencies = systemToResolve.dependencies.map((dependencyClass) => systems.find((system) => system instanceof dependencyClass));
        for (let i = 0; i < dependencies.length; i++) {
            const dependency = dependencies[i];
            if (!dependency || !dependency.hasEnoughTimePassed()) {
                const index = unresolved.indexOf(systemToResolve);
                if (index > -1) {
                    unresolved.splice(index, 1);
                }
                return false;
            }
            if (!resolvedSystems.includes(dependency)) {
                if (!this.resolveSystem(systems, dependency, resolvedSystems, unresolved)) {
                    // If we can't resolve the dependency, we can't resolve the system.
                    const index = unresolved.indexOf(systemToResolve);
                    if (index > -1) {
                        unresolved.splice(index, 1);
                    }
                    return false;
                }
            }
        }
        resolvedSystems.push(systemToResolve);
        const index = unresolved.indexOf(systemToResolve);
        if (index > -1) {
            unresolved.splice(index, 1);
        }
        return true;
    }
}
