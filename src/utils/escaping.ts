export function escapeGroqString(str: string): string {
    return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"')   // Escape double quotes
    .replace(/\n/g, '\\n')   // Escape newlines
    .replace(/\r/g, '\\r')   // Escape carriage returns
    .replace(/\t/g, '\\t')   // Escape tabs
    .replace(/\f/g, '\\f')   // Escape form feeds
    .replace(/\v/g, '\\v')   // Escape vertical tabs
    .replace(/`/g, '\\`');   // Escape backticks
}

export function escapeFieldName(fieldName: string): string{
    // Escape field names that are not valid identifiers
    if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldName)) {
        return fieldName; // Valid identifier, no need to escape
    }

    if(fieldName.includes('.')) {   
        return fieldName.split(".").map(part => {
            if(/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(part)) {
                return part; // Valid identifier, no need to escape
            }
            return `"${escapeGroqString(part)}"`; // Escape invalid identifiers
        }).join('.');
    }
    return `"${escapeGroqString(fieldName)}"`; // Escape the whole field name if it's invalid
}

export function sanitizeInput(input: any){
    if(input === null) {
        return 'null'; // Handle null explicitly
    } 
    if(typeof input === 'string') {
        return escapeGroqString(input);
    }
    if(Array.isArray(input)) {
        return input.map(sanitizeInput);
    }
    if(input && typeof input === 'object') {
        const sanitized: Record<string, any> = {};
        for(const key in input) {
            sanitized[key] = sanitizeInput(input[key]);
        }
        return sanitized;
    }      
    return input; 
}