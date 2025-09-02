import QRious from "qrious";

export function downloadPNG(url: string, filename: string) {
    const qr = new QRious({ value: url, size: 300 });
    //download the qr code using the data qr and the name 'mypainting.png'
    var link = document.createElement("a");
    link.download = filename + ".png";
    link.href = qr.toDataURL("image/png");
    link.click();
}

export function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(
        function () {
            console.log("Copied to clipboard!");
        },
        function (err) {
            console.error("Async: Could not copy text: ", err);
        },
    );
}

export const getToken = () => {
    return localStorage.getItem("token");
};
export const removeToken = () => {
    localStorage.removeItem("token");
};
export const setToken = (val) => {
    localStorage.setItem("token", val);
};

export function toFormData<TData>(data: TData): FormData {
    const form = new FormData();
    for (const key in data) {
        switch (typeof data[key]) {
            case "undefined":
            case "function":
            default:
                continue;

            case "string":
                form.append(key, data[key]);
                break;

            case "object":
                if (Array.isArray(data[key])) {
                    for (const item of data[key]) {
                        form.append(`${key}[]`, item);
                    }
                    break;
                }

                if (data[key] instanceof Blob || data[key] instanceof File) {
                    form.append(`${key}`, data[key]);
                    break;
                }
                form.append(key, JSON.stringify(data[key]));
                break;

            case "number":
            case "bigint":
            case "boolean":
                form.append(key, data[key].toString());
                break;
        }
    }
    return form;
}
