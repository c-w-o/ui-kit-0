export function makeValidator(schema) {
  if (!window.ajv2020) {
    throw new Error("Ajv2020 not loaded (window.Ajv2020)");
  }

  const ajv = new window.ajv2020({ allErrors: true });
  const validate = ajv.compile(schema);

  return data => ({
    ok: validate(data),
    errors: validate.errors || []
  });
}