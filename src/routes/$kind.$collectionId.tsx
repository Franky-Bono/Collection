import { createFileRoute } from "@tanstack/react-router";
import { SubCollectionPage } from "@/components/collection/SubCollectionPage";

export const Route = createFileRoute("/$kind/$collectionId")({
  component: SubCollectionRoute,
});

function SubCollectionRoute() {
  const { kind, collectionId } = Route.useParams();
  return <SubCollectionPage kind={kind} collectionId={collectionId} />;
}
