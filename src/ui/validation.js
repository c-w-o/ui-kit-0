export function makeValidator(schema) {
  // ajv7.bundle.min.js exposes either window.ajv7 or window.ajv7.default
  const AjvCtor =
    window.ajv7?.default ||
    window.ajv7 ||
    window.Ajv;

  if (!AjvCtor) {
    throw new Error(
      "AJV not loaded. Expected ajv7.bundle.min.js (window.ajv7)"
    );
  }

  const ajv = new AjvCtor({
    allErrors: true,
    strict: false,     // wichtig bei realen Schemas + json-editor
    messages: true
  });

  const validate = ajv.compile(schema);

  return (data) => {
    const ok = validate(data);
    return {
      ok: !!ok,
      errors: ok ? [] : (validate.errors || [])
    };
  };
}