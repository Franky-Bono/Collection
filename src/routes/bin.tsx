import { createFileRoute } from "@tanstack/react-router";
import { BinPage } from "@/components/bin/BinPage";

export const Route = createFileRoute("/bin")({
  component: BinPage,
});
