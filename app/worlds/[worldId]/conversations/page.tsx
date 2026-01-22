import { redirect } from "next/navigation";

type Params = { worldId: string };

export default async function ConversationsPage(props: {
  params: Promise<Params>;
}) {
  const { worldId } = await props.params;
  redirect(`/worlds/${worldId}/chat`);
}
