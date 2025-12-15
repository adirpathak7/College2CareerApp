import Constants from "expo-constants";

export const uploadToCloudinary = async (uri, type) => {
    const formData = new FormData();

    const fileName = uri.split("/").pop();

    formData.append("file", {
        uri,
        name: fileName,
        type,
    });

    formData.append(
        "upload_preset",
        Constants.expoConfig.extra.CLOUDINARY_UPLOAD_PRESET
    );

    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${Constants.expoConfig.extra.CLOUDINARY_CLOUD_NAME}/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!res.ok) {
        const err = await res.text();
        throw new Error("Cloudinary upload failed: " + err);
    }

    return await res.json();
};
