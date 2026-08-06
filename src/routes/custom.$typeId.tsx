import { createFileRoute } from "@tanstack/react-router";
import { CustomCollectionPage } from "@/components/collection/CustomCollectionPage";

export const Route = createFileRoute("/custom/$typeId")({
  component: CustomPage,
});

function CustomPage() {
  const { typeId } = Route.useParams();
  return <CustomCollectionPage typeId={typeId} />;
}
