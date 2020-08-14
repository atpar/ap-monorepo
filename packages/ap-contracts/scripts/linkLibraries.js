/**
 * Utilities to link libraries to the bytecode (of a smart contract)
 * Source (adopted): buidler-deploy/src/helpers.ts:
 */

/* global web3, Web3 */
const soliditySha3 = (web3 || Web3).utils.soliditySha3;

module.exports = {
    isLinkingNeeded,
    linkLibraries,
}

/**
 * @param bytecode
 * @return {Boolean} `true` if the bytecode needs linking (contains placeholders)
 */
function isLinkingNeeded(bytecode) {
    return bytecode.search("_") > 0;
}

/**
 * @typedef Artifact {
     bytecode: string;
     linkReferences?: {[libraryFileName: string]: {
       [libraryName: string]: Array<{ length: number; start: number }>
     }
   }
 * @typedef Libraries { [libraryName: string]: Address: string }
 */

/**
 * It statically links libraries into the bytecode (of a smart contract)
 * Usage: const byteCode = linkLibraries(artifact, options.libraries);
 * @param {Artifact} artifact - Solc/Buidler artifact
 * @param {Libraries} libraries - to link
 * @return {String} bytecode - linked bytecode
 */
function linkLibraries(artifact, libraries) {
    let { bytecode, linkReferences } = artifact;

    if (libraries) {
        if (linkReferences) {
            for (const [ , fileReferences] of Object.entries(linkReferences)) {
                for (const [libName, fixups] of Object.entries(fileReferences)) {
                    const addr = libraries[libName];
                    if (addr === undefined) continue;

                    for (const fixup of fixups) {
                        bytecode =
                            bytecode.substr(0, 2 + fixup.start * 2) +
                            addr.substr(2) +
                            bytecode.substr(2 + (fixup.start + fixup.length) * 2);
                    }
                }
            }
        } else {
            bytecode = linkRawLibraries(bytecode, libraries);
        }
    }

    return bytecode;
}

function linkRawLibraries(bytecode, libraries) {
    for (const libName of Object.keys(libraries)) {
        const libAddress = libraries[libName];
        bytecode = linkRawLibrary(bytecode, libName, libAddress);
    }
    return bytecode;
}

function linkRawLibrary(bytecode, libraryName, libraryAddress) {
    const address = libraryAddress.replace("0x", "");
    const isHashed = (libraryName.startsWith("$") && libraryName.endsWith("$"));
    const encodedLibraryName = isHashed
        ? libraryName.slice(1, libraryName.length - 1)
        : hashLibName(libraryName);

    const pattern = new RegExp(`_+\\$${encodedLibraryName}\\$_+`, "g");
    if (!pattern.exec(bytecode)) {
        throw new Error(
            `Can't link '${libraryName}' (${encodedLibraryName}) in \n----\n ${bytecode}\n----\n`
        );
    }

    return bytecode.replace(pattern, address);
}

function hashLibName(libName) {
    // TODO: fix library name hashing
    throw new Error("library name hashing not yet supported");
    // "reference" code (from `buidler-deplpyer`): `return solidityKeccak256(["string"], [libName]).slice(2, 36)`
    // expected result (example): `hashLibName("CEGEncoder") === "42afaa163c16ede2bfb2fbb9ec69691405"`
    // implementation that returns unexpected result:
    return soliditySha3({ type: 'string', value: libName }).slice(2, 36);
}
