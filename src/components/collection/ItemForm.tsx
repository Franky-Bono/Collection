import {
  Button, Group, Modal, NumberInput, Select, Stack, Textarea, TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useT } from "@/i18n/useT";
import type { Book, Comic, VideoGame, Movie, MusicAlbum, AnyItem } from "@/types";

type CollectionKind = "books" | "comics" | "videogames" | "movies" | "music";

interface Props {
  kind: CollectionKind;
  initial?: AnyItem;
  opened: boolean;
  onClose: () => void;
  onSave: (item: AnyItem) => void;
}

const STATUS_OPTIONS: Record<CollectionKind, string[]> = {
  books:      ["Unread", "Reading", "Read", "Wishlist", "Dropped"],
  comics:     ["Unread", "Reading", "Read", "Wishlist", "Owned"],
  videogames: ["Backlog", "Playing", "Completed", "Dropped", "Wishlist"],
  movies:     ["Unwatched", "Watched", "Wishlist"],
  music:      ["Owned", "Wishlist", "Listened"],
};

const FORMAT_OPTIONS: Record<CollectionKind, string[]> = {
  books:      ["Physical", "E-book", "Audiobook"],
  comics:     ["Physical", "Digital"],
  videogames: ["Physical", "Digital"],
  movies:     ["Physical", "Digital", "Streaming"],
  music:      ["Vinyl", "CD", "Cassette", "Digital", "Streaming"],
};

export function ItemForm({ kind, initial, opened, onClose, onSave }: Props) {
  const t = useT();

  const form = useForm({
    initialValues: {
      title: (initial as unknown as Record<string, unknown>)?.title as string ?? "",
      author: (initial as unknown as Record<string, unknown>)?.author as string ?? "",
      artist: (initial as unknown as Record<string, unknown>)?.artist as string ?? "",
      editor: (initial as unknown as Record<string, unknown>)?.editor as string ?? "",
      studio: (initial as unknown as Record<string, unknown>)?.studio as string ?? "",
      director: (initial as unknown as Record<string, unknown>)?.director as string ?? "",
      genre: (initial as unknown as Record<string, unknown>)?.genre as string ?? "",
      year: (initial as unknown as Record<string, unknown>)?.year as number ?? undefined,
      format: (initial as unknown as Record<string, unknown>)?.format as string ?? "",
      status: (initial as unknown as Record<string, unknown>)?.status as string ?? "",
      rating: (initial as unknown as Record<string, unknown>)?.rating as number ?? undefined,
      notes: (initial as unknown as Record<string, unknown>)?.notes as string ?? "",
      platform: (initial as unknown as Record<string, unknown>)?.platform as string ?? "",
      series: (initial as unknown as Record<string, unknown>)?.series as string ?? "",
      issue: (initial as unknown as Record<string, unknown>)?.issue as number ?? undefined,
      publisher: (initial as unknown as Record<string, unknown>)?.publisher as string ?? "",
      condition: (initial as unknown as Record<string, unknown>)?.condition as string ?? "",
      edition: (initial as unknown as Record<string, unknown>)?.edition as string ?? "",
      pages: (initial as unknown as Record<string, unknown>)?.pages as number ?? undefined,
      label: (initial as unknown as Record<string, unknown>)?.label as string ?? "",
      duration: (initial as unknown as Record<string, unknown>)?.duration as string ?? "",
      quality: (initial as unknown as Record<string, unknown>)?.quality as string ?? "",
      country: (initial as unknown as Record<string, unknown>)?.country as string ?? "",
      location: (initial as unknown as Record<string, unknown>)?.location as string ?? "",
      coverUrl: (initial as unknown as Record<string, unknown>)?.coverUrl as string ?? "",
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    const clean = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== "" && v !== undefined));
    const item: AnyItem = {
      id: (initial as AnyItem)?.id ?? crypto.randomUUID(),
      addedAt: (initial as AnyItem)?.addedAt ?? new Date().toISOString(),
      ...clean,
    } as AnyItem;
    onSave(item);
    form.reset();
    onClose();
  });

  return (
    <Modal
      opened={opened}
      onClose={() => { form.reset(); onClose(); }}
      title={initial ? t("form_edit") : t("form_add")}
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput label={t("form_title")} required {...form.getInputProps("title")} />

          {kind === "books"      && <TextInput label={t("form_author")}   {...form.getInputProps("author")} />}
          {kind === "music"      && <TextInput label={t("form_artist")}   {...form.getInputProps("artist")} />}
          {kind === "comics"     && <TextInput label={t("form_editor")}   {...form.getInputProps("editor")} />}
          {kind === "videogames" && <TextInput label={t("form_studio")}   {...form.getInputProps("studio")} />}
          {kind === "movies"     && <TextInput label={t("form_director")} {...form.getInputProps("director")} />}

          {kind === "comics" && (
            <>
              <TextInput  label={t("form_series")}    placeholder={t("form_series_placeholder")}  {...form.getInputProps("series")} />
              <NumberInput label={t("form_issue")}                                                  {...form.getInputProps("issue")} />
              <TextInput  label={t("form_publisher")}                                              {...form.getInputProps("publisher")} />
              <Select
                label={t("form_condition")}
                data={["Poor", "Fair", "Good", "Very Fine", "Near Mint"]}
                clearable
                {...form.getInputProps("condition")}
              />
            </>
          )}

          {kind === "books" && (
            <>
              <TextInput label={t("form_edition")}   {...form.getInputProps("edition")} />
              <NumberInput label={t("form_pages")}   {...form.getInputProps("pages")} />
              <TextInput label={t("form_publisher")} {...form.getInputProps("publisher")} />
            </>
          )}

          {kind === "videogames" && (
            <TextInput label={t("form_platform")} placeholder={t("form_platform_placeholder")} {...form.getInputProps("platform")} />
          )}

          {kind === "movies" && (
            <>
              <TextInput label={t("form_edition")}  {...form.getInputProps("edition")} />
              <TextInput label={t("form_quality")}  placeholder={t("form_quality_placeholder")} {...form.getInputProps("quality")} />
              <TextInput label={t("form_country")}  {...form.getInputProps("country")} />
            </>
          )}

          {kind === "music" && (
            <>
              <TextInput label={t("form_label")}    placeholder={t("form_label_placeholder")}    {...form.getInputProps("label")} />
              <TextInput label={t("form_duration")} placeholder={t("form_duration_placeholder")} {...form.getInputProps("duration")} />
            </>
          )}

          <TextInput label={t("form_genre")} {...form.getInputProps("genre")} />
          <NumberInput label={t("form_year")} min={1800} max={2100} {...form.getInputProps("year")} />

          <Select
            label={t("form_format")}
            data={FORMAT_OPTIONS[kind]}
            clearable
            {...form.getInputProps("format")}
          />
          <Select
            label={t("form_status")}
            data={STATUS_OPTIONS[kind]}
            clearable
            {...form.getInputProps("status")}
          />
          <NumberInput label={t("form_rating")} min={1} max={5} {...form.getInputProps("rating")} />
          <TextInput label={t("form_location")} placeholder={t("form_location_placeholder")} {...form.getInputProps("location")} />
          <TextInput label={t("form_cover_url")} placeholder={t("form_cover_url_placeholder")} {...form.getInputProps("coverUrl")} />
          <Textarea label={t("form_notes")} autosize minRows={2} {...form.getInputProps("notes")} />

          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={() => { form.reset(); onClose(); }}>{t("form_cancel")}</Button>
            <Button type="submit">{t("form_save")}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
