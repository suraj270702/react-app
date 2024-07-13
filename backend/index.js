import Fastify from "fastify";
import ajvErrors from "ajv-errors";

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

const schema = {
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string" },
    },
    required: ["name", "email"],
    errorMessage: {
      required: {
        name: "Name is required",
        email: "Email is required",
      },
    },
  },
};

fastify.post(
  "/create",
  { schema, attachValidation: true },
  async (request, reply) => {
    if (request.validationError) {
      //fastify.log.info(request.validationError)
      const errorMessages = request.validationError.validation.map((err) => {
        return err.message;
      });
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
