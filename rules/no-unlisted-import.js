const fs = require('fs');
const path = require('path');
const minimatch = require('minimatch');
const { builtinModules } = require('module');

function readDependencies(packageJsonPath) {
    try {
        const data = fs.readFileSync(packageJsonPath, 'utf8');
        const pkg = JSON.parse(data);
        return new Set([
            ...Object.keys(pkg.dependencies || {}),
            ...Object.keys(pkg.devDependencies || {}),
            ...Object.keys(pkg.peerDependencies || {}),
        ]);
    } catch (e) {
        return new Set();
    }
}

function getPackageName(importPath) {
    if (importPath.startsWith('@')) {
        const parts = importPath.split('/');
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : importPath;
    }
    return importPath.split('/')[0];
}

module.exports = {
    meta: { type: 'problem' },
    create: context => {
        const option = context.options[0] || {};
        const packages = option.packages || [];
        const blacklistPatterns = option.blacklist || [];
        const server = option.server;

        const blacklist = new Set(blacklistPatterns);
        if (server) {
            builtinModules.forEach(m => blacklist.add(m));
        }

        const depsByRoot = {};
        packages.forEach(pkg => {
            const pkgPath = path.resolve(pkg.packageJson);
            depsByRoot[pkg.root] = readDependencies(pkgPath);
        });

        function depsForFile(filename) {
            const match = packages.find(p => filename.includes(p.root));
            return match ? depsByRoot[match.root] : null;
        }

        function isBlacklisted(name) {
            for (const pattern of blacklist) {
                if (minimatch(name, pattern)) {
                    return true;
                }
            }
            return false;
        }

        return {
            ImportDeclaration(node) {
                const source = node.source.value;
                if (source.startsWith('.') || source.startsWith('/')) {
                    return;
                }
                const pkgName = getPackageName(source);
                if (isBlacklisted(pkgName)) {
                    context.report(node, `'${pkgName}' is blacklisted.`);
                    return;
                }
                const filename = context.getPhysicalFilename ? context.getPhysicalFilename() : context.getFilename();
                const deps = depsForFile(filename);
                if (!deps) {
                    return;
                }
                if (!deps.has(pkgName)) {
                    context.report(node, `Package '${pkgName}' is not listed in package.json dependencies.`);
                }
            },
        };
    },
};
