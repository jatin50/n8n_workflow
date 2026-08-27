import prisma from "../lib/prisma";
import { decrypt } from "../lib/crypto";

interface ResolvableNode {
  id: string;
  type: string;
  configuration: Record<string, unknown>;
}

interface DbCredential {
  id: string;
  encryptedData: string;
}

// Returns a NEW array — never mutates the DB-sourced node configs, and
// never persists the result anywhere. The decrypted secret only exists in
// memory for the lifetime of a single engine run, injected under a
// double-underscore key so it's obviously internal, never something a
// node's own config UI would show or let a person set directly.
export async function resolveNodeCredentials(
  nodes: ResolvableNode[],
  workspaceId: string
): Promise<ResolvableNode[]> {
  const credentialIds = Array.from(
    new Set(
      nodes
        .map((n) => n.configuration?.credentialId)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );

  if (credentialIds.length === 0) return nodes;

  // Scoped to this workspaceId too, not just the id list — a node can
  // never resolve a credential belonging to a different workspace, even
  // if it somehow had that credential's id in its config.
  const credentials = (await prisma.credential.findMany({
    where: { id: { in: credentialIds }, workspaceId },
  })) as DbCredential[];
  const byId = new Map<string, DbCredential>(credentials.map((c) => [c.id, c]));

  return nodes.map((n) => {
    const credentialId = n.configuration?.credentialId as string | undefined;
    if (!credentialId) return n;

    const credential = byId.get(credentialId);
    if (!credential) return n; // deleted, or not owned by this workspace — silently no-op

    return {
      ...n,
      configuration: {
        ...n.configuration,
        __secretToken: decrypt(credential.encryptedData),
      },
    };
  });
}
