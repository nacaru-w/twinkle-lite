export interface ProtectionStatus {
    level: string,
    expiry: string
}

export interface ProtectionOptions {
    code: "protección" | "desprotección",
    name: string,
    default?: boolean
}