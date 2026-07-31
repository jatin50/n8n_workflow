import prisma from "../lib/prisma";

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
        .slice(0, 60);
}

// Generates a unique workspace slug from a name, appending -2, -3, etc.
// if the base slug is already taken.
export async function generateUniqueWorkspaceSlug(name: string): Promise<string> {
    const base = slugify(name) || "workspace";
    let slug = base;
    let suffix = 1;

    // Small collision space in practice (per-user workspace names), so a
    // simple incrementing loop is fine rather than a random suffix.
    while (await prisma.workspace.findUnique({ where: { slug } })) {
        suffix += 1;
        slug = `${base}-${suffix}`;
    }

    return slug;
}
