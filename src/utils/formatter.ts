/**
 * Left padding a number string with zeros
 * @param input number to be padded
 * @param minDigits minimum length of the resulting string
 */
export function padLeft(input: number | string, minLength: number): string {
    let s: string = input + "";
    while(s.length < minLength)
        s = "0" + s;
    return s;
}