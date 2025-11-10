function isJSON(value) {
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === "object";
        } catch {
            return false;
        }
    }
    return value && typeof value === "object";
}

module.exports = { isJSON };