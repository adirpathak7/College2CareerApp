import 'dotenv/config';

export default {
    expo: {
        name: "College2Career",
        slug: "college2careerapp",
        version: "1.0.0",
        extra: {
            BASE_URL: process.env.BASE_URL
        }
    }
};
