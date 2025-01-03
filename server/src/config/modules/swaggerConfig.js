const path = require("path");

const swaggerConfig = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: process.env.API_TITLE || "Bus API",
            version: process.env.SWAGGER_VERSION || "1.0.0",
            description: "API documentation for Bus project",
            contact: {
                name: process.env.API_CONTACT_NAME || "API Support",
                email: process.env.API_CONTACT_EMAIL || "support@example.com",
                url:
                    process.env.API_CONTACT_URL ||
                    "https://github.com/your-username/Bus",
            },
        },
        servers: [
            {
                url: process.env.API_URL || "http://localhost:3001",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: [
        path.join(__dirname, "../../api/docs/swagger.init.js"),
        path.join(__dirname, "../../api/docs/todo.swaggerConfig.js"),
        path.join(__dirname, "../../api/docs/log.swaggerConfig.js"),
        path.join(__dirname, "../../api/docs/user.swaggerConfig.js"),
        path.join(__dirname, "../../api/**/*.js"),
        path.join(__dirname, "../../appConfig.js"),
    ],
};

module.exports = swaggerConfig;
