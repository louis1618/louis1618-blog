const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: '이 사이트에서 볼 수 있는 API들을 확인하세요!',
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = swaggerUi.serve;
const swaggerDocs = swaggerUi.setup(specs);

module.exports = { swaggerSetup, swaggerDocs };
