/**
 * local version
 */
export type Post = { id: number; title: string };

export type User = { id: number; name: string };

export type LoadPostArgs = {
    id: number;
    withAuthor?: boolean;
};

export type LoadPostResult<T extends LoadPostArgs> = T["withAuthor"] extends true ? Post & { author: User } : Post;

export function loadPost<T extends LoadPostArgs>(args: T): LoadPostResult<T> {
    throw new Error("Not implemented");
}

// p1 is typed `Post`
const p1 = loadPost({ id: 1 });

// p2 is typed `Post & { author: User }`
const p2 = loadPost({ id: 1, withAuthor: true });

/**
 * tRPC version
 */

import { initTRPC } from "@trpc/server";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import * as z from "zod";
const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;
export type AppRouter = typeof appRouter;

const appRouter = router({
    loadPost: publicProcedure
        .input(z.object({ id: z.number(), withAuthor: z.boolean().optional() }))
        .query(({ input }) => loadPost(input)),
});

const trpc = createTRPCProxyClient<AppRouter>({
    links: [
        httpBatchLink({
            url: "http://localhost:3000",
        }),
    ],
});

const t1 = await trpc.loadPost.query({ id: 1 });
const t2 = await trpc.loadPost.query({ id: 1, withAuthor: true });

/**
 * ZenStack tRPC version
 */
import { createRouter } from "./src/server/routers/generated/routers";
import { createTRPCReact } from "./src/server/routers/generated/client/react";

export const zRouter = createRouter(t.router, t.procedure);

export type ZRouter = typeof zRouter;

const zRPC = createTRPCReact<ZRouter>({});

const z1 = zRPC.post.findFirst.useQuery({
    where: { id: "1" },
    select: { id: true, title: true },
}).data;

const z2 = zRPC.post.findFirst.useQuery({
    where: { id: "1" },
    select: { id: true, title: true, author: true },
}).data;
