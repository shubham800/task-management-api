const generateSlug = (name) => {
    return name
        .toLowerCase()                // lowercase
        .trim()                      // remove extra spaces
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-")        // spaces → -
        .replace(/-+/g, "-");        // remove duplicate -
};

export default generateSlug;