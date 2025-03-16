export function UpperCaseFirstChar(str: string) {
    if (str) {
        str = str[0].toLocaleUpperCase() + str.slice(1, str.length).toLocaleLowerCase();
    }

    return str;
}