import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - compression types will be installed
import * as compression from 'compression';

// Set timezone to IST (Asia/Kolkata) for the entire application
process.env.TZ = 'Asia/Kolkata';

async function bootstrap() {
  // ✅ Secure CORS
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: '*',
      methods: 'GET,POST,PUT,DELETE,PATCH',
      allowedHeaders: 'Content-Type, Authorization',
    },
  });

  // ✅ Response compression for better performance
  app.use(compression());

  // ✅ Helmet Security Middleware
  // ✅ Content Security Policy (CSP)
  // ✅ Strict Transport Security (HSTS)

  const strictSSL = process.env.STRICT_SSL === 'true';

  if (strictSSL) {
    // 🔒 Production — strict security
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            upgradeInsecureRequests: [],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        crossOriginEmbedderPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        hidePoweredBy: true,
        frameguard: true,
        xssFilter: true,
        noSniff: true,
      }),
    );
    console.log('🔐 Strict SSL security enabled');
  } else {
    // 🧪 Dev — relaxed security (Swagger works on HTTP / IP)
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false,
      }),
    );
    console.log('🟢 Relaxed security enabled (no SSL required)');
  }

  app.use((req, res, next) => {
    res.removeHeader('Server');
    next();
  });

  // ✅ Disable caching for API responses to prevent 304 responses
  app.use((req, res, next) => {
    // Disable caching for all API responses
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('TSS Backend')
    .setDescription('REST APIs for TSS Backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'Bearer', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      deepScanRoutes: true,
      displayRequestDuration: true,
    },
  });
  const port = process.env.PORT || 3003;
  await app.listen(port);
  const logger = new Logger();
  logger.log(`Server is running on port ${port}`);
  logger.log(`Swagger is running on http://localhost:${port}/api-docs`);
  logger.log(`API Docs are available at http://localhost:${port}/api-docs`);
}
bootstrap();
