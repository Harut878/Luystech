// Resolve hook. relative import-ը առանց ընդլայնման չգտնվելու դեպքում փորձում է ".ts"
export async function resolve(specifier, context, next) {
  try {
    return await next(specifier, context);
  } catch (err) {
    const relative = specifier.startsWith("./") || specifier.startsWith("../");
    if (err?.code === "ERR_MODULE_NOT_FOUND" && relative && !/\.[a-z0-9]+$/i.test(specifier)) {
      return next(`${specifier}.ts`, context);
    }
    throw err;
  }
}
