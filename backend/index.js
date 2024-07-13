import Fastify from "fastify";
import ajvErrors from "ajv-errors";

//fastify instance
const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  },
  ajv: {
    customOptions: {
      allErrors: true,
      jsonPointers: true,
    },
    plugins: [ajvErrors],
  },
});

// Declare a route
fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

//schema
const schema = {
  body: {
    type: "object",
    properties: {
      name: {
        type: "string",
        minLength: 1,
        errorMessage: {
          minLength: "Name is required",
        },
      },
      email: {
        type: "string",
        format: "email",
        minLength: 1,
        errorMessage: {
          minLength: "Email is required",
          format: "Invalid Email",
        },
      },
      status:{
        type:"string",
        enum:["active","inactive"],
        default:"active",
        errorMessage:{
          enum:"Status should be either active or inactive"
        }
      }
    },
    required: ["name", "email","status"],
    errorMessage: {
      required: {
        name: "Name is required",
        email: "Email is required",
        status:"Status is required"
      },
    },
  },
};

//post endpoint
fastify.post(
  "/create",
  { schema, attachValidation: true },
  async (request, reply) => {
    if (request.validationError) {
      //fastify.log.info(request.validationError);
      const uniquePaths = new Set();
      const errorMessages = request.validationError.validation.reduce(
        (acc, err) => {
          const path = err.instancePath.slice(1);
          if (!uniquePaths.has(path)) {
            uniquePaths.add(path);
            acc.push({ name: path, message: err.message });
          }
          return acc;
        },
        []
      );
      return reply
        .code(400)
        .send({ type: "Validation Error", errors: errorMessages });
    }

    try {
      fastify.log.info({ message: "success" });
      return reply.code(200).send({ message: "Hi" });
    } catch (error) {
      fastify.log.error({ error: "Error Occurred" });
      return reply.code(500).send({ error: "Internal Server Error" });
    }
  }
);

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 8080 });
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
