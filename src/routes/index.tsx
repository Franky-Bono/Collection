import { Badge, Box, Card, Grid, Group, Stack, Table, Text, Title } from "@mantine/core";
import { IconBook, IconBook2, IconDeviceGamepad2, IconMovie, IconMusic } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { booksAtom, comicsAtom, moviesAtom, musicAtom, videoGamesAtom, customTypesAtom, customItemsAtom } from "@/state/atoms";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { AnyItem, CustomItem } from "@/types";
import { CustomTypeIcon } from "@/components/collection/CustomTypeIcon";
import { useT } from "@/i18n/useT";
import { useFormatting } from "@/hooks/useFormatting";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

interface StatCardProps {
  label: string;
  count: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ label, count, icon, color, onClick }: StatCardProps) {
  return (
    <Card
      withBorder
      p="sm"
      radius="lg"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : undefined,
        boxShadow: "0 4px 6px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset",
        borderColor: "rgba(255,255,255,0.12)",
        transition: "transform 120ms ease, box-shadow 120ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 16px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.08) inset";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 6px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.06) inset";
      }}
      onClick={onClick}
    >
      <div style={{
        position: "absolute", top: -20, right: -20,
        width: 80, height: 80, borderRadius: "50%",
        background: color, opacity: 0.15, pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 8, right: 8,
        width: 40, height: 40, borderRadius: 10,
        background: `${color}33`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ color, display: "flex" }}>{icon}</div>
      </div>
      <Stack gap={4} style={{ paddingRight: 52 }}>
        <Text size="sm" fw={500} style={{ color: "var(--collection-text)" }}>{label}</Text>
        <Text fw={700} size="2rem" lh={1}>{count}</Text>
      </Stack>
    </Card>
  );
}

function DashboardPage() {
  const t = useT();
  const navigate = useNavigate();
  const { formatNumber, formatDate } = useFormatting();
  const books = useAtomValue(booksAtom);
  const comics = useAtomValue(comicsAtom);
  const videoGames = useAtomValue(videoGamesAtom);
  const movies = useAtomValue(moviesAtom);
  const music = useAtomValue(musicAtom);
  const customTypes = useAtomValue(customTypesAtom);
  const customItemsMap = useAtomValue(customItemsAtom);

  const builtinRecent: { item: AnyItem; type: string }[] = [
    ...books.map((b) => ({ item: b as AnyItem, type: t("dashboard_type_book") })),
    ...comics.map((c) => ({ item: c as AnyItem, type: t("dashboard_type_comic") })),
    ...videoGames.map((g) => ({ item: g as AnyItem, type: t("dashboard_type_videogame") })),
    ...movies.map((m) => ({ item: m as AnyItem, type: t("dashboard_type_movie") })),
    ...music.map((a) => ({ item: a as AnyItem, type: t("dashboard_type_music") })),
  ];

  const customRecent: { item: CustomItem; type: string }[] = customTypes.flatMap((t) =>
    (customItemsMap[t.id] ?? []).map((item) => ({ item, type: t.name }))
  );

  const allRecent = [
    ...builtinRecent.map(({ item, type }) => ({ title: (item as { title: string }).title, type, addedAt: item.addedAt })),
    ...customRecent.map(({ item, type }) => ({ title: item.title, type, addedAt: item.addedAt })),
  ].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()).slice(0, 8);

  const customColors = ["#7c3aed", "#0891b2", "#059669", "#d97706", "#dc2626", "#9333ea"];

  return (
    <Box p="xl">
      <Title order={2} mb="xl">{t("dashboard_title")}</Title>

      <Grid mb="xl" columns={10} gutter="sm">
        <Grid.Col span={{ base: 10, sm: 5, md: 2 }}>
          <StatCard label={t("nav_movies")} count={formatNumber(movies.length)} icon={<IconMovie size={18} />} color="#059669" onClick={() => navigate({ to: "/movies" })} />
        </Grid.Col>
        <Grid.Col span={{ base: 10, sm: 5, md: 2 }}>
          <StatCard label={t("nav_books")} count={formatNumber(books.length)} icon={<IconBook size={18} />} color="#2563eb" onClick={() => navigate({ to: "/books" })} />
        </Grid.Col>
        <Grid.Col span={{ base: 10, sm: 5, md: 2 }}>
          <StatCard label={t("nav_music")} count={formatNumber(music.length)} icon={<IconMusic size={18} />} color="#d97706" onClick={() => navigate({ to: "/music" })} />
        </Grid.Col>
        <Grid.Col span={{ base: 10, sm: 5, md: 2 }}>
          <StatCard label={t("nav_comics")} count={formatNumber(comics.length)} icon={<IconBook2 size={18} />} color="#7c3aed" onClick={() => navigate({ to: "/comics" })} />
        </Grid.Col>
        <Grid.Col span={{ base: 10, sm: 5, md: 2 }}>
          <StatCard label={t("nav_videogames")} count={formatNumber(videoGames.length)} icon={<IconDeviceGamepad2 size={18} />} color="#0891b2" onClick={() => navigate({ to: "/videogames" })} />
        </Grid.Col>
        {customTypes.map((ct, i) => (
          <Grid.Col key={ct.id} span={{ base: 10, sm: 5, md: 2 }}>
            <StatCard
              label={ct.name}
              count={formatNumber((customItemsMap[ct.id] ?? []).length)}
              icon={<CustomTypeIcon iconName={ct.icon} size={18} />}
              color={customColors[i % customColors.length]}
              onClick={() => navigate({ to: `/custom/${ct.id}` })}
            />
          </Grid.Col>
        ))}
      </Grid>

      <Text fw={600} mb="md">{t("dashboard_recently_added")}</Text>
      <Card withBorder p={0}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("dashboard_col_title")}</Table.Th>
              <Table.Th>{t("dashboard_col_type")}</Table.Th>
              <Table.Th>{t("dashboard_col_added")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {allRecent.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" size="sm" ta="center" py="xl">
                    {t("dashboard_no_items")}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              allRecent.map((row, i) => (
                <Table.Tr key={i}>
                  <Table.Td><Text size="sm" fw={500}>{row.title}</Text></Table.Td>
                  <Table.Td><Badge size="sm" variant="light">{row.type}</Badge></Table.Td>
                  <Table.Td><Text size="sm" c="dimmed">{formatDate(row.addedAt)}</Text></Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>
    </Box>
  );
}
