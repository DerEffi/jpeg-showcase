/**
 * Left padding a number string with zeros
 * @param input number to be padded
 * @param minDigits minimum length of the resulting string
 * @returns string containing zero padded number
 */
export function padLeft(input: number | string, minLength: number): string {
    let s: string = input + "";
    while(s.length < minLength)
        s = "0" + s;
    return s;
}

/**
 * Sanitizing strings
 * @param str unsafe string
 * @returns safe string for further usage
 */
export function sanitize(str: string): string {
    return str.replace(/[^a-z0-9äüöß .,_-]/gim, "").trim();
}