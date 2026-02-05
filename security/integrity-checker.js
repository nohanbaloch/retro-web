/**
 * Integrity Checker
 * Verifies code signatures and file hashes to ensure system security.
 */

export class IntegrityChecker {
    constructor(kernel) {
        this.kernel = kernel;
        this.trustedKeys = new Set([
            'system-core', // Virtual key for core system items
            'nohan-baloch-official'
        ]);
    }

    /**
     * Compute SHA-256 hash of a string content
     */
    async computeHash(content) {
        const msgBuffer = new TextEncoder().encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    /**
     * Verify content against a known checksum
     */
    async verifyChecksum(content, expectedHash) {
        const hash = await this.computeHash(content);
        return hash === expectedHash;
    }

    /**
     * Validate a Plugin Package
     * Checks if the plugin structure is valid and verifies signature if present.
     * @param {Object} manifest - Plugin manifest object
     * @param {String} sourceCode - The actual plugin code
     */
    async validatePlugin(manifest, sourceCode) {
        const results = {
            isValid: false,
            errors: [],
            warnings: []
        };

        // 1. Structural Validation
        if (!manifest || typeof manifest !== 'object') {
            results.errors.push('Manifest is missing or invalid');
            return results;
        }

        const requiredFields = ['id', 'name', 'version', 'entry'];
        for (const field of requiredFields) {
            if (!manifest[field]) {
                results.errors.push(`Missing required manifest field: ${field}`);
            }
        }

        if (results.errors.length > 0) return results;

        // 2. Checksum Verification (if integrity hash provided)
        if (manifest.integrity) {
            const calculatedHash = await this.computeHash(sourceCode);
            if (calculatedHash !== manifest.integrity) {
                results.errors.push(`Integrity check failed. Expected ${manifest.integrity.substring(0,8)}..., got ${calculatedHash.substring(0,8)}...`);
                return results;
            }
        } else {
            results.warnings.push('No integrity hash provided in manifest');
        }

        // 3. Signature Verification (Simulated PKI)
        if (manifest.signature) {
            // In a real system, we would verify this signature against a public key
            // Here we simulate it by checking if it claims to be signed by a trusted authority
            // For now, we trust signatures that start with 'sig_'
            if (!manifest.signature.startsWith('sig_')) {
                results.errors.push('Invalid signature format');
            }
            
            // Check signer
            if (manifest.signer && !this.trustedKeys.has(manifest.signer)) {
                results.warnings.push(`Plugin signed by untrusted entity: ${manifest.signer}`);
            }
        } else {
            results.warnings.push('Plugin is unsigned');
        }

        results.isValid = results.errors.length === 0;
        return results;
    }

    /**
     * scanning a directory (simulated antivirus)
     */
    async scanDirectory(path) {
        // Placeholder for future recursive scan
        console.log(`[INTEGRITY] Scanning ${path}...`);
        return true;
    }
}
