(async () => {
  const ctx = SillyTavern.getContext();
  if (!ctx.isToolCallingSupported()) return;

  ctx.registerFunctionTool({
    name: "get_spinoza_context",
    displayName: "Spinoza RAG",
    description: "Fetch relevant Spinoza passages from local ChromaDB",
    parameters: {
      $schema: "http://json-schema.org/draft-07/schema#",
      type: "object",
      properties: {
        query: { type: "string", description: "Philosophical question" }
      },
      required: ["query"]
    }
  });

  ctx.onToolExecute(async (execution) => {
    if (execution.name === "get_spinoza_context") {
      const q = execution.args.query;
      try {
        const resp = await fetch("http://localhost:11434/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, top_k: 3 })
        });
        const data = await resp.json();
        const combined = data.results.map(r => r.text).join("\n\n---\n\n");
        execution.complete({ result: combined });
      } catch (e) {
        execution.error({ message: e.toString() });
      }
    }
  });
})();
