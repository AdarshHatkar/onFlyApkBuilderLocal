import { generateOpenApiDocument } from 'trpc-openapi';
import { mainRouter } from './mainRouter.js';


// Generate OpenAPI schema document
//@ts-ignore
export const openApiDocumentWebApp = generateOpenApiDocument(mainRouter.webApp, {
    title: 'Example CRUD API',
    description: 'OpenAPI compliant REST API built using tRPC with Express',
    version: '1.0.0',
    baseUrl: 'http://192.168.100.9:3005/trpcPublic/webApp/my_tournament',
    docsUrl: 'https://github.com/jlalmes/trpc-openapi',
    tags: ['webApp'],
}); 